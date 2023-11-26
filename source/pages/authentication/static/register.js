import RecoveryCodesDialog from "../templates/classes/RecoveryCodesDialog.js"
import loadLogin from "./login.js"

import { registerTemplate } from "../templates/register.js"

import { 
    makeToastNotification, 
    transition,
    getById,
    getFormData,
    queryElements,
    camelToDashed
} from "../../../assets/scripts/helper.js"

/**
 * Loads register template and events
 */
export default function loadRegister() {

    const template = registerTemplate()

    getById("container").innerHTML += template

    const registerElement = getById("register")

    setTimeout(() => {
        registerElement.classList.add("active")
    }, 500)

    window.onclick = async (event) => {

        switch (event.target.id) {

            case "to-login-prompt":
                transition(loadLogin)
            break;

            case "register-button":
                event.preventDefault()
                await registerUser()
            break;

            default:
                break;
        }

    }
}

async function registerUser() {

    const form = getById("register-form")
    const formData = getFormData(form)

    const invalidElements = queryElements(".invalid")

    if (invalidElements.length > 0) {
        makeToastNotification("Fix errors first")
        return 
    }

    const response = await window.ipcRenderer.invoke("register", formData);
        
    if (response.status === "success") {
        new RecoveryCodesDialog(response.recoveryCodes)
        makeToastNotification(response.toast)
        transition(loadLogin);
        return
    }
    
    makeToastNotification(response.toast)
    
    const responseHasFieldErrors = response.hasOwnProperty("fieldErrors")

    if (responseHasFieldErrors) {

        const { fieldErrors } = response
        const fieldNames = Object.keys(fieldErrors)

        fieldNames.forEach(fieldName => {
            const fieldElementId = `${camelToDashed(fieldName)}-field__info__error`
            getById(fieldElementId).textContent = fieldErrors[fieldName]
        })

    }

}