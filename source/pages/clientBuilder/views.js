// Utilities
const { connectionStatusTypes } = require("../../utilities/constants")
const { validateFormData } = require("../../utilities/validations")
const Response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")

const { 
    generateNextAccountOrBillNumber, 
    tryCatchWrapper, 
    joinAndResolve 
} = require("../../utilities/helpers")

// Database
const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const Client = require("../../../models/Client")

// API
const { ipcMain } = require("electron")
const fs = require("fs-extra")
const path = require("path")

// Functions
const { 
    retrieveClientDocumentFilepath,
    checkDuplicateClient,
    checkMissingFields,
    getClientFiles,
    deletePicture,
    savePicture,
    deleteFiles,
    deleteClient,
    saveFiles
} = require("./functions")

const PROFILE_PATH = "../../assets/images/clients/profile/"
const ICONS_PATH = "../../assets/images/icons/"

const response = new Response()

/**
 * Handles the "add-client" IPC message to add a new client.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {Object} formDataBuffer - Buffer containing form data.
 * @returns {Promise<Object>} A response object indicating the operation's status.
 */
ipcMain.handle("add-client", async (event, formDataBuffer) => {
    
    const formData = formDataBuffer.formData
    const profilePicture = formDataBuffer.image
    const files = formDataBuffer.files

    if (formData === null || Object.keys(formData).length <= 0) {
        return response.responseError("Client details are missing")
    }

    const clientDuplicate = await checkDuplicateClient(formData)
    if (clientDuplicate.hasDuplicate) return response.responseError(clientDuplicate.message)

    const missingFields = checkMissingFields(formData)
    if (missingFields) return response.responseError(missingFields)

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
					client = await Client.create(
						{
							accountNumber: await generateNextAccountOrBillNumber("Client"),
							firstName: formData.firstName,
							middleName: formData.middleName,
							lastName: formData.lastName,
							extension: formData.extension,
							relationshipStatus: formData.relationshipStatus,
							birthDate: formData.birthDate,
							age: formData.age,
							email: formData.email,
							occupation: formData.occupation,
							profilePicture: "user.webp",
							housePicture: "template_house.webp",
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
								{ model: ClientAddress, as: "mainAddress" },
								{ model: ClientAddress, as: "presentAddress" }
							],
							transaction: manager
						}
					)
				} catch (error) {
					console.log(error);
					throw new Error("Failed to add new client")
				}

				if (client) fullName = client.fullName
	
				const saveResult = saveFiles(client, files, manager)
				if (saveResult.status === "failed") {
					throw new Error(saveResult.toast[0])
				}
	
				// Create a new client phone number record.
				try {
					await ClientPhoneNumber.create(
						{
							clientId: client.id,
							phoneNumber: formData.phoneNumber
						},
						{ transaction: manager }
					)
				} catch (error) {
					console.log(error);
					throw new Error("Failed to add phone number to new client")
				}
	
				// Create a new client connection status record.
				try {
					await ClientConnectionStatus.create(
						{
							clientId: client.id,
							status: connectionStatusTypes.Connected
						},
						{ transaction: manager }
					)
				} catch (error) {
					let message = null

					// If error is caused by wrong connection status
					// remove text from '{ error type }: ' ....
					if (error.name === "SequelizeValidationError") {
						let start = error.message.indexOf(': ')
						const end = error.message.length
						message = [error.message.slice(start + 2, end), "please choose the correct connection status"].join(' ')
					}
					throw new Error(message ?? "Client not saved. Failed to add connection status to new client")
				}
	
				if (profilePicture) {
					const saveImageResult = savePicture(profilePicture)
	
					if (saveImageResult.status === "failed") {
						throw new Error(saveImageResult.toast[0])
					}
	
					client.profilePicture = saveImageResult.imageName
					profilePictureName = saveImageResult.imageName
				}
					
			} catch (error) {
				if (profilePictureName) deletePicture(profilePictureName)
				if (fullName) deleteFiles(fullName, files)
				message = error.message
				console.log(error)
				manager.rollback()
			}
	
		})
	} catch (error) {
		console.log(error);
		return response.failed().addToast(message).getResponse()
	}

	return response.success().addToast("Client Succesfully registered").getResponse()

})

/**
 * Handles the "edit-client" IPC message to edit an existing client.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {Object} formDataBuffer - Buffer containing form data.
 * @param {number} clientId - The ID of the client being edited.
 * @returns {Promise<Object>} A response object indicating the operation's status.
 */
ipcMain.handle("edit-client", async (event, data) => {

    const { formData, profilePicture } = data.formDataBuffer
    const clientId = data.clientId

    const client = await tryCatchWrapper(async () => {
        return await Client.findByPk(clientId, {
            include: [
                {
                    model: ClientPhoneNumber,
                    as: "phoneNumbers",
                    attributes: ["phoneNumber"]
                },
                { model: ClientAddress, as: "mainAddress" },
                { model: ClientAddress, as: "presentAddress" },
                {
                    model: ClientConnectionStatus,
                    as: "connectionStatuses",
                    attributes: ["status"]
                }
            ]
        })
    })

    if (!client) return response.responseError("Client not found")

    if (!formData) return response.responseError("Client details are missing")

    const clientDuplicate = await checkDuplicateClient(formData, true, clientId)
    if (clientDuplicate.hasDuplicate) return response.responseError(clientDuplicate.message)

    const missingFields = checkMissingFields(formData)

    missingFields && response.responseError(missingFields)

    const validateResponse = validateFormData(formData)

    if (validateResponse.status === false) {
        const { field, message } = validateResponse
        return response.failed().addFieldError(field, message).getResponse()
    }

    const oldClientData = client.toJSON()

    if (profilePicture) {
        // deletes old profile picture and adds the new one
        // problems: resaves the old picture if unchanged (Could be good to rehash the same image every time the form is edited)
        const saveNewProfilePicture = (profilePicture)

        if (saveNewProfilePicture.status === "failed")  return responseError(saveNewProfilePicture.message)

        if (oldClientData.profilePicture) {
            const oldProfilePicturePath = path.join(
                path.resolve(__dirname, "../../assets/images/clients/profile/"),
                oldClientData.profilePicture
            )

            fs.unlink(oldProfilePicturePath, error => {
                if (error) console.error("Error deleting client old profile picture:", error)
            })
        }

        client.profilePicture = saveNewProfilePicture.imageName
        await tryCatchWrapper(async () => client.save())

    }

    // Update the client record
    for (const key in formData) {

        if (!formData.hasOwnProperty(key)) continue

        //skips these fields as profilePicture is updated earilier and accountNumber is a fixed value on creation
        if (key === "profilePicture" || key === "accountNumber") continue

        /**
         * ex: if (key === "mainAddressStreet") {
         *  const addressKey = "Street"
         *  const modifiedAddressKey = "street"
         *  client.mainAddress["street"] = value of mainAddrressStreet key
         * }
         */
        if (key.includes("mainAddress")) {
            const addressKey = key.replace("mainAddress", "")
            const modifiedAddressKey = addressKey.charAt(0).toLowerCase() + addressKey.slice(1)
            client.mainAddress[modifiedAddressKey] = formData[key]
            continue
        }

        if (key.includes("presentAddress")) {
            const addressKey = key.replace("presentAddress", "")
            client.presentAddress[addressKey] = formData[key]
            continue
        }

        client[key] = formData[key]
    }

    /**
     * This adds a new phone number to the client instead of replacing their old phone numbers
     * This will also work assuming that the same phone number isn't added on the same client preventing duplicates.
     *
     * client.ClientPhoneNumber = [
     * 		{ phoneNumber: XXXXXXXXXX},
     * 		{ phoneNumber: XXXXXXXXXX},
     * ]
     */
    const newPhoneNumberNotExists =
        client.phoneNumbers.filter(record => record.phoneNumber === formData.phoneNumber).length <= 0

    if (newPhoneNumberNotExists) {
        tryCatchWrapper(async () => {
            await ClientPhoneNumber.create({
                clientId: client.id,
                phoneNumber: formData.phoneNumber
            })
        })
    }

    await tryCatchWrapper(async () => client.save())

    return response.success().addToast("Client succesfully edited").getResponse()
})

ipcMain.handle("get-files", async (event, clientId) => {
	if (!clientId) return response.failed().addToast("Client id is required").getResponse()
	return response.success().addObject("files", getClientFiles(clientId)).getResponse()
})

/**
 * Retrieve the path to a client's image.
 * 
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string|undefined|null} imageName - The name of the clients image file or null or undefined.
 * @returns {string|null} The path to the client's image or null.
 */
ipcMain.handle("get-profile-path", async (event, imageName) => 
    imageName ? joinAndResolve([__dirname, PROFILE_PATH], imageName) : null
)

/**
 * Retrieves the path of a an icon's image.
 * 
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string|undefined|null} iconName - The file name of the icon.
 * @returns {string|null} The path to the client's image.
 */
ipcMain.handle("get-icon-path", (event, iconName) => 
    iconName ? joinAndResolve([__dirname, ICONS_PATH], iconName) : null
)

/**
 * Retrieve the path of the file folder.
 * 
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} fileName - The file name of the file.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-file-path", async (event, filename) => 
    filename ? retrieveClientDocumentFilepath(filename) : null
)

ipcMain.handle("delete-file", async (event, filename) => {

    if (!filename) return response.failed().addToast("Missing filename").getResponse()
    const filepath = filename ? retrieveClientDocumentFilepath(filename) : null
    if (!fs.existsSync(filepath)) return response.failed().addToast("File does not exist")

    try {
        await fs.unlink(filepath)
    } catch (error) {
        console.log(error)
        return response.failed().addToast("Failed to delete file").getResponse()
    }

    return response.success().addToast(`${filename} deleted`).getResponse()

})

