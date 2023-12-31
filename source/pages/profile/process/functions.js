const {joinAndResolve, logAndSave} = require('../../../utilities/helpers');
const Response = require('../../../utilities/response');

// models
const UserPhoneNumber = require('../../../../models/UserPhoneNumber');
const UserAddress = require('../../../../models/UserAddress');
const User = require('../../../../models/User');

const {Op} = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs-extra');

const PROFILE_PATH = '../../../../static/images/users/profile';

const requiredFormFields = {
  presentAddressPostalCode: 'Present Address Postal Code',
  presentAddressBarangay: 'Present Address Barangay',
  mainAddressPostalCode: 'Main Address Postal Code',
  presentAddressRegion: 'Present Address Region',
  mainAddressBarangay: 'Main Address Barangay',
  presentAddressCity: 'Present Address City',
  relationshipStatus: 'Relationship Status',
  mainAddressRegion: 'Main Address Region',
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
    logAndSave(error);
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
  const formDataFields = Object.keys(formData);
  const requiredFields = Object.keys(requiredFormFields);

  const missingFields = requiredFields.reduce((accumulator, fieldName) => {
    const fieldNotInFormData = !formDataFields.includes(fieldName);
    const isPresent = formData[fieldName] !== undefined && formData[fieldName] !== null;
    const isPresentButEmpty = isPresent && formData[fieldName].trim() === '';
    if (fieldNotInFormData || isPresentButEmpty) accumulator.push(requiredFormFields[fieldName]);
    return accumulator;
  }, []);

  if (missingFields.length > 1) {
    return [`${missingFields.join(', ')} are required`];
  }

  if (missingFields.length === 1) {
    return [`${missingFields[0]} is required`];
  }

  return null;
}

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
    logAndSave(error);
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
        duplicates = await UserPhoneNumber.findAndCountAll({where});
      } else {
        duplicates = await User.findAndCountAll({where});
      }
    } catch (error) {
      logAndSave(error);
      return new Response().error('Error in checking for user duplicates');
    }

    if (duplicates.count > 0) {
      field = field.split('-').join(' ');
      return new Response().error(`User with the same ${field} is already registered`);
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
 * @async
 * @param {User} user - The user object to be updated.
 * @param {Object} formData - The form data containing the fields to be updated.
 * @param {Sequelize.Transaction} manager - the transaction used to save the data
 * @return {Promise<void>}
 */
async function updateUserRecord(user, formData, manager) {
  const extractDbKey = (field, addressType) => {
    const addressKey = field.replace(addressType, '');
    return addressKey.charAt(0).toLowerCase() + addressKey.slice(1);
  };

  for (const key in formData) {
    if (!formData[key]) continue;

    if (key === 'profilePicture') continue;

    const hasPresentAddress = key.includes('presentAddress') && user.presentAddress;
    const hasMainAddress = key.includes('mainAddress') && user.mainAddress;

    // Updates main address fields
    if (hasMainAddress) {
      user.mainAddress[extractDbKey(key, 'mainAddress')] = formData[key];
      continue;
    }

    // Updates present address fields
    if (hasPresentAddress) {
      user.presentAddress[extractDbKey(key, 'presentAddress')] = formData[key];
      continue;
    }

    // Updates other user fields
    user[key] = formData[key];
  }

  // no main and present address
  if (user.mainAddress) {
    await user.mainAddress.save({transaction: manager});
  } else {
    const mainAddressDataObject = {};

    Object.entries(formData).forEach(([field, value]) => {
      if (field.includes('mainAddress')) {
        mainAddressDataObject[extractDbKey(field, 'mainAddress')] = value;
      }
    });

    const mainAddress = await UserAddress.create(mainAddressDataObject, {
      transaction: manager
    });
    user.setMainAddress(mainAddress);
  }

  if (user.presentAddress) {
    await user.presentAddress.save({transaction: manager});
  } else {
    const presentAddressDataObject = {};

    Object.entries(formData).forEach(([field, value]) => {
      if (field.includes('presentAddress')) {
        presentAddressDataObject[extractDbKey(field, 'presentAddress')] = value;
      }
    });

    const presentAddress = await UserAddress.create(presentAddressDataObject, {
      transaction: manager
    });
    user.setPresentAddress(presentAddress);
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
        [__dirname, '../../../../static/images/users/profile/'],
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
  if (user.phoneNumbers && user.phoneNumbers.length <= 0) return;

  const alreadyExists = user.phoneNumbers.filter(eachRecord => {
    return eachRecord.phoneNumber === phoneNumberInputValue;
  }).length > 0;

  if (alreadyExists) return;

  const whereClause = {
    userId: user.id,
    phoneNumber: phoneNumberInputValue
  };

  await UserPhoneNumber.create(whereClause, {transaction: manager});
}

module.exports = {
  updateProfilePicture,
  checkMissingFields,
  checkDuplicateUser,
  updatePhoneNumber,
  updateUserRecord,
  retrieveUser,
  savePicture
};
