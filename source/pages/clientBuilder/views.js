const { tryCatchWrapper, generateNextAccountOrBillNumber } = require("../../utilities/helpers")
const { connectionStatusTypes } = require("../../utilities/constants")
const { validateFormData } = require("../../utilities/validations")
const Response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")
const { ipcMain } = require("electron")
const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const ClientFile = require("../../../models/ClientFile")
const Client = require("../../../models/Client")

const clientFormFields = {
    firstName: "First Name",
    middleName: "Middle Name",
    lastName: "Last Name",
    relationshipStatus: "Relationship Status",
    birthDate: "Birthdate",
    age: "Age",
    email: "Email",
    occupation: "Occupation",
    phoneNumber: "Phone Number",
    presentAddressBarangay: "Present Address Barangay",
    presentAddressCity: "Present Address City",
    presentAddressProvince: "Present Address Province",
    presentAddressPostalCode: "Present Address Postal Code",
    mainAddressBarangay: "Main Address Barangay",
    mainAddressCity: "Main Address City",
    mainAddressProvince: "Main Address Province",
    mainAddressPostalCode: "Main Address Postal Code"
}

/**
 * Handles the "add-client" IPC message to add a new client.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {Object} formDataBuffer - Buffer containing form data.
 * @returns {Promise<Object>} A response object indicating the operation's status.
 */
ipcMain.handle("add-client", async (event, formDataBuffer) => {
    const response = new Response()

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
	
				const saveResult = await saveFiles(client, files, manager)
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
					const saveImageResult = await savePicture(profilePicture, manager)
	
					if (saveImageResult.status === "failed") {
						throw new Error(saveImageResult.toast[0])
					}
	
					client.profilePicture = saveImageResult.imageName
					profilePictureName = saveImageResult.imageName
				}
					
			} catch (error) {
				if (fullName) deleteFiles(fullName, files)
				if (profilePictureName) deletePicture(profilePictureName)
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
    const response = new Response()

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

    if (!client) {
        return response.responseError("Client not found")
    }

    if (!formData) {
        return response.responseError("Client details are missing")
    }

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
        const saveNewProfilePicture = savePicture(profilePicture)

        if (saveNewProfilePicture.status === "success") {
            if (oldClientData.profilePicture) {
                const oldProfilePicturePath = path.join(
                    path.resolve(__dirname, "../../assets/images/clients/profile/"),
                    oldClientData.profilePicture
                )

                fs.unlink(oldProfilePicturePath, error => {
                    if (error) {
                        console.error("Error deleting client old profile picture:", error)
                    }
                })
            }

            client.profilePicture = saveNewProfilePicture.imageName

            await tryCatchWrapper(async () => {
                client.save()
            })
        } else {
            return responseError(saveNewProfilePicture.message)
        }
    }

    // Update the client record
    for (const key in formData) {
        if (!formData.hasOwnProperty(key)) {
            continue
        }

        //skips these fields as profilePicture is updated earilier and accountNumber is a fixed value on creation
        if (key === "profilePicture" || key === "accountNumber") {
            continue
        }

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

    await tryCatchWrapper(async () => {
        client.save()
    })

    return response.success().addToast("Client succesfully edited").getResponse()
})

ipcMain.handle("get-files", async (event, clientId) => {
	const response = new Response()
	if (!clientId) return response.failed().addToast("Client id is required").getResponse()
	const files = await getFiles(clientId)
	return response.success().addObject("files", files).getResponse()
})

ipcMain.handle("delete-file", async (event, args) => {

	const response = new Response()

	if (!args.clientId) return response.failed().addToast("Client Id is required").getResponse()
	if (!args.fileName) return response.failed().addToast("File name is required").getResponse()
	
	try {
		const filePath = path.join(path.resolve(__dirname, "../../assets/files/"), fileName)
		if (fs.existsSync(filePath)) {
			await fs.unlink(filePath)
			return response.success().addToast(`${fileName} succesfully deleted`).getResponse()
		} else {
			return response.failed().addToast(`File does not exist`).getResponse()
		}
	} catch (error) {
		console.log(error);
		return response.failed().addToast(`Failed to delete file`).getResponse()
	}
})

/**
 * Retrieve the path to a client's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string|undefined|null} imageName - The name of the clients image file or null or undefined.
 * @returns {string|null} The path to the client's image or null.
 */
ipcMain.handle("get-profile-path", async (event, imageName) => {
	if (!imageName) return null
    return path.join(path.resolve(__dirname, "../../assets/images/clients/profile/"), imageName)
})

/**
 * Retrieves the path of a an icon's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} iconName - The file name of the icon.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-icon-path", (event, iconName) => {
    return path.join(path.resolve(__dirname, "../../assets/images/icons/"), iconName)
})

/**
 * Retrieve the path of the file folder.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} fileName - The file name of the file.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-file-path", async (event, fileName) => {
    return path.join(path.resolve(__dirname, "../../assets/files/"), fileName)
})

/**
 * Checks for duplicate client records based on provided form data.
 * @async
 * @function
 * @param {Object} formData - The form data to check for duplicates.
 * @param {boolean} [forEdit=false] - Indicates if the check is for editing an existing client.
 * @param {number} [clientId=null] - The ID of the client being edited.
 * @returns {Promise<Object>} An object containing duplicate check results.
 */
async function checkDuplicateClient(formData, forEdit = false, clientId = null) {
    const response = { hasDuplicate: false, message: "" }

    const responseWithMessage = message => {
        response.hasDuplicate = true
        response.message = message
        return response
    }

    const checkDuplicate = async (field, where) => {
        if (forEdit && clientId !== null) {
            if (field === "phone-number") {
                where[Op.and].unshift({
                    clientId: { [Op.not]: clientId }
                })
            } else {
                where[Op.and].unshift({
                    id: { [Op.not]: clientId }
                })
            }
        }

        const duplicates = await tryCatchWrapper(async () =>
            field === "phone-number"
                ? await ClientPhoneNumber.findAndCountAll({ where })
                : await Client.findAndCountAll({ where })
        )

        if (duplicates.count > 0) {
            return responseWithMessage(`Client with the same ${field.split("-").join(" ")} is already registered`)
        }
    }

    const duplicateChecks = [
        {
            field: "full-name",
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
            field: "user-email",
            where: {
                [Op.and]: [
                    {
                        email: formData.email
                    }
                ]
            }
        },

        {
            field: "phone-number",
            where: {
                [Op.and]: [
                    {
                        phoneNumber: formData.phoneNumber
                    }
                ]
            }
        },

        {
            field: "meter-number",
            where: {
                [Op.and]: [
                    {
                        meterNumber: formData.meterNumber
                    }
                ]
            }
        }
    ]

    for (const check of duplicateChecks) {
        const result = await checkDuplicate(check.field, check.where)
        if (result) return result
    }

    return response
}

/**
 * Saves a client's profile picture to the filesystem.
 * @function
 * @param {Object} profilePicture - The profile picture data to be saved.
 * @returns {Object} A response object indicating the status of the operation.
 */
async function savePicture(profilePicture) {

	const response = new Response()
	let message = ''
	
	try {
		const randomString = crypto.randomBytes(32).toString("hex")
		const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, "")
		let imagePath = null
		let imageName = null
	
		if (profilePicture.fromInput) {
			try {
				imageName = [hash.slice(0, 32), profilePicture.format].join(".")
				imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)	
				fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
			} catch (error) {
				message = "Error saving client image input"
				throw error
			}
		} else {
			try {
				imageName = [hash.slice(0, 32), ".png"].join("")
				imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)	
				const base64Image = profilePicture.base64.split("base64,").pop()
				await fs.promises.writeFile(imagePath, base64Image, { encoding: "base64" });
			} catch (error) {
				message = "Error saving client image capture"
				throw error
			}
		}
	
		return response.success().addObject("imageName", imageName).getResponse()

	} catch (error) {
		tryCatchWrapper(async () => {
			if (fs.existsSync(imagePath)) {
				await fs.unlink(imagePath)
			}
			console.log("Previous image deleted");
		})
		console.log(error)
		return response.failed().addToast(message).getResponse()
	}

}

/**
 * Deletes the clients picture especially if client wasnt saved.
 * @param {String} imageName - The filename for the image 
 */
function deletePicture(imageName) {
	tryCatchWrapper(async () => {
		const imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)	
		if (fs.existsSync(imagePath)) {
			await fs.unlink(imagePath)
			console.log("Previous image deleted");
		}
	})
}

/**
 * Checks for missing fields in the provided form data.
 * @function
 * @param {Object} formData - The form data to check for missing fields.
 * @returns {string[]|null} An array of missing field messages or null if all fields are present.
 */
function checkMissingFields(formData) {
    const formDataFieldNames = Object.keys(formData)
    const missingElements = Object.keys(clientFormFields).filter(fieldName => !formDataFieldNames.includes(fieldName))

    if (missingElements.length > 1) {
        return [`${missingElements.map(field => clientFormFields[field]).join(", ")} are required`]
    }

    if (missingElements.length === 1) {
        return [`${missingElements.map(field => clientFormFields[field]).join("")} is required`]
    }

    return null
}

/**
 * Gets the files for a client.
 * @param {number} clientId - The client id to associate the files with.
 * @returns {Object|null} - A response object or null.
 */
function getFiles(clientId) {
	return tryCatchWrapper(async() => {
		const clientFiles = await ClientFile.findAll({
			attributes: ['name'],
			where: {
				clientId: clientId
			}
		})

		if (!clientFiles) return null
		return clientFiles.map(file => {
			return {
				path: path.join(path.resolve(__dirname, "../../assets/files/"), file.name),
				fileName: file.name
			}
		})
	})
}

/**
 * Saves files for a client, associating them with the client and moving them to a destination folder.
 * @param {Object} client - The client object to associate the files with.
 * @param {Array} files - An array of files to save.
 * @param {Object} manager - The transaction manager for database operations.
 * @returns {Object} - A response object.
 */
async function saveFiles(client, files, manager) {
	const response = new Response()

    if (files.length <= 0) return response.success().getResponse()

    try {
        await Promise.all(files.map(async file => {
                try {

					const newFileName = [client.fullName, file.name].join(' ')

                    await ClientFile.create(
                        {
                            clientId: client.id,
                            name: file.name
                        },
                        { transaction: manager }
                    )

                    const sourceFilePath = file.path
                    const destinationFilePath = path.resolve(__dirname, "../../assets/files", newFileName)

                    await fs.copyFile(sourceFilePath, destinationFilePath)
                } catch (error) {
					console.log(`\n\n${error}\n\n`);
					error.message = error.message.includes("dest") ? [newFileName, "already exists. Rename the file and try again."].join(' ') : null
					throw error
                }
            })
        )
		return response.success()
    } catch (error) {
        return response.failed().addToast(error.message ? error.message : "Client not added. Error in saving client's documents").getResponse()
    }
}

/**
 * Deletes files especially if client wasnt saved
 * @param {Array} files - An array of files to save.
 * @returns {Object} - A response object.
 */
function deleteFiles(fullName, files) {

    if (files.length <= 0) return

	tryCatchWrapper(async () => {
		await Promise.all(files.map(async file => {
			return await tryCatchWrapper(async () => {
				const newFileName = [fullName, file.name].join(' ')

				const filePath = path.resolve(__dirname, "../../assets/files", newFileName)

				if (fs.existsSync(filePath)) {
						await fs.unlink(filePath)
					}
				})
			})
		)
		console.log("Previous files deleted")
	})
}

/**
 * Deletes a client and their associated files, if any.
 * If the client's one-to-many associations have cascade set to true on delete,
 * this function will also delete their records on that data.
 *
 * @param {number} clientId - The unique identifier of the client to delete.
 * @returns {Promise<Response>} A Promise that resolves with a Response object
 * representing the result of the delete operation. The Response object can be
 * used to check the success or failure of the operation.
 *
 * @async
 * @example
 * const clientId = 123;
 * const response = await deleteClient(clientId);
 * if (response.status === "success") {
 *   console.log('Client deleted successfully.');
 * } else {
 *   console.error('Failed to delete client:', response.getError());
 * }
 */
async function deleteClient(clientId, saveData = false) {
    const response = new Response()

    if (!clientId) return response.failed().addToast("Client id not found").getResponse()

    const client = Client.findByPk(clientId, {
        include: "clientFiles"
    })

    if (!client) return response.failed().addToast("Failed to delete client record").getResponse()

    if (client.clientFiles.length > 0) {
        client.clientFiles.forEach(async file => {
            const filePath = path.join(path.resolve(__dirname, "../../assets/files/"), file.name)

            tryCatchWrapper(async () => {
                const fileExists = await fs.pathExists(filePath)

                if (fileExists) {
                    await fs.remove(filePath)
                } else {
                    console.log(`File ${file.name} does cannot be found`)
                }
            })
        })
    }

    try {
        await client.destroy()
        return response.success().addToast("Client deleted succesfully").getResponse()
    } catch (error) {
        return response.failed().addToast("Failed to delete client").getResponse()
    }
}

// FILES SAVE TO EXCEL OR WORD IS AS MUST BEFORE CLIENT DELETION (EXCEL IS RECOMMENDED TO ALLOW FOR CLIENT RESTORATION)
