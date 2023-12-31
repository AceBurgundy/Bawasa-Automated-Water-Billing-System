const {emitEvent, logAndSave} = require('../../../utilities/helpers');
const {validateFormData} = require('../../../utilities/validations');
const Response = require('../../../utilities/response');
const {db} = require('../../../utilities/sequelize');

const {ipcMain} = require('electron');
const path = require('path');

const {
  updateProfilePicture,
  checkMissingFields,
  checkDuplicateUser,
  updatePhoneNumber,
  updateUserRecord,
  retrieveUser
} = require('./functions');

ipcMain.handle('get-user-profile-path', async (event, string) => {
  return path.join(path.resolve(__dirname, '../../../../static/images/admin/profile/'), string);
});

ipcMain.handle('default-user-image', async event => {
  return path.resolve(__dirname, '../../../../static/images/user.png');
});

ipcMain.handle('edit-user', async (event, data) => {
  /**
   * profilePicture will currently always be null as the submission function inside main/profile.js
   * does not include submission of user profilePicture.
   * This code is here if such feature will be added in the future.
   */
  const {formData, profilePicture} = data.formDataBuffer;
  const userId = data.userId;

  const user = await retrieveUser(userId);

  if (!user) {
    return new Response().error('User not found');
  }

  if (!formData) {
    return new Response().error('User details are missing');
  }

  const duplicateValidation = await checkDuplicateUser(formData, true, userId);

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
    return new Response().failed().addFieldError(field, message).getResponse();
  }

  if (profilePicture) {
    let pictureUpdated = null;

    try {
      pictureUpdated = updateProfilePicture(user, profilePicture);
    } catch (error) {
      logAndSave(error);
      return new Response().error('Failed to update user. Error in updating profile picture');
    }

    if (pictureUpdated && pictureUpdated.status === 'success') {
      user.profilePicture = pictureUpdated.imageFileName;
    }
  }

  try {
    await db.transaction(async manager => {
      await updateUserRecord(user, formData, manager);
      await updatePhoneNumber(user, formData.phoneNumber, manager);
      await user.save({transaction: manager});
    });

    return new Response().ok('User succesfully updated');
  } catch (error) {
    logAndSave(error);
    if (error.name = 'SequelizeValidationError') {
      if (error.errors) {
        error.errors.forEach(error => {
          emitEvent(error.message);
        });
      }
    }
    const message = error.type === 'phonenumber' ? error.message : 'Failed to update user';
    return new Response().error(message);
  }
});

