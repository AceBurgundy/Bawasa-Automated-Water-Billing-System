// models
const ClientConnectionStatus = require('../../../../models/ClientConnectionStatus');
const ClientPhoneNumber = require('../../../../models/ClientPhoneNumber');
const ClientAddress = require('../../../../models/ClientAddress');
const ClientFile = require('../../../../models/ClientFile');
const Client = require('../../../../models/Client');

// utilities
const {connectionStatusTypes} = require('../../../utilities/constants');
const exportRecord = require('../../../utilities/export');
const Response = require('../../../utilities/response');

const {
  generateNextAccountOrBillNumber,
  joinAndResolve
} = require('../../../utilities/helpers');

const {db} = require('../../../utilities/sequelize');
const {Op} = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

// eslint-disable-next-line no-unused-vars
const requiredFormFields = {
  presentAddressPostalCode: 'Present Address Postal Code',
  presentAddressBarangay: 'Present Address Barangay',
  presentAddressProvince: 'Present Address Province',
  mainAddressPostalCode: 'Main Address Postal Code',
  mainAddressBarangay: 'Main Address Barangay',
  mainAddressProvince: 'Main Address Province',
  presentAddressCity: 'Present Address City',
  relationshipStatus: 'Relationship Status',
  mainAddressCity: 'Main Address City',
  phoneNumber: 'Phone Number',
  middleName: 'Middle Name',
  occupation: 'Occupation',
  firstName: 'First Name',
  birthDate: 'Birthdate',
  lastName: 'Last Name',
  email: 'Email',
  age: 'Age'
};

const PROFILE_PATH = '../../../assets/images/clients/profile';

const getFilePath = filename => joinAndResolve([__dirname, '../../../assets/files/'], filename);

/**
 * Creates a new client with the provided form data using Sequelize models.
 * @async
 * @function
 * @param {object} formData - The form data for creating the client.
 * @param {object} manager - The Sequelize transaction manager for atomic operations.
 * @throws {Error} Throws a custom error if the creation fails.
 * @return {Promise<object>} A Promise that resolves to the created client.
 */
async function createClient(formData, manager) {
  let client = null;

  try {
    client = await Client.create({

      accountNumber: await generateNextAccountOrBillNumber('Client'),
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      extension: formData.extension,
      relationshipStatus: formData.relationshipStatus,
      birthDate: formData.birthDate,
      age: formData.age,
      email: formData.email,
      occupation: formData.occupation,
      profilePicture: 'user.webp',
      housePicture: 'template_house.webp',
      meterNumber: formData.meterNumber,
      mainAddress: {
        street: formData.mainAddressStreet,
        subdivision: formData.mainAddressSubdivision,
        barangay: formData.mainAddressBarangay,
        city: formData.mainAddressCity,
        province: formData.mainAddressProvince,
        postalCode: formData.mainAddressPostalCode,
        details: formData.mainAddressDetails
      },
      presentAddress: {
        street: formData.presentAddressStreet,
        subdivision: formData.presentAddressSubdivision,
        barangay: formData.presentAddressBarangay,
        city: formData.presentAddressCity,
        province: formData.presentAddressProvince,
        postalCode: formData.presentAddressPostalCode,
        details: formData.presentAddressDetails
      }
    },
    {
      include: [
        {model: ClientAddress, as: 'mainAddress'},
        {model: ClientAddress, as: 'presentAddress'}
      ],
      transaction: manager
    });

    await createNewPhoneNumber(client.id, formData.phoneNumber, manager);
    await createNewConnectionStatus(client.id, manager);
  } catch (error) {
    console.log(error);
    if (error.type === 'custom') throw error;

    const customError = new Error('Failed to create a new client');
    customError['type'] = 'custom';
    throw customError;
  }

  return client;
}

/**
 * Creates a new phone number for a client, with an optional manager for the transaction.
 *
 * @async
 * @function
 * @param {number} clientId - The unique identifier of the client for whom the new
 * phone number is being created.
 * @param {string} phoneNumber - The phone number to create for the client.
 * @param {Transaction} manager - transaction manager for performing
 * the phone number creation within a specified transaction.
 * @throws {Error} Throws an error if the client is not saved or if there is an error
 * in saving the new phone number.
 */
async function createNewPhoneNumber(clientId, phoneNumber, manager) {
  const whereClause = {
    clientId: clientId,
    phoneNumber: phoneNumber
  };

  try {
    await ClientPhoneNumber.create(whereClause, {transaction: manager});
  } catch (error) {
    console.log(error);
    const customError = new Error('Client not saved. Error in saving new phone number');
    customError['type'] = 'custom';
    throw customError;
  }
}

/**
 * Creates a new connection status for a client with an optional manager for the transaction.
 *
 * @async
 * @function
 * @param {number} clientId - The unique identifier of the client for whom the new
 * connection status is being created.
 * @param {Transaction} manager - Optional transaction manager for performing
 * the connection status creation within a specified transaction.
 * @throws {Error} Throws an error if the client is not saved or if there is an error
 * in saving the new connection status. The error message may indicate a validation error
 * if the provided connection status type is not valid.
 */
async function createNewConnectionStatus(clientId, manager) {
  const whereClause = {
    clientId: clientId,
    status: connectionStatusTypes.Connected
  };

  try {
    await ClientConnectionStatus.create(whereClause, {transaction: manager});
  } catch (error) {
    console.log(error);

    const customError = new Error('Client not saved. Failed to add connection status.');
    customError['type'] = 'custom';

    if (error.name === 'SequelizeValidationError') {
      const sqlErrorMessage = error.message.split(': ')[1];
      customError['message'] = sqlErrorMessage + ' please choose the correct connection status';
    }

    throw customError;
  }
}

/**
 * Retrieves client information for editing,
 * including associated phone numbers, addresses, and connection statuses.
 *
 * @async
 * @function
 * @param {number} clientId - The unique identifier of the client to retrieve for editing.
 * @return {Promise<Client|null>} A Promise that resolves with the
 * retrieved client object or null if an error occurs.
 */
async function retrieveClientForEdit(clientId) {
  let client = null;

  try {
    client = await Client.findByPk(clientId, {
      include: [
        {
          model: ClientPhoneNumber,
          as: 'phoneNumbers',
          attributes: ['phoneNumber']
        },
        {model: ClientAddress, as: 'mainAddress'},
        {model: ClientAddress, as: 'presentAddress'},
        {
          model: ClientConnectionStatus,
          as: 'connectionStatuses',
          attributes: ['status']
        }
      ]
    });
  } catch (error) {
    console.error(error);
  }

  return client;
}

/**
 * Updates a client record with the provided form data.
 *
 * @function
 * @param {Client} client - The client object to be updated.
 * @param {Object} formData - The form data containing the fields to be updated.
 */
function updateClientRecord(client, formData) {
  for (const key in formData) {
    if (!formData[key]) continue;

    // Skips these fields as this keys have a fixed value on creation
    if (key === 'profilePicture' || key === 'accountNumber') continue;

    // Updates main address fields
    if (key.includes('mainAddress')) {
      const addressKey = key.replace('mainAddress', '');
      const modifiedAddressKey = addressKey.charAt(0).toLowerCase() + addressKey.slice(1);
      client.mainAddress[modifiedAddressKey] = formData[key];
      continue;
    }

    // Updates present address fields
    if (key.includes('presentAddress')) {
      const addressKey = key.replace('presentAddress', '');
      client.presentAddress[addressKey] = formData[key];
      continue;
    }

    // Updates other client fields
    client[key] = formData[key];
  }
}

/**
 * Updates a client's phone number by adding a new phone number if it does not already exist.
 *
 * @function
 * @param {Client} client - The client object.
 * @param {string} phoneNumberInputValue - The new phone number to be added.
 * @param {Transaction} manager - Optional transaction manager for performing
 * the connection status creation within a specified transaction.
 */
async function updatePhoneNumber(client, phoneNumberInputValue, manager) {
  if (client.phoneNumbers && client.phoneNumbers.length <= 0) return;

  const alreadyExists = client.phoneNumbers.filter(eachRecord => {
    return eachRecord.phoneNumber === phoneNumberInputValue;
  }).length > 0;

  if (alreadyExists) return;

  const whereClause = {
    clientId: client.id,
    phoneNumber: phoneNumberInputValue
  };

  await ClientPhoneNumber.create(whereClause, {transaction: manager});
}

/**
* Updates a client's profile picture by saving the new picture, deleting the old picture
* if it exists, and returning a success Response object with the new image file name.
* @function
* @param {Object} oldClientData - An object containing the old client data,
* including the current profile picture path.
* @param {string|Buffer} profilePicture - The new profile picture data.
* It could be an image file or any data representing the picture.
* @return {Response} A new Response object representing the result of the update operation.
*/
async function updateProfilePicture(oldClientData, profilePicture) {
  try {
    await savePicture(profilePicture);
  } catch (error) {
    return new Response().error(error.message);
  }

  if (oldClientData.profilePicture) {
    const oldProfilePicturePath = joinAndResolve(
        [__dirname, '../../../assets/images/clients/profile/'],
        oldClientData.profilePicture
    );

    fs.unlink(oldProfilePicturePath, error => {
      if (error) {
        console.error('Error deleting client old profile picture:', error);
        return new Response().error('Failed to add new client');
      }
    });
  }

  return new Response().okWithData('imageFileName', saveStatus.imageName);
}


/**
 * Checks for duplicate client records based on provided form data.
 *
 * @async
 * @function
 * @param {Object} formData - The form data to check for duplicates.
 * @param {boolean} [forEdit=false] - Indicates if the check is for editing an existing client.
 * @param {number} [clientId=null] - The ID of the client being edited.
 * @return {Promise<Object>} An object containing duplicate check results.
 */
async function checkDuplicateData(formData, forEdit = false, clientId = null) {
  const checkDuplicate = async (field, where) => {
    if (forEdit && clientId !== null) {
      if (field === 'phone-number') {
        where[Op.and].unshift({
          clientId: {[Op.not]: clientId}
        });
      } else {
        where[Op.and].unshift({
          id: {[Op.not]: clientId}
        });
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
      field = field.split('-').join(' ');
      const errorMessage = `Client with the same ${field} is already registered`;
      return new Response().failed()
          .addToast(errorMessage)
          .addFieldError(field, errorMessage)
          .getResponse();
    }

    return new Response().ok();
  };

  const duplicateChecks = [
    {
      field: 'full-name',
      where: {
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
      field: 'email',
      where: {
        [Op.and]: [
          {
            email: formData.email
          }
        ]
      }
    },

    {
      field: 'phone-number',
      where: {
        [Op.and]: [
          {
            phoneNumber: formData.phoneNumber
          }
        ]
      }
    },

    {
      field: 'meter-number',
      where: {
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
 * Saves a client's profile picture to the filesystem.
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
  const imagePath = path.join(__dirname, PROFILE_PATH, imageName);

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
    throw Error('Failed in saving clients profile picture');
  }
}

/**
 * Deletes the clients picture especially if client wasnt saved.
 *
 * @param {String} imageName - The filename for the image
 */
async function deletePicture(imageName) {
  if (!imageName) return;

  const imagePath = path.join(__dirname, PROFILE_PATH, imageName);
  const imageExists = fs.existsSync(imagePath);

  if (imageExists) {
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.log('Failed to delete image', error);
    }
  }
}

/**
 * Checks for missing fields in the provided form data.
 * @function
 * @param {Object} formData - The form data to check for missing fields.
 * @return {string[]|null} An array of missing field messages or null if all fields are present.
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
 * Gets the files for a client.
 * @async
 * @param {number} clientIdArg - The client id to associate the files with.
 * @return {Promise<Array<Object>>} Array of clientFile objects or null.
 */
async function getClientFiles(clientIdArg) {
  let clientFiles = null;

  try {
    clientFiles = await ClientFile.findAll({
      attributes: ['name'],
      where: {
        clientId: clientIdArg
      }
    });

    if (clientFiles) {
      return clientFiles.map(file => {
        return {name: file.name};
      });
    }
  } catch (error) {
    console.log(error);
  }

  return clientFiles;
}

/**
 * Saves files associated with a client.
 * @async
 * @function
 * @param {Client} client - The client object.
 * @param {Array<Object>} files - Array of file objects to be saved.
 * @param {TransactionManager} manager - The transaction manager for database operations.
 * @throws {Error} Throws an error if the file saving process fails.
 */
async function saveFiles(client, files, manager) {
  if (files.length <= 0) return;

  const copiedFiles = [];

  try {
    const saveFilePromises = files.map(async file => {
      const newFileName = [client.fullName, file.name].join(' ');
      const whereClause = {
        clientId: client.id,
        name: file.name
      };

      const endPath = getFilePath(newFileName);

      await ClientFile.create(whereClause, {transaction: manager});
      await fs.copyFile(file.path, endPath);
      copiedFiles.push(endPath);
    });

    await Promise.all(saveFilePromises);
  } catch (error) {
    console.log(error);
    throw Error(`Client not added. Error in saving client's documents`);
  }
}

/**
 * Updates files associated with a client.
 * @async
 * @function
 * @param {Client} client - The client object.
 * @param {Array<Object>} files - Array of file objects to be saved.
 * @param {TransactionManager} manager - The transaction manager for database operations.
 * @throws {Error} Throws an error if the file saving process fails.
 */
async function updateFiles(client, files, manager) {
  if (files.length <= 0) return;

  const copiedFiles = [];

  try {
    const updateFilePromises = files.map(async file => {
      const fileName = [client.fullName, file.name].join(' ');
      const endPath = getFilePath(fileName);

      const fileExistRecord = await ClientFile.findOne({
        where: {
          name: file.name
        }
      });

      if (fs.existsSync(endPath) || !!fileExistRecord) return;

      const whereClause = {
        clientId: client.id,
        name: file.name
      };

      await ClientFile.create(whereClause, {transaction: manager});
      await fs.copyFile(file.path, endPath);
      copiedFiles.push(endPath);
    });

    await Promise.all(updateFilePromises);
  } catch (error) {
    console.log(error);
    throw Error(`Client not added. Error in saving client's documents`);
  }
}

/**
 * Deletes multiple files.
 * @async
 * @function
 * @param {Array<string>} files - Array of file paths to be deleted.
 * @throws {Error} Throws an error if any file deletion operation fails.
 */
async function deleteFiles(files) {
  if (files.length <= 0) return;

  const fileDeletionPromises = files.map(file => {
    deleteFile(file)
        .catch(error => {
          return console.error(`Error in deleting file: ${error}`);
        });
  });

  await Promise.all(fileDeletionPromises);
}

/**
 * Deletes a file by its name.
 * @async
 * @function
 * @param {Object} args - Object containing fileName and clientId.
 * @param {string} args.fileName - The name of the file to be deleted.
 * @param {string} args.clientId - The id of the client who owns the file.
 * @throws {Error} Throws an error if the file does not exist or if the deletion fails.
 */
async function deleteFile(args) {
  const {fileName, clientId} = args;

  const client = await Client.findByPk(clientId);
  const file = await ClientFile.findOne({
    where: {
      name: fileName
    }
  });

  if (!file) {
    const error = new Error('File not found');
    error.type = 'Not found';
  }

  if (!client) {
    const error = new Error('Client not found');
    error.type = 'Not found';
  }

  const filePath = getFilePath([client.fullName, fileName].join(' '));
  const fileExists = fs.existsSync(filePath);

  const error = new Error('File does not exist');
  error.type = 'Not found';

  if (!fileExists) throw error;

  await db.transaction(async manager => {
    await file.destroy({transaction: manager});
  });

  await fs.unlink(filePath);
}

/**
 * Deletes a client and their associated files, if any.
 * If the client's one-to-many associations have cascade set to true on delete,
 * this function will also delete their records on that data.
 *
 * @async
 * @function
 * @param {number} clientId - The unique identifier of the client to delete.
 * @param {Event} event - The event triggering the client deletion.
 * @return {Promise<Response>} A Promise that resolves with a Response object
 * representing the result of the delete operation. The Response object can be
 * used to check the success or failure of the operation.
 * @throws {Error} Throws an error if the client id is not found or if the deletion fails.
 * @example
 * ```
 * const clientId = 123
 * const response = await deleteClient(clientId, event)
 *
 * if (response.status === 'success') {
 *   console.log('Client deleted successfully.')
 *} else {
 *   console.error('Failed to delete client:', [...response.toast])
 *}
 * ```
 */
async function deleteClient(clientId, event) {
  if (!clientId) throw new Error('Client id not found');

  const exportResponse = await exportRecord(clientId, event);

  if (exportResponse.status === 'failed') {
    return exportResponse;
  }

  const client = await Client.findByPk(clientId, {
    include: 'clientFiles'
  });

  if (!client) throw new Error('Failed to delete client record');

  try {
    await deleteFiles(client.clientFiles);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete client files');
  }

  try {
    await client.destroy();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete client');
  }

  return new Response().ok().addToast('Client deleted successfully');
}

module.exports = {
  createNewConnectionStatus,
  retrieveClientForEdit,
  updateProfilePicture,
  createNewPhoneNumber,
  checkDuplicateData,
  checkMissingFields,
  updateClientRecord,
  updatePhoneNumber,
  getClientFiles,
  deletePicture,
  deleteClient,
  createClient,
  updateFiles,
  getFilePath,
  savePicture,
  deleteFiles,
  deleteFile,
  saveFiles
};
