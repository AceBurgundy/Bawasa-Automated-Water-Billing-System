const isEmpty = (value) => {

    let errors = 0
    let message = []

    if (value === "") {
        message.push(`Cannot be empty`)
        errors++
    }

    return [errors, message]
}

const isOverThan = (value, start, limit) => {
    let errors = 0
    let message = []

    const [error, messages] = isEmpty(value)
    
    if (error) {
        return [error, messages]
    }

    let number = parseInt(value)

    if (isNaN(number)) {
        number = value.length
    }

    if (number > limit) {
        message.push(`Cannot be greater than ${limit}`)
        errors++
    }

    if (number < start) {
        message.push(`Cannot be less than ${start}`)
        errors++
    }

    return [errors, message]
}


const isEmail = (value) => {

    let errors = 0
    let message = []

    if (!value.includes("@")) {
        message.push("Missing '@'")
        errors++
    }

    return [errors, message]

}

const notIn = (value, list) => {

    let errors = 0
    let message = []

    if (!list.includes(value) && value) {
        message.push(`${value} not among the choices`)
        errors++
    }

    return [errors, message]

} 

const isBirthDate = (value) => {

    let errors = 0
    let message = []

    if (value) {
        const enteredDate = new Date(value)
        if (isNaN(enteredDate.getTime())) {
            message.push("Please enter a valid birthdate mm/dd/yyyy")
            errors++
        }
    }

    return [errors, message]

}

const isValidPhoneNumber = (value) => {
    let errors = 0
    let message = []

    const phoneNumberRegex = /^\d{10}$/

    if (!phoneNumberRegex.test(value) && value) {
        message.push(`${value} is not a valid phone number`)
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
