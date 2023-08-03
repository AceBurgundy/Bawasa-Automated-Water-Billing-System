const ClientPhoneNumber = require("../../../models/Client_Phone_Number")
const { userRelationshipTypes } = require("../../../model_helpers")
const Client_Address = require("../../../models/Client_Address")
const { db } = require("../../../sequelize_init")
const Client = require("../../../models/Client")
const { ipcMain } = require("electron")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs")

const {
    isEmpty,
    isOverThan,
    isEmail,
    notIn,
    isBirthDate,
    isValidPhoneNumber
} = require("../input_validations")

ipcMain.handle("add-client", async (event, formDataBuffer) => {

	const formData = formDataBuffer.formData
	const profilePicture = formDataBuffer.image

	const data = {
		status: "success",
		message: []
	}

    const errorData = message => {
        data.status = "error"
        data.message = [...data.message, message]
        return data
    }

	const returnCatchError = error => {

		if (error.name === "SequelizeValidationError") {
			return errorData(error.message.replace("Validation error: ", ''))
		}

	}
    
	if (!profilePicture) {
		return errorData(["Client image cannot be empty"])
	}

	if (!formData) {
		return errorData(["Client details are missing"])
	}

	try {

		const clientByName = await Client.findOne({
			where: {
				firstName: formData.firstName,
				middleName: formData.middleName,
				lastName: formData.lastName,
				email: formData.email,
			},
		})

		if (clientByName) {
			return errorData(["Client with the same name is already registered"])
		}

		const clientByEmail = await Client.findOne({
			where: {
				email: formData.email
			}
		})

		if (clientByEmail) {
			return errorData(["Email is already registered"])
		}

		const clientByPhone = await ClientPhoneNumber.findOne({
			where: {
				phoneNumber: formData.phoneNumber
			}
		})

		if (clientByPhone) {
			return errorData(["Client with the same phone number is already registered"])
		}

	} catch (error) {
		console.error("Error while searching for the client:", error)
	}

	const fields = {
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

	const keysArray = Object.keys(formData)

	const missingElements = Object.keys(fields).filter(field => !keysArray.includes(field))

	if (missingElements.length > 0) {
        return errorData([`View Missing elements: ${missingElements.map(field => fields[field]).join(", ")}`])
	}

	let errors = 0

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
			[isOverThan, 15, 70]
		],

		email: [
			[isEmpty],
			[isEmail],
			[isOverThan, 10, 255]
		],

		occupation: [
			[isEmpty],
			[isOverThan, 10, 255]
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
					const [validationErrors, validationMessage] = validationMethod(value, ...args)
					errors += validationErrors
					validationMessage.length > 0 && [...data.message, ...validationMessage]
				})
			}
		}
	}

	if (errors > 0) {
		data.status = "error"
        return data
    }
	
	try {

		await db.transaction(async manager => {

			const mainAddress = await Client_Address.create(
				{
					street: formData.mainAddressStreet,
					subdivision: formData.mainAddressSubdivision,
					barangay: formData.mainAddressBarangay,
					city: formData.mainAddressCity,
					province: formData.mainAddressProvince,
					postalCode: formData.mainAddressPostalCode,
					details: formData.mainAddressDetails,
				},
				{ transaction: manager }
			)

			const presentAddress = await Client_Address.create(
				{
					street: formData.presentAddressStreet,
					subdivision: formData.presentAddressSubdivision,
					barangay: formData.presentAddressBarangay,
					city: formData.presentAddressCity,
					province: formData.presentAddressProvince,
					postalCode: formData.presentAddressPostalCode,
					details: formData.presentAddressDetails,
				},
				{ transaction: manager }
			)

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
					mainAddressId: mainAddress.id,
					presentAddressId: presentAddress.id,
				},
				{ transaction: manager }
			)

			await ClientPhoneNumber.create(
				{
					clientId: client.id,
					phoneNumber: formData.phoneNumber,
				},
				{ transaction: manager }
			)

			mainAddress.clientId = client.id
			await mainAddress.save()

			presentAddress.clientId = client.id
			await presentAddress.save()
		})

	} catch (error) {

		console.log(`\n\n${error.name}\n\n`)
		if (error.name === "SequelizeValidationError" || error.name === "ValidationError") {
			return returnCatchError(error)
		} else {
			return errorData(["Error in registering client"])
		}
		
	}

	const randomString = crypto.randomBytes(32).toString('hex')
	const hash = bcrypt.hashSync(randomString, 10).replace(/[/+\$\.]/g, '')
	let imagePath = null

    if (profilePicture.fromInput) {

        imagePath = path.join(__dirname, "../../assets/images/clients/profile", `${hash.slice(0,32)}.${profilePicture.format}`)

        try {
            fs.writeFileSync(imagePath, fs.readFileSync(profilePicture.path))
        } catch (error) {
			console.log(`\n\n${error}\n\n`)
            return errorData(["Error saving client image input"])
        }

    } else {

        imagePath = path.join(__dirname, "../../assets/images/clients/profile", `${hash.slice(0, 32)}.png`)
		
		const base64Image = profilePicture.base64.split('base64,').pop()
		
		fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, error => {
			if (error) {
				console.log(`\n\n${error}\n\n`)
				return errorData(["Error saving client image capture"])
			}
		})

    }
	
	data.message = ["Client Succesfully registered"]
	
    return data
})

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
