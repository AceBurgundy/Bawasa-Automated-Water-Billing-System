const {joinAndResolve} = require('../../../utilities/helpers');
const Response = require('../../../utilities/Response');

// models
const UserPhoneNumber = require('../../../../models/UserPhoneNumber');
const UserAddress = require('../../../../models/UserAddress');
const User = require('../../../../models/User');

const {Op} = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs-extra');

const requiredFormFields = {
  presentAddressPostalCode: 'Present Address Postal Code',
  presentAddressBarangay: 'Present Address Barangay',
  presentAddressProvince: 'Present Address Province',
  mainAddressPostalCode: 'Main Address Postal Code',
  mainAddressProvince: 'Main Address Province',
  mainAddressBarangay: 'Main Address Barangay',
  presentAddressCity: 'Present Address City',
  relationshipStatus: 'Relationship Status',
  mainAddressCity: 'Main Address City',
  phoneNumber: 'Phone Number',
  middleName: 'Middle Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  birthDate: 'Birthdate',
  email: 'Email',
  age: 'Age'
};

/**
 * Retrieves user information by user ID.
 * @async
 * @function
 * @param {string} userId - The unique identifier of the user.
 * @return {Promise<User | null>} - A promise resolving to
 * the user information or null if not found.
 */
async function retrieveUser(userId) {
  let user = null;

  try {
    user = await User.findByPk(userId, {
      include: [
        {
          model: UserPhoneNumber,
          as: 'phoneNumbers',
          attributes: ['phoneNumber']
        },
        {model: UserAddress, as: 'mainAddress'},
        {model: UserAddress, as: 'presentAddress'}
      ]
    });
  } catch (error) {
    console.log(error);
  }

  return user;
}

/**
 * Checks for missing fields in the provided form data.
 * @function
 * @param {Object} formData - The form data to check for missing fields.
 * @return {Array<string>|null} An array of missing field messages
 * or null if all fields are present.
 */
function checkMissingFields(formData) {
  const formDataFieldNames = Object.keys(formData);
  const requiredFields = Object.keys(requiredFormFields);

  const missingElements = requiredFields.filter(fieldName => {
    return !formDataFieldNames.includes(fieldName);
  });

  if (missingElements.length > 1) {
    const missingFields = missingElements.map(field => {
      return requiredFormFields[field];
    }).join(', ');

    return [`${missingFields} are required`];
  }

  if (missingElements.length === 1) {
    const missingField = requiredFormFields[missingElements[0]];
    return [`${missingField} is required`];
  }

  return null;
}

const PROFILE_PATH = '../../assets/images/users/profile';

/**
 * Saves a user's profile picture to the filesystem.
 * @function
 * @param {Object} profilePicture - The profile picture data to be saved.
 * @return {Object} A new Response() object indicating the status of the operation.
 */
async function savePicture(profilePicture) {
  const takenFromInput = Boolean(profilePicture.fromInput);

  const randomString = crypto.randomBytes(32).toString('hex');
  const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, '').slice(0, 32);

  const imageFormat = takenFromInput ? profilePicture.format : '.png';

  const imageName = [hash, imageFormat].join('.');
  const imagePath = joinAndResolve([__dirname, PROFILE_PATH], imageName);

  try {
    if (takenFromInput) {
      fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path));
    } else {
      const base64Image = profilePicture.base64.split('base64,').pop();
      await fs.promises.writeFile(imagePath, base64Image, {encoding: 'base64'});
    }

    return imageName;
  } catch (error) {
    console.log(error);
    throw Error('Failed in saving users profile picture');
  }
}

/**
 * Checks for duplicate user records based on provided form data.
 * @async
 * @function
 * @param {Object} formData - The form data to check for duplicates.
 * @param {boolean} [forEdit=false] - Indicates if the check is for editing an existing user.
 * @param {number} [userId=null] - The ID of the user being edited.
 * @return {Promise<Object>} An object containing duplicate check results.
 */
async function checkDuplicateUser(formData, forEdit = false, userId = null) {
  const checkDuplicate = async (field, where) => {
    if (forEdit && userId !== null) {
      if (field === 'phone-number') {
        where[Op.and].unshift(
            {
              userId: {[Op.not]: userId}
            }
        );
      } else {
        where[Op.and].unshift(
            {
              id: {[Op.not]: userId}
            }
        );
      }
    }

    let duplicates = null;

    try {
      if (field === 'phone-number') {
        duplicates = await ClientPhoneNumber.findAndCountAll({where});
      } else {
        duplicates = await Client.findAndCountAll({where});
      }
    } catch (error) {
      console.log(error);
      return new Response().error('Error in checking for client duplicates');
    }

    if (duplicates.count > 0) {
      const data = data.split('-').join(' ');
      return new Response().error(`Client with the same ${data} is already registered`);
    }

    return new Response().ok();
  };

  const duplicateChecks = [

    {
      field: 'full-name', where: {
        [Op.and]: [
          {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName
          }
        ]
      }
    },

    {
      field: 'user-email', where: {
        [Op.and]: [
          {
            email: formData.email
          }
        ]
      }
    },

    {
      field: 'phone-number', where: {
        [Op.and]: [
          {
            phoneNumber: formData.phoneNumber
          }
        ]
      }
    },

    {
      field: 'meter-number', where: {
        [Op.and]: [
          {
            meterNumber: formData.meterNumber
          }
        ]
      }
    }
  ];

  for (const check of duplicateChecks) {
    const duplicateValidation = await checkDuplicate(check.field, check.where);
    if (duplicateValidation.status === 'failed') return duplicateValidation;
  }

  return new Response().ok();
}

/**
 * Updates a user record with the provided form data.
 *
 * @function
 * @param {User} user - The user object to be updated.
 * @param {Object} formData - The form data containing the fields to be updated.
 */
function updateUserRecord(user, formData) {
  for (const key in formData) {
    // Skips these fields as this keys have a fixed value on creation
    if (key === 'profilePicture') continue;

    // Updates main address fields
    if (key.includes('mainAddress')) {
      const addressKey = key.replace('mainAddress', '');
      const modifiedAddressKey = addressKey.charAt(0).toLowerCase() + addressKey.slice(1);
      user.mainAddress[modifiedAddressKey] = formData[key];
      continue;
    }

    // Updates present address fields
    if (key.includes('presentAddress')) {
      const addressKey = key.replace('presentAddress', '');
      user.presentAddress[addressKey] = formData[key];
      continue;
    }

    // Updates other user fields
    user[key] = formData[key];
  }
}

/**
* Updates a user's profile picture by saving the new picture, deleting the old picture
* if it exists, and returning a success Response object with the new image file name.
* @function
* @param {Object} oldUserData - An object containing the old user data,
* including the current profile picture path.
* @param {string|Buffer} profilePicture - The new profile picture data.
* It could be an image file or any data representing the picture.
* @return {Response} A new Response object representing the result of the update operation.
*/
async function updateProfilePicture(oldUserData, profilePicture) {
  try {
    await savePicture(profilePicture);
  } catch (error) {
    return new Response().error(error.message);
  }

  if (oldUserData.profilePicture) {
    const oldProfilePicturePath = joinAndResolve(
        [__dirname, '../../assets/images/users/profile/'],
        oldUserData.profilePicture
    );

    fs.unlink(oldProfilePicturePath, error => {
      if (error) {
        console.error('Error deleting users old profile picture:', error);
        return new Response().error('Failed to add new user');
      }
    });
  }

  return new Response().okWithData('imageFileName', saveStatus.imageName);
}

/**
 * Updates a user's phone number by adding a new phone number if it does not already exist.
 *
 * @function
 * @param {User} user - The user object.
 * @param {string} phoneNumberInputValue - The new phone number to be added.
 * @param {Transaction} manager - Optional transaction manager for performing
 * the connection status creation within a specified transaction.
 */
async function updatePhoneNumber(user, phoneNumberInputValue, manager) {
  const alreadyExists = user.phoneNumbers.filter(eachRecord => {
    return eachRecord.phoneNumber === phoneNumberInputValue;
  }).length > 0;

  if (alreadyExists) {
    const error = new Error('Failed to update user. Phonenumber already exists');
    error.type = 'phonenumber';
    throw error;
  }

  const whereClause = {
    userId: user.id,
    phoneNumber: phoneNumberInputValue
  };

  await UserPhoneNumber.create(whereClause, {transaction: manager});
}

module.exports = {
  updateProfilePicture,
  checkDuplicateUser,
  updateUserRecord,
  checkMissingFields,
  updatePhoneNumber,
  retrieveUser,
  savePicture
};
