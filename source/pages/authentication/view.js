const { validateFormData, isEmail, isEmpty } = require("../../utilities/validations")
const Response = require("../../utilities/response")
const session = require("../../utilities/session")
const { ipcMain } = require("electron")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const UserPhoneNumber = require("../../../models/UserPhoneNumber")
const RecoveryCode = require("../../../models/RecoveryCode")
const User = require("../../../models/User")
const { tryCatchWrapper } = require("../../utilities/helpers")

ipcMain.handle("reset-password", async (event, formData) => {

    const response = new Response()

    if (Object.keys(formData).length === 0) {
        console.error("Form data seems to be empty")
        return response.failed().addToast("Something went wrong").getResponse()
    }

    const { email, userRecoveryCode } = formData

    if (!email) {
        return response.failed().addToast("An email is required to change your password").getResponse()
    }

    validateResult = isEmail(email)

    if (!validateResult.passed) {
        return response.failed().addToast(validateResult.message).getResponse()
    }

    if (!userRecoveryCode) {
        return response.failed().addToast("A recovery code is required to change your password").getResponse()
    }

    if (userRecoveryCode.length > 8) {
        return response.failed().addToast("A recovery code shouldn't exceed 8 characters").getResponse()
    }

    const userRecoveryCodeHasSymbols = /[^a-zA-Z0-9]/.test(userRecoveryCode);

    if (userRecoveryCodeHasSymbols) {
        return response.failed().addToast("A recovery code must not contain any symbols").getResponse()
    }

    return tryCatchWrapper(async () => {
        
        const user = await User.findOne({ 
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
        
        const userJSON = user ? user.toJSON() : null

        if (!userJSON) {
            return response
                .failed()
                .addToast(`User with email ${formData.email} might not have been registered yet`)
                .getResponse()
        }

        const userRecoveryCodes = user.recoveryCodes.map(recoveryCode => recoveryCode.code)
        
        const promises = userRecoveryCodes.map(recoveryCode => bcrypt.compare(userRecoveryCode, recoveryCode))

        return tryCatchWrapper(async () => {

            const results = await Promise.all(promises);
            console.log(results);
            const hasMatchingRecoveryCode = results.some(result => result === true);
        
            if (hasMatchingRecoveryCode) {
                return response.success().addToast("Recovery code matched. Enter new password").getResponse()
            } else {
                return response.failed().addToast("Recovery code did not match").getResponse()
            }

        })
    })
})

ipcMain.handle("change-password", async (event, args) => {

    const response = new Response()

    if (!args.email) {
        console.log("line 97");
        return response.failed().addToast("Email is required to change password").getResponse()
    }

    if (!args.password) {
        return response.failed().addToast("New Password is required to change old password").getResponse()
    }

    const { email, password } = args

    const emailIsEmpty = isEmpty(email)

    if (emailIsEmpty.passed === "false") {
        return response.failed().addToast("Email is required to change password").getResponse()
    }

    const anEmail = isEmail(email)

    if (anEmail.passed === "false") {
        return response.failed().addToast("Email must be of type 'email' required to change password").getResponse()
    }

    if (password.trim() === '') {
        return response.failed().addToast("New Password is required to change old password").getResponse()
    }

    return tryCatchWrapper(async () => {
        const user = await User.findOne({ where: { email: email } })
        
        const userJSON = user ? user.toJSON() : null

        if (!userJSON) {
            return response
                .failed()
                .addToast(`User with email ${formData.email} might not have been registered yet`)
                .getResponse()
        }

        user.password = await bcrypt.hash(password, 10)
        user.save()

        return response.success().addToast("Password changed successfully").getResponse()
    })
})
  
ipcMain.handle("login", async (event, formData) => {

    const response = new Response()

    if (Object.keys(formData).length === 0) {
        console.error("Form data seems to be empty")
        return response.failed().addToast("Something went wrong").getResponse()
    }

    const fields = {
        email: "Email",
        password: "Password",
    }

    const keysArray = Object.keys(formData)

    const missingElements = Object.keys(fields).filter( field => !keysArray.includes(field))

    if (missingElements.length > 0) {
        return response
            .failed()
            .addToast(
                `Missing elements: ${missingElements
                    .map(field => fields[field])
                    .join(", ")}`
            )
            .getResponse()
    }

    const validateResponse = validateFormData(formData)

    if (validateResponse.status === false) {
        const { field, message } = validateResponse

        return response.failed().addFieldError(field, message).getResponse()
    }

    try {
        const user = await User.findOne({ where: { email: formData.email } })
        
        const userJSON = user ? user.toJSON() : null

        if (!userJSON) {
            return response
                .failed()
                .addToast(`User with email ${formData.email} might not have been registered yet`)
                .getResponse()
        }

        const passwordPassed = await bcrypt.compare(formData.password, userJSON.password)

        if (!passwordPassed) {
            return response
                .failed()
                .addToast("Password does not match")
                .getResponse()
        }

        const newAccesskey = await generateAccessKey()
        user.accessKey = newAccesskey

        await user.save()

        session.login(newAccesskey)

        return response
                .success()
                .addToast(`Welcome ${user.firstName}`)
                .getResponse()

    } catch (error) {
        console.error(error.message)
    }
    
})

ipcMain.handle("register", async (event, formData) => {

    const response = new Response()

    if (Object.keys(formData).length === 0) {
        console.error("Form data seems to be empty")
        return response.failed().addToast("Something went wrong").getResponse()
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
    }

    const keysArray = Object.keys(formData)

    const missingElements = Object.keys(fields).filter(
        field => !keysArray.includes(field)
    )

    if (missingElements.length > 0) {
        return response
            .failed()
            .addToast(
                `Missing elements: ${missingElements
                    .map(field => fields[field])
                    .join(", ")}`
            )
            .getResponse()
    }

    const validateResponse = validateFormData(formData)

    if (validateResponse.status === false) {
        const { field, message } = validateResponse

        return response.failed().addFieldError(field, message).getResponse()
    }

    try {
        
        const user = await User.findOne({ where: { email: formData.email } })

        if (user) {
            return response
                .failed()
                .addToast(`User ${formData.email} is already registered`)
                .getResponse()
        }

    } catch (error) {
        console.error(`\n\n${[...error.errors.map(err => err.message)]}\n\n`)
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
            accessKey: formData.accessKey,
        })

        await UserPhoneNumber.create({
            userId: user.id,
            phoneNumber: formData.phoneNumber,
        })

        // insert hashed recovery codes into the database
        const generatationResponse = await generateRecoveryCodes(user.id)
        if (generatationResponse.status === "failed") {
            await user.destroy()
            return response
                .failed()
                .addToast(generatationResponse.toast[0])
                .getResponse()
        }

        return response
                .success()
                .addToast(`New admin ${user.firstName} added`)
                .addObject("recoveryCodes", generatationResponse.recoveryCodes)
                .getResponse()
        
    } catch (error) {

        let errors = []

        if (error.name === "SequelizeValidationError") {
            [...error.errors.map(err => errors.push(err.message))]
        } else {
            errors.push(error.message)
        }

        console.error("Errors:", error.message)

        return response
            .failed()
            .addToast(errors)
            .getResponse()

    }

})

async function generateAccessKey() {
    const randomString = crypto.randomBytes(32).toString("hex")
    const hash = bcrypt.hashSync(randomString, 10)
    return hash.slice(0, 64)
}

async function generateRecoveryCodes(userId) {

    const response = new Response();

    if (!userId) {
        console.error("Missing user id for generating recovery codes")
        return response
                .failed()
                .addToast("Failed to generate recovery codes bacause of missing user id")
                .getResponse()
    }
    
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const promises = [];
    const codes = []

    try {
        for (let outer = 0; outer < 12; outer++) {
            let code = Array.from({ length: 8 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
            codes.push(code)        
            promises.push(
                RecoveryCode.create({
                    code: await bcrypt.hash(code, 10),
                    userId: userId
                })
            );
        }

        await Promise.all(promises);
        return response
                .success()
                .addObject("recoveryCodes", codes)
                .getResponse();

    } catch (error) {
        console.error(error);
        return response
                .failed()
                .addToast(`Failed to add recovery codes`)
                .getResponse();
    }

}
