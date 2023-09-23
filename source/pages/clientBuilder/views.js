
const { connectionStatusTypes } = require("../../utilities/constants")
const { validateFormData } = require("../../utilities/validations")
const tryCatchWrapper = require("../../utilities/helpers")
const Response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")
const { ipcMain } = require("electron")
const { Op } = require('sequelize')
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const ClientFile = require("../../../models/ClientFile")
const Client = require("../../../models/Client")
const { log } = require("console")

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
    mainAddressPostalCode: "Main Address Postal Code",
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

	await db.transaction(async manager => {

		try {

			const client = await Client.create({
					accountNumber: await generateNextAccountNumber(),
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
						details: formData.mainAddressDetails,
					},
					presentAddress: {
						street: formData.presentAddressStreet,
						subdivision: formData.presentAddressSubdivision,
						barangay: formData.presentAddressBarangay,
						city: formData.presentAddressCity,
						province: formData.presentAddressProvince,
						postalCode: formData.presentAddressPostalCode,
						details: formData.presentAddressDetails,
					},
				},
				{
					include: [
						{ model: ClientAddress, as: "mainAddress" },
						{ model: ClientAddress, as: "presentAddress" },
					]
				},
				{ transaction: manager }
			)

			if (files.length > 0) {
				const saveResult = saveFiles(files, client.id, manager)
				if (saveResult.status === "failed") {

					const deleteResult = deleteClient(client.id)
					if (deleteResult.status === "failed") {
						throw new Error(deleteResult.toast[0])
					}

					throw new Error(saveResult.toast[0])
				}
			}

			await ClientPhoneNumber.create({
					clientId: client.id,
					phoneNumber: formData.phoneNumber
				},
				{ transaction: manager }
			)
	
			await ClientConnectionStatus.create({
					clientId: client.id,
					status: connectionStatusTypes.Connected
				},
				{ transaction: manager }
			)
	
			if (profilePicture) {
				const saveImage = savePicture(profilePicture)
				if (saveImage.status === "failed") {
					deleteClient(client.id)
					throw new Error(saveImage.message);
				} else {
					client.profilePicture = saveImage.imageName
					await client.save({ transaction: manager });
				}
			}
	
		} catch (error) {

			console.error(`\n\n${error}\n\n`);
			await manager.rollback()
			return response.responseError("Error in registering client");
		}

	});
	
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
					attributes: ['phoneNumber']
				},
				{ model: ClientAddress, as: "mainAddress" },
				{ model: ClientAddress, as: "presentAddress" },
				{ 
					model: ClientConnectionStatus, 
                    as: "connectionStatuses",
					attributes: ['status']
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
				const oldProfilePicturePath = path.join(path.resolve(__dirname, '../../assets/images/clients/profile/'), oldClientData.profilePicture)
			
				fs.unlink(oldProfilePicturePath, error => {
					if (error) {
						console.error("Error deleting client old profile picture:", error)
					}
				})
			}

			client.profilePicture = saveNewProfilePicture.imageName
		
			await tryCatchWrapper(async() => {
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
	const newPhoneNumberNotExists  = client.phoneNumbers.filter(record => record.phoneNumber === formData.phoneNumber).length <= 0

	if (newPhoneNumberNotExists) {
		tryCatchWrapper(async () => {
			await ClientPhoneNumber.create({
				clientId: client.id,
				phoneNumber: formData.phoneNumber,
			})	
		})
	}

	await tryCatchWrapper(async () => {
		client.save()
	})

	return response.success().addToast("Client succesfully edited").getResponse()
})

/**
 * Handles the "get-client-profile-path" IPC message to retrieve the path of a client's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - The name of the clients image file.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-client-profile-path", async (event, string) => {
	return path.join(path.resolve(__dirname, '../../assets/images/clients/profile/'), string)
})

/**
 * Handles the "get-client-profile-path" IPC message to retrieve the path of a client's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - A string parameter.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-file-profile-path", async (event, string) => {
	return path.join(path.resolve(__dirname, '../../assets/images/icons/'), string)
})

/**
 * Generates the next account number based on the last client's account number.
 * @async
 * @function
 * @returns {Promise<string>} The generated account number.
 */
const generateNextAccountNumber = async function () {

    const lastClient = await Client.findOne({
        order: [["createdAt", "DESC"]],
    })

    if (!lastClient) {
        return "0000-AA"
    }

    let nextNumber = "0000"
    let nextLetter = "AA"

    const lastAccountNumber = lastClient.accountNumber
    const lastNumberPart = parseInt(lastAccountNumber.slice(0, 4), 10)
    const lastLetterPart = lastAccountNumber.slice(5)

    if (lastNumberPart === 9999) {
        nextNumber = "0000"

        const lastLetterCharCode = lastLetterPart.charCodeAt(1)

        lastLetterCharCode === 90
            ? (nextLetter = "AA")
            : (nextLetter =
                  "A" + String.fromCharCode(lastLetterCharCode + 1))
    } else {
        nextNumber = String("0000" + (lastNumberPart + 1)).slice(-4)
        nextLetter = lastLetterPart
    }

	return `${nextNumber}-${nextLetter}`
}

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

    const responseWithMessage = (message) => {
        response.hasDuplicate = true
        response.message = message
        return response
    }

	const checkDuplicate = async (field, where) => {

		if (forEdit && clientId !== null) {

			if (field === "phone-number") {
				where[Op.and].unshift(
					{
						clientId: { [Op.not]: clientId }
					}
				)
			} else {
				where[Op.and].unshift(
					{
						id: { [Op.not]: clientId }
					}
				)
			}
		}
	  
		const duplicates = await tryCatchWrapper(async () =>
		    field === "phone-number"
			? await ClientPhoneNumber.findAndCountAll({ where })
			: await Client.findAndCountAll({ where })
		)
	  
		console.log(field.split("-").join(" "), ': ', duplicates.count);

		if (duplicates.count > 0) {
		  	return responseWithMessage(`Client with the same ${field.split("-").join(" ")} is already registered`)
		}

	}	  

    const duplicateChecks = [

        { 
			field: "full-name", where: { 
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
			field: "user-email", where: { 
				[Op.and]: [
					{
						email: formData.email
					}
				]
			}
		},

		{ 
			field: "phone-number", where: { 
				[Op.and]: [
					{
						phoneNumber: formData.phoneNumber
					}
				]
			}
		},

		{ 
			field: "meter-number", where: { 
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
function savePicture(profilePicture) {

	const response = new Response()

	const randomString = crypto.randomBytes(32).toString("hex")
	const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, "")
	let imagePath = null
	let imageName = null

	if (profilePicture.fromInput) {

		imageName = [hash.slice(0, 32), profilePicture.format].join(".")
		imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)

		try {
			fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
		} catch (error) {
			console.log(`\n\n${error}\n\n`)
			return response.failed().addObject("message", "Error saving client image input").getResponse()
		}

	} else {

		imageName = [hash.slice(0, 32), ".png"].join("")

		imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)

		const base64Image = profilePicture.base64.split("base64,").pop()

		fs.writeFile(imagePath, base64Image, { encoding: "base64" }, error => {
			if (error) {
				console.log(`\n\n${error}\n\n`)
				return response.failed().addObject("message", "Error saving client image capture").getResponse()
			}
		})
	}

	return response.success().addObject("imageName", imageName).getResponse()
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
 * Save files by creating ClientFile records and moving files to a designated directory.
 *
 * @param {Array} files - Array of file objects to be saved.
 * @param {number} clientId - ID of the associated client.
 * @param {Sequelize.Transaction} manager - Sequelize transaction manager.
 * @returns {Promise<void>} - A Promise that resolves after all files are saved and moved.
 */
async function saveFiles(files, clientId, manager) {

	const response = new Response()

	if (!clientId) return response.failed().addToast("Client Id is needed to move the files").getResponse()
	if (!files) return response.failed().addToast("No files to be saved").getResponse()

    const moveFilePromises = files.map(async (file) => {
        await ClientFile.create(
            {
                clientId: clientId,
                name: file.name,
            },
            { transaction: manager }
        );

        const sourceFilePath = file.path;
        const destinationFilePath = path.resolve(__dirname, '../../assets/files', file.name);
		tryCatchWrapper(async () => {
			await fs.move(sourceFilePath, destinationFilePath);
		})
	});

	tryCatchWrapper(async () => {
		await Promise.all(moveFilePromises);
		return response.success()
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

            const filePath = path.join(path.resolve(__dirname, "../../assets/files/"), file.name )

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