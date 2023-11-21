const { tryCatchWrapper, joinAndResolve } = require("../../utilities/helpers")
const Response = require("../../utilities/response")
const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientFile = require("../../../models/ClientFile")
const Client = require("../../../models/Client")

const response = new Response()

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

const retrieveClientDocumentFilepath = filename => joinAndResolve([__dirname, "../../assets/files/"], filename)

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
 * Saves files for a client, associating them with the client and moving them to a destination folder.
 * @param {Object} client - The client object to associate the files with.
 * @param {Array} files - An array of files to save.
 * @param {Object} manager - The transaction manager for database operations.
 * @returns {Object} - A response object.
 */
async function saveFiles(client, files, manager) {
	
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

module.exports = {
    retrieveClientDocumentFilepath,
    checkDuplicateClient,
    checkMissingFields,
    getClientFiles,
    deletePicture,
    savePicture,
    deleteFiles,
    deleteClient,
    saveFiles
}