const { validateFormData, isEmail, isEmpty } = require("../../utilities/validations")

const UserPhoneNumber = require("../../../models/UserPhoneNumber")
const RecoveryCode = require("../../../models/RecoveryCode")
const User = require("../../../models/User")

const Response = require("../../utilities/Response")
const session = require("../../utilities/session")
const { db } = require("../../utilities/sequelize")

const { ipcMain } = require("electron")
const bcrypt = require("bcrypt")

const { 
    generateRecoveryCodes,
    generateAccessKey
} = require("./functions")

ipcMain.handle("reset-password", async (event, formData) => {

    const formDataIsEmpty = Object.keys(formData).length === 0

    if (formDataIsEmpty) {
        return new Response().Error("Form data seems to be empty")
    }

    const { email, userRecoveryCode } = formData

    if (!email) {
        return new Response().Error("An email is required to change your password")
    }

    validateResult = isEmail(email)

    if (!validateResult.passed) {
        return new Response().Error(validateResult.message)
    }

    if (!userRecoveryCode) {
        return new Response().Error("A recovery code is required to change your password")
    }

    if (userRecoveryCode.length > 8) {
        return new Response().Error("A recovery code shouldn't exceed 8 characters")
    }

    const inputRecoveryCodeHasSymbols = /[^a-zA-Z0-9]/.test(userRecoveryCode);

    if (inputRecoveryCodeHasSymbols) {
        return new Response().Error("A recovery code must not contain any symbols")
    }

    let user = null

    try {
        
        user = await User.findOne({ 
            where: { 
                email: email 
            },
            include: [
				{ 
                    model: RecoveryCode, 
                    as: "recoveryCodes",
                    attributes: ['code']
                },
            ]
        })
        
    } catch (error) {
        console.log(error);
        return new Response().Error("Error in searching for user")
    }

    if (!user) {
        return new Response().Error(`User with email ${formData.email} might not have been registered yet`)
    }

    const userRecoveryCodes = user.recoveryCodes.map(recoveryCode => recoveryCode.code)
    
    // No need for await as it will be used inside Promise.all()
    const recoveryCodeComparisons = userRecoveryCodes.map(recoveryCode => {
        return bcrypt.compare(userRecoveryCode, recoveryCode)
    })

    const matchFound = "Recovery code matched. Enter new password"
    const noMatches = "Recovery code did not match"

    try {
        
        const results = await Promise.all(recoveryCodeComparisons);
        const matched = results.some(result => result === true);

        return matched ? new Response().Ok(matchFound) : new Response().Error(noMatches)

    } catch (error) {
        console.log(error);
        return new Response().Error("Error in comparing recovery codes")        
    }

})

ipcMain.handle("change-password", async (event, args) => {

    if (!args.email) {
        return new Response().Error("Email is required to change password")
    }

    if (!args.password) {
        return new Response().Error("New Password is required to change old password")
    }

    const { email, password } = args

    const emptyEmailResponse = isEmpty(email)

    if (emptyEmailResponse.passed === "false") {
        return new Response().Error("Email is required to change password")
    }

    const anEmail = isEmail(email)

    if (anEmail.passed === "false") {
        return new Response().Error("Email must be of type 'email' required to change password")
    }

    if (password.trim() === '') {
        return new Response().Error("New Password is required to change old password")
    }

    try {
        
        const user = await User.findOne({
            where: {
                email: email
            }
        })
    
        if (!user) {
            return new Response().Error("User not found might not have been registered")
        }

        user.password = await bcrypt.hash(password, 10)

        await db.transaction(async manager => {
            await user.save({ transaction: manager })
        })

        return new Response().Ok("Password changed successfully")

    } catch (error) {
        console.log(error)        
        return new Response().Error("Error in updating the password")
    }

})
  
ipcMain.handle("login", async (event, formData) => {

    const formDataIsEmpty = Object.keys(formData).length === 0

    if (formDataIsEmpty) {
        return new Response().Error("Form data seems to be empty")
    }

    const fields = {
        password: "Password",
        email: "Email",
    }

    const formDataFieldNames = Object.keys(formData)
    const defaultFieldNames = Object.keys(fields)

    const missingFields = defaultFieldNames.filter(field => {
        return !formDataFieldNames.includes(field)
    })

    if (missingFields.length > 0) {
        const joinedMissingFields = Object.keys(missingFields).join(", ")
        return new Response().Error(`Missing fields: ${joinedMissingFields}`)
    }

    const validateFormDataResponse = validateFormData(formData)

    if (validateFormDataResponse.status === false) {
        const { field, message } = validateFormDataResponse
        return new Response().ErrorWithData(field, message)
    }

    try {

        const user = await User.findOne({ 
            where: { 
                email: formData.email 
            } 
        })
        
        if (!user) {
            return new Response().Error(`User with email ${formData.email} might not have been registered yet`)
        }

        const passwordMatched = await bcrypt.compare(formData.password, user.password)

        if (!passwordMatched) {
            return new Response().Error("Password does not match")
        }

        const newAccesskey = await generateAccessKey()
        user.accessKey = newAccesskey

        await db.transaction(async manager => {
            await user.save({ transaction: manager})
        })

        session.login(newAccesskey)

        return new Response().Ok(`Welcome ${user.firstName}`)

    } catch (error) {
        console.error(error.message)
        return new Response().Error("Failed to log the user in")
    }
    
})

ipcMain.handle("register", async (event, formData) => {

    const formDataIsEmpty = Object.keys(formData).length === 0

    if (formDataIsEmpty) {
        return new Response().Error("Form data seems to be empty")
    }
    
    const fields = {
        relationshipStatus: "Relationship Status",
        phoneNumber: "Phone Number",
        middleName: "Middle name",
        firstName: "First name",
        birthDate: "Birthdate",
        lastName: "Last name",
        password: "Password",
        email: "Email",
        age: "Age"
    }

    const formDataFieldNames = Object.keys(formData)
    const defaultFieldNames = Object.keys(fields)

    const missingFields = defaultFieldNames.filter(field => {
        return !formDataFieldNames.includes(field)
    })

    if (missingFields.length > 0) {
        const joinedMissingFields = Object.keys(missingFields).join(", ")
        return new Response().Error(`Missing fields: ${joinedMissingFields}`)
    }

    const validateFormDataResponse = validateFormData(formData)

    if (validateFormDataResponse.status === false) {
        const { field, message } = validateFormDataResponse
        return new Response().ErrorWithData(field, message)
    }

    try {
        
        const user = await User.findOne({ 
            where: { 
                email: formData.email 
            } 
        })

        if (user) return new Response().Error(`User ${formData.email} is already registered`)

    } catch (error) {
        console.log(error)
        return new Response().Error("Failed to find duplicated user")
    }

    formData.password = await bcrypt.hash(formData.password, 10)
    formData["accessKey"] = generateAccessKey()

    const FAILED_RECOVERY_CODE_CREATE = "failed_recovery_code_generation"
    try {

        let user = null
        let recoveryCodes = null

        await db.transaction(async manager => {

            user = await User.create({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                relationshipStatus: formData.relationshipStatus,
                birthDate: formData.birthDate,
                age: formData.age,
                accessKey: formData.accessKey,
            }, { transaction: manager })

            await UserPhoneNumber.create({
                userId: user.id,
                phoneNumber: formData.phoneNumber,
            }, { transaction: manager })

            // insert hashed recovery codes into the database
            const generateCodes = await generateRecoveryCodes(user.id, manager)

            if (generateCodes.status === "failed") {
                const error = new Error(generateCodes.toast[0])
                error.type = FAILED_RECOVERY_CODE_CREATE
                throw error
            }

            recoveryCodes = generateCodes.recoveryCodes

        })

        return new Response()
                .success()
                .addToast(`New admin ${user.firstName} added`)
                .addObject("recoveryCodes", recoveryCodes)
                .getResponse()
        
    } catch (error) {

        console.log(error)

        if (error.type === FAILED_RECOVERY_CODE_CREATE) {
            return new Response().Error(error.message)
        }

        if (error.name === "SequelizeValidationError") {
            let errors = [...error.errors.map(error => error.message)];
            return new Response().Error(errors);
        }        

        return new Response().Error(error.message)

    }

})

