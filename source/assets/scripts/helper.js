export function transition(callback) {
    const box = document.getElementById("container")
    callback()

    setTimeout(() => {
        if (box) {
            const lastChild = box.lastElementChild
            lastChild.style.zIndex = "3"
            lastChild.classList.add("active")
        }
    }, 200)

    setTimeout(() => {
        if (box) {
            box.firstElementChild.remove()
            box.lastElementChild.style.zIndex = "2"
        }
    }, 800)
}

/**
 * Creates a toast notification element and appends it to the flashes container.
 * @param {string} message - The message content of the notification.
 */
export function makeToastNotification(message) {
    if (!message || (typeof message === "string" && !message.trim())) {
        console.error("Toast notification requires a non-empty message")
        return
    }

    let flashes = document.getElementById("flashes")

    if (!flashes) {
        const newFlashes = document.createElement("div")
        newFlashes.setAttribute("id", "flashes")
        document.body.insertBefore(newFlashes, document.body.firstChild || null)
        flashes = newFlashes
    }

    const newToast = document.createElement("dialog")
    newToast.classList.add("message")
    newToast.textContent = message
    flashes.append(newToast)
    newToast.show()

    setTimeout(() => {
        newToast.classList.add("close")
        setTimeout(() => newToast.remove(), 500)
    }, 5000)
}

/**
 *
 * @param {String} data - The data from the sequelize object the needed to be shown
 * @param {String} placeholder - A placeholder that replaces the data if the data is null or undefined. Default: ""
 * @returns string
 */
export const showData = (data, placeholder = "") => (data ?? false ? data : placeholder)

/**
 *
 * @param {Date} date - date object to be formatted
 * @returns the formatted date in format "MMM DD, YYYY"
 */
export function formatDate(date) {
    return date ?? false
        ? new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
          })
        : ""
}

/**
 * Wraps a callback function in a try-catch block for error handling.
 * @function
 * @param {Function} callback - The callback function to wrap.
 */
export async function TRY_CATCH_WRAPPER(callback) {
    try {
        return await callback()
    } catch (error) {
        console.log(error)
        console.log(`\n${error.name}\n`)
        console.log(`${error.message}`)
    }
}

/**
 * Retrieves an HTML element by its ID.
 *
 * @param {string} id - The ID of the HTML element to retrieve.
 * @returns {HTMLElement|null} - The HTML element with the specified ID, or null if not found.
 */
export function getById(id) {
    return document.getElementById(id)
}

/**
 * Retrieves the first HTML element that matches a CSS selector.
 *
 * @param {string} tag - The selector to query for.
 * @returns {HTMLElement|null} - The first HTML element that matches the selector, or null if not found.
 */
export function queryElement(tag) {
    return document.querySelector(tag)
}

/**
 * Retrieves a list of HTML elements that match a CSS selector.
 *
 * @param {string} tag - The selector to query for.
 * @returns {NodeList} - A list of HTML elements that match the selector.
 */
export function queryElements(tag) {
    return document.querySelectorAll(tag)
}

/**
 *
 * @param {String} template - The template literal to be converted to HTML
 * @returns {HTMLElement} - The HTML element generated from the template.
 */
export const generateHTML = template => {
    const bufferElement = document.createElement("div")
    bufferElement.innerHTML = template
    template = bufferElement.firstElementChild
    bufferElement.remove()

    return template
}

/**
 * Checks if a string is in camelCase notation and converts it to dashed notation if so.
 *
 * @param {string} inputString - The input string to check and convert.
 * @returns {string} The input string in dashed notation if it was in camelCase, otherwise, the input string as is.
 * @example
 * const inputString = "userName"
 * const dashedString = camelToDashed(inputString)
 * console.log(dashedString) // Output: "user-name"
 */
export const camelToDashed = inputString => {
    if (/^[a-z][a-zA-Z0-9]*$/.test(inputString)) {
        return inputString.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
    } else {
        return inputString
    }
}

/**
 * Get form data by manually iterating through form fields.
 *
 * @param {HTMLFormElement} formElement - The HTML form element to extract data from.
 * @returns {formFieldData} - A FormData like object containing the form field values.
 */
export function getFormData(formElement) {
    const formFieldData = {}

    const formFields = formElement.querySelectorAll(".form-field__input")

    for (let index = 0; index < formFields.length; index++) {
        const field = formFields[index]
        if (field.name) {
            formFieldData[field.name] = field.value
        } else {
            console.error(`input with id ${field.id} doesnt have a name attribute`)
        }
    }

    return formFieldData
}

/**
 * Fixed strings to follow basic sentence casing.
 *
 * @param {String} sentence - Sentence to be transformed to sentence case.
 * @returns {String} new sentence
 */
export const toSentenceCase = sentence => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()
}

const dialog = queryElement("dialog")
const background = getById("dialog-backdrop")

/**
 * FIlls dialog innerHTML
 */
export const fillAndShowDialog = template => {
    dialog.innerHTML = template
    background.style.display = "block"
    background.classList.add("open")
    dialog.show()
}

/**
 * Clears the dialog then closes it
 */
export const clearAndHideDialog = () => {
    dialog.classList.add("closing")
    background.classList.add("closing")
    background.classList.remove("open")
    setTimeout(() => {
        dialog.close()
        dialog.innerHTML = ""
        dialog.classList.remove("closing")
        background.classList.remove("closing")
        background.style.display = "none"
    }, 520)
}

/**
 * Generates a unique input element id attribute value
 *
 * @returns the new input element id
 */
export const generateUniqueId = name => {
    const randomNumber = Math.floor(Math.random() * 100) + 1
    const id = [randomNumber, name].join("-")

    return document.body.contains(getById(id)) ? generateUniqueId() : id
}
