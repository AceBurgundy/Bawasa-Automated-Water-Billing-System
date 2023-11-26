const { validateFormData } = require("../../utilities/validations")
const { tryCatchWrapper } = require("../../utilities/helpers")
const Response = require("../../utilities/Response")

const { ipcMain } = require("electron")
const { Op } = require('sequelize')
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")

const UserPhoneNumber = require("../../../models/UserPhoneNumber")
const UserAddress = require("../../../models/UserAddress")
const User = require("../../../models/User")

/**
 * Handles the "get-user-profile-path" IPC message to retrieve the path of a user's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {string} string - The name of the users image file.
 * @returns {string} The path to the user's image.
 */
ipcMain.handle("get-user-profile-path", async (event, string) => {
	return path.join(path.resolve(__dirname, '../../assets/images/admin/profile/'), string)
})

/**
 * Handles the "get-user-default-profile-path" IPC message to retrieve the path of a user's image.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @returns {string} The path to the default user image.
 */
ipcMain.handle("default-user-image", async event => {
	return path.resolve(__dirname, '../../assets/images/user.png')
})

const userFormFields = {
    firstName: "First Name",
    middleName: "Middle Name",
    lastName: "Last Name",
    relationshipStatus: "Relationship Status",
    birthDate: "Birthdate",
    age: "Age",
    email: "Email",
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
 * Handles the "edit-user" IPC message to edit an existing user.
 * @function
 * @param {Electron.Event} event - The IPC event object.
 * @param {Object} formDataBuffer - Buffer containing form data.
 * @param {number} userId - The ID of the user being edited.
 * @returns {Promise<Response>} A new Response() object indicating the operation's status.
 */
ipcMain.handle("edit-user", async (event, data) => {

	const { formData, profilePicture } = data.formDataBuffer
	const userId = data.userId

	const user = await tryCatchWrapper(async () => {		
		return await User.findByPk(userId, {
			include: [
				{ 
					model: UserPhoneNumber, 
					as: "phoneNumbers",
					attributes: ['phoneNumber']
				},
				{ model: UserAddress, as: "mainAddress" },
				{ model: UserAddress, as: "presentAddress" }
			]
		})
	})

	if (!user) {
		return new Response().Error("User not found")
	}

	if (!formData) {
		return new Response().Error("User details are missing")
	}

	const userDuplicate = await checkDuplicateUser(formData, true, userId)
	if (userDuplicate.hasDuplicate) return new Response().Error(userDuplicate.message)

	const missingFields = checkMissingFields(formData)
	missingFields && new Response().Error(missingFields)
	
    const validateResponse = validateFormData(formData)
    
    if (validateResponse.status === false) {
        const { field, message } = validateResponse

        return new Response().ErrorWithData(field, message)
    }
	
	const oldUserData = user.toJSON()

	const hasProfilePicture = Object.keys(profilePicture).length > 0

	if (hasProfilePicture) {

		// deletes old profile picture and adds the new one
		// problems: resaves the old picture if unchanged (Could be good to rehash the same image every time the form is edited)
		const saveNewProfilePicture = savePicture(profilePicture)

		if (saveNewProfilePicture.status === "success") {

			if (oldUserData.profilePicture) {
				const oldProfilePicturePath = path.join(path.resolve(__dirname, '../../assets/images/users/profile/'), oldUserData.profilePicture)
			
				fs.unlink(oldProfilePicturePath, error => {
					if (error) {
						console.error("Error deleting user old profile picture:", error)
					}
				})
			}

			user.profilePicture = saveNewProfilePicture.imageName
		
			await tryCatchWrapper(async() => {
				user.save()
			})

		} else {
			return Error(saveNewProfilePicture.message)
		}

	}


	// Update the user record
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
		 *  user.mainAddress["street"] = value of mainAddrressStreet key
		 * }
		 */
		if (key.includes("mainAddress")) {
			const addressKey = key.replace("mainAddress", "")
			const modifiedAddressKey = addressKey.charAt(0).toLowerCase() + addressKey.slice(1)
			user.mainAddress[modifiedAddressKey] = formData[key]
			continue
		}
	
		if (key.includes("presentAddress")) {
			const addressKey = key.replace("presentAddress", "")
			user.presentAddress[addressKey] = formData[key]
			continue
		}

		user[key] = formData[key]
	
	}

	/**
	 * This adds a new phone number to the client instead of replacing their old phone numbers
	 * This will also work assuming that the same phone number isn't added on the same client preventing duplicates.
	 * 
	 * client.UserPhoneNumber = [
	 * 		{ phoneNumber: XXXXXXXXXX},
	 * 		{ phoneNumber: XXXXXXXXXX},
	 * ]
	 */
	const newPhoneNumberNotExists  = user.phoneNumbers.filter(record => record.phoneNumber === formData.phoneNumber).length <= 0

	if (newPhoneNumberNotExists) {
		tryCatchWrapper(async () => {
			await UserPhoneNumber.create({
				clientId: user.id,
				phoneNumber: formData.phoneNumber,
			})	
		})
	}

	await tryCatchWrapper(async () => {
		user.save()
	})

	return new Response().Ok("User succesfully edited")
})

/**
 * Checks for duplicate user records based on provided form data.
 * @async
 * @function
 * @param {Object} formData - The form data to check for duplicates.
 * @param {boolean} [forEdit=false] - Indicates if the check is for editing an existing user.
 * @param {number} [userId=null] - The ID of the user being edited.
 * @returns {Promise<Object>} An object containing duplicate check results.
 */
async function checkDuplicateUser(formData, forEdit = false, userId = null) {

    const response = { hasDuplicate: false, message: "" }

    const responseWithMessage = (message) => {
        response.hasDuplicate = true
        response.message = message
        return response
    }

	const checkDuplicate = async (field, where) => {

		if (forEdit && userId !== null) {

			if (field === "phone-number") {
				where[Op.and].unshift(
					{
						userId: { [Op.not]: userId }
					}
				)
			} else {
				where[Op.and].unshift(
					{
						id: { [Op.not]: userId }
					}
				)
			}
		}

		console.log(where);
	  
		const duplicateCount = await tryCatchWrapper(() =>
		  field === "phone-number"
			? ClientPhoneNumber.findAll({ where })
			: Client.findAll({ where })
		)
	  
		if (duplicateCount > 0) {
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
 * Saves a user's profile picture to the filesystem.
 * @function
 * @param {Object} profilePicture - The profile picture data to be saved.
 * @returns {Response} A new Response() object indicating the status of the operation.
 */
function savePicture(profilePicture) {

	const randomString = crypto.randomBytes(32).toString("hex")
	const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, "")
	let imagePath = null
	let imageName = null

	if (profilePicture.fromInput) {

		imageName = [hash.slice(0, 32), profilePicture.format].join(".")
		imagePath = path.join(__dirname, "../../assets/images/users/profile", imageName)

		try {
			fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
		} catch (error) {
			console.log(`\n\n${error}\n\n`)
			return new Response().ErrorWithData("message", "Error saving user image input")
		}

	} else {

		imageName = [hash.slice(0, 32), ".png"].join("")

		imagePath = path.join(__dirname, "../../assets/images/users/profile", imageName)

		const base64Image = profilePicture.base64.split("base64,").pop()

		fs.writeFile(imagePath, base64Image, { encoding: "base64" }, error => {
			if (error) {
				console.log(`\n\n${error}\n\n`)
				return new Response().ErrorWithData("message", "Error saving user image capture")
			}
		})
	}

	return new Response().OkWithData("imageName", imageName)
}

/**
 * Checks for missing fields in the provided form data.
 * @function
 * @param {Object} formData - The form data to check for missing fields.
 * @returns {string[]|null} An array of missing field messages or null if all fields are present.
 */
function checkMissingFields(formData) {

	const formDataFieldNames = Object.keys(formData)
	const missingElements = Object.keys(userFormFields).filter(fieldName => !formDataFieldNames.includes(fieldName))

	if (missingElements.length > 1) {
		return [`${missingElements.map(field => userFormFields[field]).join(", ")} are required`]
	} 
	
	if (missingElements.length === 1) {
		return [`${missingElements.map(field => userFormFields[field]).join("")} is required`]
	}

	return null
}

/**
 * Deletes a user and their associated files, if any.
 * If the user's one-to-many associations have cascade set to true on delete,
 * this function will also delete their records on that data.
 *
 * @param {number} userId - The unique identifier of the user to delete.
 * @returns {Promise<Response>} A Promise that resolves with a Response object
 * representing the result of the delete operation. The Response object can be
 * used to check the success or failure of the operation.
 *
 * @async
 * @example
 * const userId = 123;
 * const new Response() = await deleteUser(userId);
 * if (new Response().status === "success") {
 *   console.log('User deleted successfully.');
 * } else {
 *   console.error('Failed to delete user:', new Response().getError());
 * }
 */
async function deleteUser(userId, saveData = false) {

	const user = User.findByPk(userId, {
		include: "userFiles"
	})

	if (!user) return new Response().Error("Failed to delete user record")

	if (user.userFiles.length > 0) {

        user.userFiles.forEach(async file => {

            const filePath = path.join(path.resolve(__dirname, "../../assets/files/"), file.name )

            tryCatchWrapper(async () => {
				const fileExists = await fs.pathExists(filePath)

                if (fileExists) {
                    await fs.remove(filePath)
                } else {
                    console.log(`File ${file.name} not found`)
                }
			})
        })
    }

	try {
        await user.destroy()
        return new Response().Ok("User deleted succesfully")
    } catch (error) {
        return new Response().Error("Failed to delete user")
    }
	  
}

// FILES SAVE TO EXCEL OR WORD IS AS MUST BEFORE CLIENT DELETION (EXCEL IS RECOMMENDED TO ALLOW FOR CLIENT RESTORATION)