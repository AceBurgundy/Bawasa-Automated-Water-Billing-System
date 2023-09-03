// @collapse

const { userRelationshipTypes, connectionStatusTypes } = require("../../../constants")
const Client_Connection_Status = require("../../../models/Client_Connection_Status")
const ClientPhoneNumber = require("../../../models/Client_Phone_Number")
const Client_Address = require("../../../models/Client_Address")
const tryCatchWrapper = require("../view_helpers")
const { db } = require("../../../sequelize_init")
const Client = require("../../../models/Client")
const Response = require("../../IPCResponse")
const { ipcMain } = require("electron")
const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const {
    isEmpty,
    isOverThan,
    isEmail,
    notIn,
    isBirthDate,
    isValidPhoneNumber
} = require("../input_validations")

const Client_File = require("../../../models/Client_File")

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
    presentAddressStreet: "Present Address Street",
    presentAddressSubdivision: "Present Address Subdivision",
    presentAddressBarangay: "Present Address Barangay",
    presentAddressCity: "Present Address City",
    presentAddressProvince: "Present Address Province",
    presentAddressPostalCode: "Present Address Postal Code",
    mainAddressStreet: "Main Address Street",
    mainAddressSubdivision: "Main Address Subdivision",
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

	if (!profilePicture) {
		return response.responseError("Client image cannot be empty")
	}

	if (!formData) {
		return response.responseError("Client details are missing")
	}

	tryCatchWrapper(async () => {
		const clientDuplicate = await checkDuplicateClient(formData)

		if (clientDuplicate.hasDuplicate) {
			return response.responseError(clientDuplicate.message)
		}
	})

	const missingFields = checkMissingFields(formData)
	if (missingFields) {
		return response.responseError(missingFields)
	}

    const formValidation = validateForm(formData)
    
	/**
	 * If formValidation has errorMessages, return with the first error message
	 */
    formValidation.messages &&
        Object.keys(formValidation.errorMessages).forEach(key => {
            return response.responseError(formValidation.errorMessages[key], key)
        })
	
	try {

		await db.transaction(async manager => {

			const client = await Client.create(
				{
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
					profilePicture: profilePicture.name,
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
						{ model: Client_Address, as: "mainAddress" },
						{ model: Client_Address, as: "presentAddress" },
					]
				},
				{ transaction: manager }
			)

			if (files) {
				saveFiles(files, client.id, manager)
			}

			await ClientPhoneNumber.create(
				{
					clientId: client.id,
					phoneNumber: formData.phoneNumber
				},
				{ transaction: manager }
			)

			await Client_Connection_Status.create(
				{
					clientId: client.id,
					status: connectionStatusTypes.Connected
				},
				{ transaction: manager }
			)

            const saveImage = savePicture(profilePicture)
			
            if (saveImage.status === "error") {
                return response.responseError(saveImage.message)
            }

			client.profilePicture = saveImage.imageName
			await client.save({ transaction: manager })
			
		})

	} catch (error) {

		if (error && error.errors.length > 0) {
			return response.responseError(error.errors[0].message)
		} 

		console.log(`\n\n${error}\n\n`)
		return response.responseError("Error in registering client")
		
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

	const formData = data.formDataBuffer.formData
	const profilePicture = data.formDataBuffer.image
	const clientId = data.clientId

	const client = await tryCatchWrapper(async () => {		
		return await Client.findByPk(clientId, {
			include: [
				{ 
					model: ClientPhoneNumber, 
					as: "Client_Phone_Numbers",
					attributes: ['phoneNumber']
				},
				{ model: Client_Address, as: "mainAddress" },
				{ model: Client_Address, as: "presentAddress" },
				{ 
					model: Client_Connection_Status, 
					as: "Client_Connection_Statuses",
					attributes: ['connectionStatus']
				}
			]
		})
	})

	if (!client) {
		return response.responseError("Client not found")
	}

	if (!profilePicture) {
		return response.responseError("Client image cannot be empty")
	}

	if (!formData) {
		return response.responseError("Client details are missing")
	}

	tryCatchWrapper(async () => {
		const clientDuplicate = await checkDuplicateClient(formData, true, clientId)

		if (clientDuplicate.hasDuplicate) {
			return response.responseError(clientDuplicate.message)
		}
	})

	const missingFields = checkMissingFields(formData)
	missingFields && response.responseError(missingFields)
	
    const formValidation = validateForm(formData)
    
    formValidation.messages &&
        Object.keys(formValidation.errorMessages).forEach(key => {
            response.responseError(formValidation.errorMessages[key], key)
        })

	const oldClientData = client.toJSON()

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
	 * 
	 * client.ClientPhoneNumber.every(phoneNumberObject => Object.values(phoneNumberObject)[0] !== formData.phoneNumber) 
	 * 
	 * client.ClientPhoneNumber = [
	 * 		{ phoneNumber: XXXXXXXXXX} !== formData.phoneNumber,
	 * 		{ phoneNumber: XXXXXXXXXX} !== formData.phoneNumber,
	 * ]
	 */
	if (client.ClientPhoneNumber && client.ClientPhoneNumber.every(phoneNumberObject => Object.values(phoneNumberObject)[0] !== formData.phoneNumber)) {
		await ClientPhoneNumber.create({
			clientId: client.id,
			phoneNumber: formData.phoneNumber,
		})
	}

	client.save()

	return response.success().addToast("Client succesfully edited").getResponse()
})

/**
 * Handles the "get-client-image-path" IPC message to retrieve the path of a client's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - A string parameter.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-client-image-path", async (event, string) => {
	return path.join(path.resolve(__dirname, '../../assets/images/clients/profile/'), string)
})

/**
 * Handles the "get-client-image-path" IPC message to retrieve the path of a client's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - A string parameter.
 * @returns {string} The path to the client's image.
 */
ipcMain.handle("get-file-image-path", async (event, string) => {
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
	
    const response = {
        hasDuplicate: false,
        message: ""
    }

    const responseWithMessage = message => {
        response.hasDuplicate = true
        response.message = message
        return response
    }

    try {
        const duplicateChecks = [
			{ field: "name", where: { firstName: formData.firstName, middleName: formData.middleName, lastName: formData.lastName } },
			{ field: "email", where: { email: formData.email } },
			{ field: "phone", where: { phoneNumber: formData.phoneNumber } }
		]

        for (const check of duplicateChecks) {

			if (forEdit && clientId !== null) {
                check.where.id = { [Op.not]: clientId }
            }

            const existingClient = await tryCatchWrapper(async () => {
				return await Client.findOne({ where: check.where })
			})

			// console.log(existingClient.toJSON())

            if (existingClient) {
                return responseWithMessage(`Client with the same ${check.field} is already registered`)
            }
        }

		if (forEdit && clientId !== null) {
			const meterNumberExist = await tryCatchWrapper(async () => {
				return await Client.findOne({ where: {
					[Op.not]: clientId,
					meterNumber: formData.meterNumber
				} })
			})

			if (meterNumberExist) {
                return responseWithMessage(`Client with the same meter number is already registered`)
			}
		}

    } catch (error) {
        console.error("Error while searching for the client:", error)
    }

    return response
}

/**
 * Validates form data and returns error messages for invalid fields.
 * @function
 * @param {Object} formData - The form data to validate.
 * @returns {Object} An object containing error messages for invalid fields.
 */
function validateForm(formData) {

    const response = {
        errorMessages: {}
    }
    
    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => (b.length > a.length ? b : a)).length
	const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => (b.length < a.length ? b : a)).length

	const validationMethods = {

		firstName: [
			[isEmpty],
			[isOverThan, 2, 255]
		],

		middleName: [
			[isEmpty],
			[isOverThan, 2, 255]
		],

		lastName: [
			[isEmpty],
			[isOverThan, 2, 255]
		],

		relationshipStatus: [
			[isEmpty],
			[isOverThan, shortestRelationshipOption, longestRelationshipOption],
			[notIn, [...Object.values(userRelationshipTypes)]]
		],

		birthDate: [
			[isEmpty], 
			[isBirthDate]
		],

		age: [
			[isEmpty],
			[isOverThan, 16, 70]
		],

		email: [
			[isEmpty],
			[isEmail],
			[isOverThan, 10, 255]
		],

		occupation: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		phoneNumber: [
			[isEmpty],
			[isValidPhoneNumber]
		],

		presentAddressStreet: [
			[isEmpty],
			[isOverThan, 5, 9999]
		],

		presentAddressSubdivision: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		presentAddressBarangay: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		presentAddressCity: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		presentAddressProvince: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		presentAddressPostalCode: [
			[isEmpty],
			[isOverThan, 5, 9999]
		],

		presentAddressDetails: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		mainAddressStreet: [
			[isEmpty],
			[isOverThan, 5, 9999]
		],

		mainAddressSubdivision: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		mainAddressBarangay: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		mainAddressCity: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		mainAddressProvince: [
			[isEmpty],
			[isOverThan, 5, 255]
		],

		mainAddressPostalCode: [
			[isEmpty],
			[isOverThan, 5, 9999]
		],

		mainAddressDetails: [
			[isEmpty],
			[isOverThan, 5, 255]
		],
	}

	for (const [key, dirtyValue] of Object.entries(formData)) {

		if (typeof dirtyValue !== "object") {
			const value = dirtyValue.trim()

			if (validationMethods.hasOwnProperty(key)) {
				validationMethods[key].forEach(([validationMethod, ...args]) => {
					const [validationMessage] = validationMethod(value, ...args)

					if (validationMessage.length > 0) {
						response.messages[key] = validationMessage						
					}
				})
			}
		}
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

    const response = {
        status: "error",
        message: "",
        imageName: ""
    }

	const randomString = crypto.randomBytes(32).toString("hex")
	const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, "")
	let imagePath = null
	let imageName = null

	if (profilePicture.fromInput) {
		imageName = `${hash.slice(0, 32)}.${profilePicture.format}`

		imagePath = path.join(__dirname, "../../assets/images/clients/profile", `${imageName}.${profilePicture.format}`)

		try {
			fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
		} catch (error) {
			console.log(`\n\n${error}\n\n`)
            response.message = "Error saving client image input"
			return response
		}

	} else {
		imageName = `${hash.slice(0, 32)}.png`

		imagePath = path.join(__dirname, "../../assets/images/clients/profile", imageName)

		const base64Image = profilePicture.base64.split("base64,").pop()

		fs.writeFile(imagePath, base64Image, { encoding: "base64" }, error => {
			if (error) {
				console.log(`\n\n${error}\n\n`)
                response.message = "Error saving client image capture"
                return response
			}
		})
	}

    response.imageName = imageName
    response.status = "success"
    return response
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
 * Save files by creating Client_File records and moving files to a designated directory.
 *
 * @param {Array} files - Array of file objects to be saved.
 * @param {number} clientId - ID of the associated client.
 * @param {Sequelize.Transaction} manager - Sequelize transaction manager.
 * @returns {Promise<void>} - A Promise that resolves after all files are saved and moved.
 */
async function saveFiles(files, clientId, manager) {
    const moveFilePromises = files.map(async (file) => {
        await Client_File.create(
            {
                clientId: clientId,
                name: file.name,
            },
            { transaction: manager }
        );

        const sourceFilePath = file.path;
        const destinationFilePath = path.resolve(__dirname, '../../assets/files', file.name);
        await fs.move(sourceFilePath, destinationFilePath);
    });

    await Promise.all(moveFilePromises);
}