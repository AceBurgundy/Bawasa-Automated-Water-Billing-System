export function transition(callback) {
    const box = getById("container")
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
 * @param {Any|Array} message - The message or list of messages which will be rendered.
 */
export function makeToastNotification(message) {

    if (Array.isArray(message)) {
        message.forEach(messageItem => makeToastNotification(messageItem))
        return
    }

    if (message === null || message === undefined || message.toString().trim().length <= 0) {
        console.error("Toast notification requires a non-empty message")
        return
    }

    let toastBox = getById("flashes")

    if (!toastBox) {
        const newBox = document.createElement("div")
        newBox.id = "flashes"
        document.body.insertBefore(newBox, document.body.firstChild || null)
        toastBox = newBox
    }

    const toast = document.createElement("dialog")
    toast.classList.add("message")
    toast.textContent = message

    toastBox.append(toast)
    toast.show()

    setTimeout(() => {
        toast.classList.add("close")
        setTimeout(() => toast.remove(), 500)
    }, 5000)
}

/**
 *
 * @param {string} data - The data from the sequelize object the needed to be shown
 * @param {string} placeholder - A placeholder that replaces the data if the data is null or undefined. Default: ""
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
 * @param {string} template - The template literal to be converted to HTML
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

    if (typeof inputString !== "string") {
        console.error("camelToDashed only accepts strings as arguments")
        return
    }

    const inCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(inputString)
    if (!inCamelCase) return inputString
    
    const andSeparateBigAndLowerCaseWithDash = [/([a-z])([A-Z])/g, "$1-$2"]
    return inputString.replace([...andSeparateBigAndLowerCaseWithDash]).toLowerCase()
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
 * @param {string} sentence - Sentence to be transformed to sentence case.
 * @returns {string} new sentence
 */
export const toSentenceCase = sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()

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
 * @param {string} name - The string that will be joined to a random number
 * @returns the new input element id
 */
export const generateUniqueId = name => {

    if (name === null || name === undefined || typeof name !== "string") {
        console.error("generateUniqueId only accepts strings as arguments")
        return
    }

    const randomNumber = Math.floor(Math.random() * 100) + 1
    const id = [name, randomNumber].join("-")

    return getById(id) ? generateUniqueId() : id
}
