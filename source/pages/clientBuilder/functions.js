const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const ClientFile = require("../../../models/ClientFile")
const Client = require("../../../models/Client")

const { connectionStatusTypes } = require("../../utilities/constants")

const response = require("../../utilities/response")
const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const { 
    generateNextAccountOrBillNumber,
    tryCatchWrapper, 
    joinAndResolve,
    throwAndLogError, 
} = require("../../utilities/helpers")
const exportRecord = require("../../utilities/export")

const clientFormFields = {
    presentAddressPostalCode: "Present Address Postal Code",
    presentAddressBarangay: "Present Address Barangay",
    presentAddressProvince: "Present Address Province",
    mainAddressPostalCode: "Main Address Postal Code",
    mainAddressBarangay: "Main Address Barangay",
    mainAddressProvince: "Main Address Province",
    presentAddressCity: "Present Address City",
    relationshipStatus: "Relationship Status",
    mainAddressCity: "Main Address City",
    phoneNumber: "Phone Number",
    middleName: "Middle Name",
    occupation: "Occupation",
    firstName: "First Name",
    birthDate: "Birthdate",
    lastName: "Last Name",
    email: "Email",
    age: "Age"
}

const PROFILE_PATH = "../../assets/images/clients/profile"

const retrieveClientDocumentFilepath = filename => joinAndResolve([__dirname, "../../assets/files/"], filename)

async function createClient(formData, manager) {

    let client = null

    try {

        client = await Client.create({

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

        return client
        
    } catch (error) {
        throw new Error(error)
    }

}

/**
 * The function creates a new phone number for a client, with an optional manager for the transaction.
 * 
 * @param clientId - The clientId parameter is the unique identifier of the client for whom the new
 * phone number is being created. It is used to associate the phone number with the correct client in
 * the database.
 * @param phoneNumber - The `phoneNumber` parameter is the phone number that you want to create for a
 * client.
 * @param [manager=null] - The `manager` parameter is an optional parameter that represents the
 * transaction manager. It is used to specify a transaction manager when creating a new phone number
 * for a client. If a transaction manager is provided, the phone number creation will be performed
 * within the specified transaction. If no transaction manager is provided, the
 */
async function createNewPhoneNumber(clientId, phoneNumber, manager = null) {

    const data = { clientId : clientId, phoneNumber : phoneNumber }
    if (manager) data["transaction"] = manager
    
    await ClientPhoneNumber.create(data)
}

/**
 * The function creates a new connection status for a client and saves it in the database.
 * 
 * @param clientId - The `clientId` parameter is the unique identifier for the client. It is used to
 * associate the connection status with the client.
 * @param [manager=null] - The `manager` parameter is an optional parameter that represents the
 * transaction manager. It is used to associate the connection status creation with a specific
 * transaction. If a `manager` is provided, it will be included in the `data` object that is passed to
 * the `ClientConnectionStatus.create()` method.
 */
async function createNewConnectionStatus(clientId, manager = null) {

    const data = { clientId : clientId, status : connectionStatusTypes.Connected }
    if (manager) data["transaction"] = manager

    await ClientConnectionStatus.create(data)
}

/**
 * The function retrieves a client's information for editing, including their phone numbers, addresses,
 * and connection statuses.
 * 
 * @param clientId - The `clientId` parameter is the unique identifier of the client whose information
 * needs to be retrieved for editing.
 * @returns a promise that resolves to the client object with the specified clientId. The client object
 * includes related phone numbers, main address, present address, and connection statuses.
 */
async function retrieveClientForEdit(clientId) {
    try {
        const client = await Client.findByPk(clientId, {
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
        return client
    } catch (error) {
        console.log(error)
        return null
    }
}

/**
 * The function updates a client record with data from a form, excluding the profile picture and
 * account number fields.
 * 
 * @param client - The `client` parameter is an object representing a client record. It contains
 * various properties such as `profilePicture`, `accountNumber`, `mainAddress`, `presentAddress`, and
 * other client details.
 * @param formData - An object containing the form data that needs to be updated in the client record.
 * The keys of the object represent the fields in the form, and the values represent the updated values
 * for those fields.
 */
function updateClientRecord(client, formData) {

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

}

/**
 * The function `updateClientPhoneNumber` adds a new phone number to a client's list of phone numbers
 * if it doesn't already exist.
 * 
 * @param client - The `client` parameter is an object that represents a client. It likely has
 * properties such as `id`, `name`, and `phoneNumbers`. The `phoneNumbers` property is an array of
 * objects, where each object represents a phone number associated with the client. Each phone number
 * object has a
 * @param phoneNumberInputValue - The `phoneNumberInputValue` parameter is the new phone number that
 * you want to add to the client's phone numbers.
 */
function updateClientPhoneNumber(client, phoneNumberInputValue) {

    const newPhoneNumberNotExists = client.phoneNumbers.filter(eachRecord => eachRecord.phoneNumber === phoneNumberInputValue).length <= 0

    if (newPhoneNumberNotExists) {
        tryCatchWrapper(async () => {
            await ClientPhoneNumber.create({ clientId: client.id, phoneNumber: phoneNumberInputValue })
        })
    }
}

/**
 * The function updates a client's profile picture by saving the new picture, deleting the old picture
 * if it exists, and returning a success response with the new image file name.
 * 
 * @param oldClientData - An object containing the old client data, including the current profile
 * picture path.
 * @param profilePicture - The `profilePicture` parameter is the new profile picture that the client
 * wants to update. It could be an image file or any data representing the picture.
 * @returns a response object.
 */
function updateClientProfilePicture(oldClientData, profilePicture) {

    const saveStatus = savePicture(profilePicture)
    if (saveStatus.status === "failed") return response.Error(saveStatus.message)

    if (oldClientData.profilePicture) {
        const oldProfilePicturePath = joinAndResolve(
            path.resolve(__dirname, "../../assets/images/clients/profile/"),
            oldClientData.profilePicture
        )
        
        fs.unlink(oldProfilePicturePath, error => {
            if (error) {
                console.error("Error deleting client old profile picture:", error)
                return response.Error("Failed to add new client")
            }
        })
    }

    return response.success().addObject("imageFileName", saveStatus.imageName)
}

/**
 * Checks for duplicate client records based on provided form data.
 * 
 * @async
 * @function
 * @param {Object} formData - The form data to check for duplicates.
 * @param {boolean} [forEdit=false] - Indicates if the check is for editing an existing client.
 * @param {number} [clientId=null] - The ID of the client being edited.
 * @returns {Promise<Object>} An object containing duplicate check results.
 */
async function checkDuplicateData(formData, forEdit = false, clientId = null) {

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
            return response.Error(`Client with the same ${field.split("-").join(" ")} is already registered`)
        }

        return response.Ok()
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
        const duplicateValidation = await checkDuplicate(check.field, check.where)
        if (duplicateValidation.status === "failed") return duplicateValidation
    }

    return response.Ok()
}

/**
 * Saves a client's profile picture to the filesystem.
 * @function
 * @param {Object} profilePicture - The profile picture data to be saved.
 * @returns {Object} A response object indicating the status of the operation.
 */
async function savePicture(profilePicture) {
	
    const randomString = crypto.randomBytes(32).toString("hex")
    const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, "").slice(0,32)

    const imageFormat = profilePicture.fromInput ? profilePicture.format : ".png"

    const imageName = [hash, imageFormat].join(".")
    const imagePath = path.join(__dirname, PROFILE_PATH, imageName)

    if (profilePicture.fromInput) {
        fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
    } else {
        const base64Image = profilePicture.base64.split("base64,").pop()
        await fs.promises.writeFile(imagePath, base64Image, { encoding: "base64" });
    }

    return imageName
}

/**
 * Deletes the clients picture especially if client wasnt saved.
 * 
 * @param {String} imageName - The filename for the image 
 */
async function deletePicture(imageName) {
    
    if (!imageName) return

    const imagePath = path.join(__dirname, PROFILE_PATH, imageName)
    const imageExists = fs.existsSync(imagePath)
    
    if (imageExists) {
        try {
            await fs.unlink(imagePath)
        } catch (error) {
            console.log("Failed to delete image", error);
        }
    }
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
    const missingElementFields = missingElements.map(field => clientFormFields[field]).join(", ")

    if (missingElements.length > 1) return [`${missingElementFields} are required`]
    if (missingElements.length === 1) return [`${missingElementFields} is required`]

    return null
}

/**
 * Gets the files for a client.
 * @param {number} clientId - The client id to associate the files with.
 * @returns {Object|null} - A response object or null.
 */
function getClientFiles(clientId) {

	return tryCatchWrapper(async() => {

		const clientFiles = await ClientFile.findAll({
			attributes: ['name'],
			where: {
				clientId: clientId
			}
		})

		if (clientFiles) {
            return clientFiles.map(file => {
                return {
                    path: path.join(path.resolve(__dirname, "../../assets/files/"), file.name),
                    fileName: file.name
                }
            })    
        }

	})

}

/**
 * The function `saveFiles` is an asynchronous function that takes in a client object, an array of
 * files, and a manager object as parameters, and it saves the files to a destination folder while also
 * creating corresponding records in the database.
 * 
 * @param client - The `client` parameter is an object that represents a client. It likely has
 * properties such as `id` and `fullName`.
 * @param files - An array of files that need to be saved. Each file object should have the following
 * properties:
 * @param manager - The `manager` parameter is an instance of a transaction manager. It is used to
 * ensure that all database operations within the `saveFiles` function are executed within a single
 * transaction. This helps maintain data consistency and allows for easy rollback in case of any
 * errors.
 * @returns a response object. If the files array is empty, it returns an "Ok" response. If there is an
 * error during the file saving process, it returns an "Error" response with the error message.
 * Otherwise, it returns an "Ok" response.
 */
async function saveFiles(client, files, manager) {
	
    if (files.length <= 0) return

    await Promise.all(files.map(async file => {

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

    }))
}

/**
 * The function `deleteFiles` asynchronously deletes multiple files and logs an error if any deletion
 * fails.
 * 
 * @param files - The `files` parameter is an array of file names or file paths that you want to
 * delete.
 * @returns The function `deleteFiles` returns a promise.
 */
async function deleteFiles(files) {
    if (files.length <= 0) return

    const mappedFileDeletionPromises = files.map(file => 
        deleteFile(file).catch(error => console.error(`Error in deleting file: ${error}`))
    )

    await Promise.all(mappedFileDeletionPromises)
}

/**
 * The function `deleteFile` deletes a file from a specified file path.
 * 
 * @param {String} fileName - The name of the file to delete
 * assuming that the fileName is from ClientFile.name.
 */
async function deleteFile(fileName) {
    const filePath = path.resolve(__dirname, "../../assets/files", fileName)
    const fileExists = fs.existsSync(filePath)

    const error = new Error("File does not exist")
    error.type = "Not found"

    if (!fileExists) throw error
    await fs.unlink(filePath)
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
async function deleteClient(clientId, event) {

    if (!clientId) return response.Error("Client id not found")

    const exportResponse = await exportRecord(clientId, event)

    if (exportResponse.status === "failed") {
        return exportResponse
    }

    const client = Client.findByPk(clientId, {
        include: "clientFiles"
    })

    if (!client) return response.Error("Failed to delete client record")

    try {
        await deleteFiles(client.fullName, client.clientFiles)
    } catch (error) {
        console.log(error)
        return response.Error("Failed to delete client")
    }

    try {
        await client.destroy()
    } catch (error) {
        return response.Error("Failed to delete client")
    }

    return response.Ok().addToast("Client deleted succesfully")
    
}

module.exports = {
    retrieveClientDocumentFilepath,
    updateClientProfilePicture,
    createNewConnectionStatus,
    updateClientPhoneNumber,
    retrieveClientForEdit,
    createNewPhoneNumber,
    checkDuplicateData,
    checkMissingFields,
    updateClientRecord,
    getClientFiles,
    deletePicture,
    deleteClient,
    createClient,
    savePicture,
    deleteFiles,
    deleteFile,
    saveFiles
}