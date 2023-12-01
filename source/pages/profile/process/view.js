const {validateFormData} = require('../../../utilities/validations');
const Response = require('../../../utilities/Response');

const {ipcMain} = require('electron');
const path = require('path');

const {
  updateProfilePicture,
  checkMissingFields,
  updatePhoneNumber,
  updateUserRecord,
  retrieveUser
} = require('./functions');

/**
 * Handles the 'get-user-profile-path' IPC message to retrieve the path of a user's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - The name of the users image file.
 * @returns {string} The path to the user's image.
 */
ipcMain.handle('get-user-profile-path', async (event, string) => {
  return path.join(path.resolve(__dirname, '../../assets/images/admin/profile/'), string);
});

/**
 * Handles the 'get-user-default-profile-path' IPC message to retrieve the path of a user's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @returns {string} The path to the default user image.
 */
ipcMain.handle('default-user-image', async event => {
  return path.resolve(__dirname, '../../assets/images/user.png');
});


/**
 * Handles the 'edit-user' IPC message to edit an existing user.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {Object} formDataBuffer - Buffer containing form data.
 * @param {number} userId - The ID of the user being edited.
 * @returns {Promise<Response>} A new Response() object indicating the operation's status.
 */
ipcMain.handle('edit-user', async (event, data) => {
  const {formData, profilePicture} = data.formDataBuffer;
  const userId = data.userId;

  const user = await retrieveUser(userId);

  if (!user) {
    return new Response().error('User not found');
  }

  if (!formData) {
    return new Response().error('User details are missing');
  }

  const duplicateValidation = await checkDuplicateData(formData, true, userId);

  if (duplicateValidation.status === 'failed') {
    return new Response().error(duplicateValidation.toast[0]);
  }

  const missingFields = checkMissingFields(formData);

  if (missingFields) {
    return new Response().error(missingFields);
  }

  const formValidation = validateFormData(formData);

  if (formValidation.status === false) {
    const {field, message} = formValidation;
    return new Response().errorWithData(field, message);
  }

  updateUserRecord(user, formData);
  const oldUserData = user.toJSON();

  const hasProfilePicture = Object.keys(profilePicture).length > 0;

  if (hasProfilePicture) {
    let pictureUpdated = null;

    try {
      pictureUpdated = updateProfilePicture(oldUserData, profilePicture);
    } catch (error) {
      console.log(error);
      return new Response().error('Failed to update user. Error in updating profile picture');
    }

    if (pictureUpdated && pictureUpdated.status === 'success') {
      user.profilePicture = pictureUpdated.imageFileName;
    }
  }

  try {
    await db.transaction(async manager => {
      await updatePhoneNumber(user, formData.phoneNumber, manager);
      await user.save({transaction: manager});
    });

    return new Response().ok('User succesfully updated');
  } catch (error) {
    console.log(error);
    const message = error.type === 'phonenumber' ? error.message : 'Failed to update user';
    return new Response().error(message);
  }
});

