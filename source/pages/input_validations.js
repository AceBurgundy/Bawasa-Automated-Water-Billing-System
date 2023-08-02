const isEmpty = (value, name) => {

    let errors = 0
    let message = []

    if (!value) {
        console.error("value not provided for isEmpty")
    }

    if (!name) {
        console.error("name not provided for isEmpty")
    }

    if (value === "") {
        message.push(`${name} cannot be empty`)
        errors++
    }

    return [errors, message]
}

const isOverThan = (value, start, limit, name) => {
    let errors = 0
    let message = []

    let number = parseInt(value)

    if (isNaN(number)) {
        number = value.length
    }

    if (!value) {
        console.error("Value not provided for isOverThan")
    }

    if (!start) {
        console.error(`start not provided for isOverThan for ${name}`)
    }

    if (!limit) {
        console.error("limit not provided for isOverThan")
    }

    if (number > limit) {
        message.push(`${name} cannot be greater than ${limit}`)
        errors++
    }

    if (number < start) {
        message.push(`${name} cannot be less than ${start}`)
        errors++
    }

    return [errors, message]
}


const isEmail = (value) => {

    let errors = 0
    let message = []

    if (!value) {
        console.error("value not provided for isEmail")
    }

    if (!value.includes("@")) {
        message.push("Missing '@'")
        errors++
    }

    return [errors, message]

}

const notIn = (value, list, name) => {

    let errors = 0
    let message = []

    if (!value) {
        console.error("value not provided for notIn")
    }

    if (!name) {
        console.error("name not provided for notIn")
    }

    if (!list.includes(value)) {
        message.push(`${value} not among the choices`)
        errors++
    }

    return [errors, message]

} 

const isBirthDate = (value) => {

    let errors = 0
    let message = []

    if (!value) {
        console.error("value not provided for birthdate")
    }

    const enteredDate = new Date(value)
    if (isNaN(enteredDate.getTime())) {
        message.push("Please enter a valid birthdate mm/dd/yyyy")
        errors++
    }

    return [errors, message]

}

const isValidPhoneNumber = (value, name) => {
    let errors = 0
    let message = []

    const phoneNumberRegex = /^\d{10}$/

    if (!value) {
        console.error("value not provided for isValidPhoneNumber")
    }

    if (!name) {
        console.error("name not provided for isValidPhoneNumber")
    }

    if (!phoneNumberRegex.test(value)) {
        message.push(`${value} is not a valid ${name}`)
        errors++
    }

    return [errors, message]
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        isEmpty,
        isOverThan,
        isEmail,
        notIn,
        isBirthDate,
        isValidPhoneNumber
    }
} else {
    window.isEmpty = isEmpty
    window.isOverThan = isOverThan
    window.isEmail = isEmail
    window.notIn = notIn
    window.isBirthDate = isBirthDate
    window.isValidPhoneNumber = isValidPhoneNumber
}
