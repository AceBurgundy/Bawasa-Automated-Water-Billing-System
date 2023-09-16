const Response = require("../../utilities/response")
const session = require("../../utilities/session")
const { ipcMain } = require("electron")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const UserPhoneNumber = require("../../../models/UserPhoneNumber")
const User = require("../../../models/User")

const {
    validateFormData,
} = require("../../utilities/validations")

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

        const userJSON = user ? user.toJSON() : null

        if (!userJSON) {
            return response
                .failed()
                .addToast(`User with email ${formData.email} might not have been registered yet`)
                .getResponse()
        }

        bcrypt
            .compare(formData.password, userJSON.password)
            .then(result => {
                if (!result) {
                    return response
                        .failed()
                        .addToast("Password does not match")
                        .getResponse()
                }
            })
            .catch(error => {
                console.error("Error comparing passwords:", error)
            })

        const newAccesskey = await generateAccessKey()
        user.accessKey = newAccesskey

        await user.save()

        session.login(newAccesskey)

        return response.success().addToast(`Welcome ${user.firstName}`).getResponse()

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

        return response.success().addToast(`New admin ${user.firstName} added`).getResponse()

    } catch (error) {

        let errors = []

        if (error.name === "SequelizeValidationError") {
            [...error.errors.map(err => errors.push(err.message))]
        } else {
            errors.push(error.message)
        }

        console.error("Errors:", data.message)

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
