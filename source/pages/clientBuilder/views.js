// Database
const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const Client = require("../../../models/Client")

// Utilities
const { connectionStatusTypes } = require("../../utilities/constants")
const { validateFormData } = require("../../utilities/validations")
const response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")

// API
const { ipcMain } = require("electron")
const fs = require("fs-extra")
const path = require("path")

const { 
    throwAndLogError,
    joinAndResolve
} = require("../../utilities/helpers")

// Functions
const { 
    retrieveClientDocumentFilepath,
    updateClientProfilePicture,
    createNewConnectionStatus,
    updateClientPhoneNumber,
    retrieveClientForEdit,
    createNewPhoneNumber,
    updateClientRecord,
    checkDuplicateData,
    checkMissingFields,
    getClientFiles,
    deletePicture,
    createClient,
    savePicture,
    deleteFiles,
    saveFiles,
    deleteFile,
} = require("./functions")

const PROFILE_PATH = "../../assets/images/clients/profile/"
const ICONS_PATH = "../../assets/images/icons/"

ipcMain.handle("add-client", async (event, formDataBuffer) => {
    
    const formData = formDataBuffer.formData
    const profilePicture = formDataBuffer.image
    const files = formDataBuffer.files

    if (formData === null || Object.keys(formData).length <= 0) {
        return response.Error("Client details are missing")
    }

    const clientDuplicate = await checkDuplicateData(formData)

    if (clientDuplicate.hasDuplicate) {
        return response.Error(clientDuplicate.message)
    }

    const missingFields = checkMissingFields(formData)

    if (missingFields) {
        return response.Error(missingFields)
    }

    const validateResponse = validateFormData(formData)

    if (validateResponse.status === false) {
        const { field, message } = validateResponse
        return response.failed().addFieldError(field, message).getResponse()
    }

	let message = ""
	let fullName = null
	let profilePictureName = null

	try {
        
		await db.transaction(async manager => {

			try {
                
				let client = null

                try {
                    client = await createClient(formData, manager)
                } catch (error) {
                    throwAndLogError(error, "Failed to add new client")
                }
	
                fullName = client.fullName

				try {
                    await saveFiles(client, files, manager)
                } catch (error) {
                    let message = "Client not added. Error in saving client's documents"
                    if (error.message.includes("dest")) {
                        message = [newFileName, "already exists. Rename the file and try again."].join(' ')
                    }
                    throwAndLogError(error, message)
                }
	
				// Create a new client phone number record.
				try {
					await createNewPhoneNumber(client.id, formData.phoneNumber, manager)
				} catch (error) {
					throwAndLogError(error,"Failed to add phone number to new client")
				}
	
                try {
					await createNewConnectionStatus(client.id, formData.phoneNumber, manager)
				} catch (error) {
                    if (error.name === "SequelizeValidationError") {
                        throw new Error(error.message.split(': ')[1] + " please choose the correct connection status")
                    } else {
                        throw new Error("Client not saved. Failed to add connection status to new client")
                    }
				}
	
                try {
                    client.profilePicture = await savePicture(profilePicture)
                } catch (error) {
                    try {
                        if (fs.existsSync(imagePath)) {
                            await fs.unlink(imagePath)
                        }
                    } catch (error) {
                        console.log("Failed to delete recently inserted image")
                    }
                    throw new Error(error, "Client not added. Caused by failure in saving their profile picture.")
                }

                client.profilePicture = saveImageResult.imageName
                profilePictureName = saveImageResult.imageName
					
			} catch (error) {

                await deletePicture(profilePictureName)
				
                try {
                    deleteFiles(fullName, files)
                } catch {
                    console.log("Failed to remove a file")
                }

                message = error.message
				manager.rollback()
			}
	
		})

    } catch (error) {
		console.log(error);
		return response.Error("Client not added")
	}

	return response.Ok("Client Succesfully registered")

})

ipcMain.handle("edit-client", async (event, data) => {

    const { formData, profilePicture } = data.formDataBuffer
    const clientId = data.clientId

    const client = retrieveClientForEdit(clientId)

    if (!client) return response.Error("Client not found")

    if (!formData) return response.Error("Client details are missing")

    const duplicateValidation = await checkDuplicateData(formData, true, clientId)

    if (duplicateValidation.status === "failed") {
        return response.Error(duplicateValidation.toast[0])
    }

    const missingFields = checkMissingFields(formData)

    if (missingFields) {
        return response.Error(missingFields)
    }

    const formValidation = validateFormData(formData)

    if (formValidation.status === false) {
        const { field, message } = validateResponse
        return response.failed().addFieldError(field, message).getResponse()
    }

    const oldClientData = client.toJSON()

    if (profilePicture) {
        const pictureUpdate = updateClientProfilePicture(oldClientData, profilePicture)

        if (pictureUpdate.status === "success") {
            client.profilePicture = pictureUpdate.imageFileName
        }
    }

    updateClientRecord(client, formData)
    updateClientPhoneNumber(client, formData.phoneNumber)

    try {
        await client.save()
        return response.Ok("Client succesfully updated")
    } catch (error) {
        console.log(error)
        return response.Error("Failed to update client")
    }

})

ipcMain.handle("get-files", async (event, clientId) => {
	if (!clientId) return response.Error("Client id is required")
	return response.success().addObject("files", getClientFiles(clientId)).getResponse()
})

ipcMain.handle("get-profile-path", async (event, imageName) => 
    imageName ? joinAndResolve([__dirname, PROFILE_PATH], imageName) : null
)

ipcMain.handle("get-icon-path", (event, iconName) => 
    iconName ? joinAndResolve([__dirname, ICONS_PATH], iconName) : null
)

ipcMain.handle("get-file-path", async (event, filename) => 
    filename ? retrieveClientDocumentFilepath(filename) : null
)

ipcMain.handle("delete-file", async (event, filename) => {

    if (!filename) return response.Error("Missing filename")

    try {
        await deleteFile(filename)
    } catch (error) {
        const message = error.type === "Not found" ? error.message : "Failed to delete file"
        return response.Error(message)
    }

    return response.Ok(`${filename} deleted`)

})

