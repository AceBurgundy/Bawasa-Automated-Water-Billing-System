// utilities
const {joinAndResolve, logAndSave} = require('../../../utilities/helpers');
const {validateFormData} = require('../../../utilities/validations');
const Response = require('../../../utilities/response');
const {db} = require('../../../utilities/sequelize');

const {ipcMain} = require('electron');
const fs = require('fs-extra');

// functions
const {
  retrieveClientForEdit,
  updateProfilePicture,
  updateClientRecord,
  checkDuplicateData,
  checkMissingFields,
  updatePhoneNumber,
  getClientFiles,
  createClient,
  getFilePath,
  updateFiles,
  savePicture,
  deleteFile,
  saveFiles
} = require('./functions');

const PROFILE_PATH = '../../../../static/images/clients/profile/';
const ICONS_PATH = '../../../../static/images/icons/';

ipcMain.handle('add-client', async (event, formDataArg) => {
  if (!formDataArg) new Response().error('Form data is missing');

  const sentFormData = formDataArg ? JSON.parse(formDataArg) : null;
  const {image, files} = sentFormData;

  if (image) {
    delete sentFormData.image;
  }

  if (files) {
    delete sentFormData.files;
  }

  const formData = sentFormData;

  if (formData === null || Object.keys(formData).length <= 0) {
    return new Response().error('Client details are missing');
  }

  const duplicateValidation = await checkDuplicateData(formData);

  if (duplicateValidation.status === 'failed') {
    return duplicateValidation;
  }

  const missingFields = checkMissingFields(formData);

  if (missingFields) {
    return new Response().error(missingFields);
  }

  const validateResponse = validateFormData(formData);

  if (validateResponse.status === false) {
    const {field, message} = validateResponse;
    return new Response()
        .failed()
        .addToast(message)
        .addFieldError(field, message)
        .getResponse();
  }

  let profilePictureFileName = null;

  try {
    await db.transaction(async manager => {
      const client = await createClient(formData, manager);

      await saveFiles(client, files, manager);

      if (image) {
        const savedPictureFileName = await savePicture(image);
        client.profilePicture = savedPictureFileName;
        profilePictureFileName = savedPictureFileName;
      }

      await client.save({transaction: manager});
    });

    return new Response().ok('Client Succesfully registered');
  } catch (error) {
    logAndSave(error);

    if (profilePictureFileName) {
      await deletePicture(profilePictureFileName);
    }

    // attempt to delete files
    for (const file of files) {
      const filePath = getFilePath(file.name);
      const fileExists = fs.existsSync(filePath);

      try {
        if (fileExists) await fs.unlink(filePath);
      } catch (error) {
        console.log('Failed to delete image', error);
      }
    }

    if (error.type === 'custom') {
      return new Response(error.message);
    }

    return new Response().error('Client not added');
  }
});

// eslint-disable-next-line max-len
ipcMain.handle('edit-client', async (event, formDataArg) => {
  if (!formDataArg) new Response().error('Form data is missing');

  const formData = formDataArg ? JSON.parse(formDataArg) : null;
  const {profilePicture, files, clientId} = formData;

  if (profilePicture) {
    delete formData.profilePicture;
  }

  if (files) {
    delete formData.files;
  }

  if (clientId) {
    delete formData.clientId;
  }

  const client = await retrieveClientForEdit(clientId);

  if (!client) {
    return new Response().error('Client not found');
  }

  if (!formData) {
    return new Response().error('Client details are missing');
  }

  const duplicateValidation = await checkDuplicateData(formData, true, clientId);

  if (duplicateValidation.status === 'failed') {
    return new Response().error(duplicateValidation.toast[0]);
  }

  const missingFields = checkMissingFields(formData);

  if (missingFields) {
    return new Response().error(missingFields);
  }

  const formValidation = validateFormData(formData);

  if (formValidation.status === false) {
    const {field, message} = validateResponse;
    return new Response().failed().addFieldError(field, message).getResponse();
  }

  updateClientRecord(client, formData);

  if (profilePicture) {
    try {
      const newImageFileName = await updateProfilePicture(client, profilePicture);
      client.profilePicture = newImageFileName;
    } catch (error) {
      logAndSave(error);
      return new Response().error('Failed to update client. Error in updating profile picture');
    }
  }

  try {
    await db.transaction(async manager => {
      await updatePhoneNumber(client, formData.phoneNumber, manager);
    });

    await db.transaction(async manager => {
      await updateFiles(client, files, manager);
    });

    await db.transaction(async manager => {
      await client.save({transaction: manager});
    });

    return new Response().ok('Client succesfully updated');
  } catch (error) {
    logAndSave(error);

    const message = error.type === 'phonenumber' ? error.message : 'Failed to update client';
    return new Response().error(message);
  }
});

ipcMain.handle('get-files', async (event, clientId) => {
  if (clientId) {
    const files = await getClientFiles(clientId);
    return new Response().okWithData('files', JSON.stringify(files));
  } else {
    return new Response().error('Client id is required');
  }
});

ipcMain.handle('get-profile-path', async (event, imageName) => {
  return imageName ? joinAndResolve([__dirname, PROFILE_PATH], imageName) : null;
});

ipcMain.handle('get-icon-path', (event, iconName) => {
  return iconName ? joinAndResolve([__dirname, ICONS_PATH], iconName) : null;
});

ipcMain.handle('get-file-path', async (event, filename) => {
  return filename ? getFilePath(filename) : null;
});

ipcMain.handle('delete-file', async (event, args) => {
  if (!args) return new Response().error('Missing args');

  try {
    await deleteFile(args);
    return new Response().ok(`${args.fileName} deleted`);
  } catch (error) {
    logAndSave(error);
    const message = error.type === 'Not found' ? error.message : 'Failed to delete file';
    return new Response().error(message);
  }
});

