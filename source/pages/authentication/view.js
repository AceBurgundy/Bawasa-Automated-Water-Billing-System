const { userRelationshipTypes, userTypes } = require("../../../model_helpers")
const UserPhoneNumber = require("../../../models/User_Phone_Number")
const User = require("../../../models/User")
const session = require("../../../session")
const { ipcMain } = require("electron")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const {
    isEmpty,
    isOverThan,
    isEmail,
    notIn,
    isBirthDate,
    isValidPhoneNumber
} = require("../input_validations")

ipcMain.handle("login", async (event, formData) => {
    
    const data = {
        status: "success",
        message: [],
    }

    const fields = {
        email: "Email",
        password: "Password"
    }

    const keysArray = Object.keys(formData)

    const missingElements = Object.keys(fields).filter((field) => !keysArray.includes(field))

    if (missingElements.length > 0) {
        data.status = "error"
        data.message = [`Missing elements: ${missingElements.map(field => fields[field]).join(", ")}`]
        return data
    }
    
    let errors = 0

    const validationMethods = {

        email: [
            [isEmpty, "Email"],
            [isEmail, "Email"],
            [isOverThan, 10, 255, "Email"]
        ],

        password: [
            [isEmpty, "Password"],
            [isOverThan, 10, 255, "Password"]
        ]

    }

    for (const [key, dirtyValue] of Object.entries(formData)) {

        const value = dirtyValue.trim()

        if (!validationMethods.hasOwnProperty(key)) {
            console.error(`Validation methods for key '${key}' not found.`)
            return
        }    
        
        validationMethods[key].forEach(([validationMethod, ...args]) => {
            const [validationErrors, validationMessage] = validationMethod(value, ...args)
            errors += validationErrors
            validationMessage.length > 0 && [...data.message, ...validationMessage]
        })

    }

    try {

        const user = await User.findOne({ where: { email: formData.email } })
    
        const userJSON = user ? user.toJSON() : null
        
        if (userJSON) {

            bcrypt
                .compare(formData.password, userJSON.password)
                .then((result) => {
                    if (!result) {
                        data.status = "error"
                        data.message.push("Password does not match!")
                        return data
                    }
                })
                .catch((error) => {
                    console.error("Error comparing passwords:", error)
                })

            const newAccesskey = await generateAccessKey()
            user.accessKey = newAccesskey

            await user.save()

            session.login(newAccesskey)

        } else {
            console.error("User is null")
        }
        
    } catch (error) {
        console.error(error.message)
    }
        
    if (errors > 0) {
        data.status = "error"
    }

    if (errors === 0) {
        data.message = ["Welcome"]
    }

    return data
})

ipcMain.handle("register", async (event, formData) => {
    
    const data = {
        status: "success",
        message: [],
    }

    const fields = {
        firstName: "First name",
        middleName: "Middle name",
        lastName: "Last name",
        birthDate: "Birthdate",
        age: "Age",
        relationshipStatus: "Relationship Status",
        phoneNumber: "Phone Number",
        email: "Email",
        password: "Password",
        userType: "User Type"
    }

    const keysArray = Object.keys(formData)

    const missingElements = Object.keys(fields).filter((field) => !keysArray.includes(field))

    if (missingElements.length > 0) {
        data.status = "error"
        data.message = [`Missing elements: ${missingElements.map(field => fields[field]).join(", ")}`]
        return data
    }

    let errors = 0

    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length
    const longestUserOption = Object.values(userTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestUserOption = Object.values(userTypes).reduce((a, b) => b.length < a.length ? b : a).length

    const validationMethods = {
                
        firstName: [
            [isEmpty, "First name"],
            [isOverThan, 2, 255, "First name"]
        ],

        middleName: [
            [isEmpty, "Middle name"],
            [isOverThan, 2, 255, "Middle name"]
        ],

        lastName: [
            [isEmpty, "Last name"],
            [isOverThan, 2, 255, "Last name"]
        ],

        birthDate: [
            [isEmpty, "Birthdate"],
            [isBirthDate]
        ],

        age: [
            [isEmpty, "Age"],
            [isOverThan, 15, 70, "Age"]
        ],

        relationshipStatus: [
            [isEmpty, "Relationship Status"],
            [isOverThan, shortestRelationshipOption, longestRelationshipOption, "Relationship Status"],
            [notIn, [...Object.values(userRelationshipTypes)], "Relationship Status"]
        ],

        phoneNumber: [
            [isEmpty, "Phone Number"],
            [isValidPhoneNumber, "Phone Number"]
        ],

        email: [
            [isEmpty, "Email"],
            [isEmail, "Email"],
            [isOverThan, 10, 255, "Email"]
        ],

        password: [
            [isEmpty, "Password"],
            [isOverThan, 10, 255, "Password"]
        ],

        userType: [
            [isEmpty, "User Type"],
            [isOverThan, shortestUserOption, longestUserOption, "User Type"],
            [notIn, [...Object.values(userTypes)], "User Type"]
        ]
    }

    for (const [key, dirtyValue] of Object.entries(formData)) {

        const value = dirtyValue.trim()

        if (!validationMethods.hasOwnProperty(key)) {
            console.error(`Validation methods for key '${key}' not found.`)
            return
        }    
        
        validationMethods[key].forEach(([validationMethod, ...args]) => {
            const [validationErrors, validationMessage] = validationMethod(value, ...args)
            errors += validationErrors
            validationMessage.length > 0 && [...data.message, ...validationMessage]
        })
    }

    try {
        const user = await User.findOne({ where: { email: formData.email } })

        if (user) {
            data.status = "error"
            data.message.push(`User ${formData.email} is already registered`)
            return data
        }

    } catch (error) {
        console.error(`\n\n${[...error.errors.map((err) => err.message)]}\n\n`)
    }

    formData.password = await bcrypt.hash(formData.password, 10)
    formData["accessKey"] = await generateAccessKey()

    try {

        const user = await User.create({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            relationshipStatus: formData.relationshipStatus,
            birthDate: formData.birthDate, 
            age: formData.age,
            userType: formData.userType,
            accessKey: formData.accessKey
        })

        if (user) {

            data.message.push("New admin added")
            await UserPhoneNumber.create({
                userId: user.id,
                phoneNumber: formData.phoneNumber
            })
        }

    } catch (error) {

        data.status = "error"
        errors++

        if (error.name === "SequelizeValidationError") {
            data.message.push(...error.errors.map((err) => err.message));
        } else {
            data.message.push(error.message);
        }

        console.error("Errors:", data.message);

    }

    if (errors > 0) {
        data.status = "error"
    }
    
    if (errors === 0) {
        data.message = ["Welcome"]
    }

    return data

})

ipcMain.handle("current_user", async event => {
    return await session.current_user()
})

async function generateAccessKey() {
    const randomString = crypto.randomBytes(32).toString('hex')
    const hash = bcrypt.hashSync(randomString, 10)
    return hash.slice(0, 64)
}