import RecoveryCodesDialog from "../templates/classes/RecoveryCodesDialog.js"
import loadLogin from "./login.js"

import { 
    makeToastNotification, 
    transition,
    getById,
    getFormData,
    queryElements,
    camelToDashed
} from "../../../assets/scripts/helper.js"
import { registerTemplate } from "../templates/register.js"


/**
 * Handles user registration
 */
export default function loadRegister() {

    const template = registerTemplate()

    getById("container").innerHTML += template

    setTimeout(() => getById("register").classList.add("active"), 500)

    window.onclick = async (event) => {

        const elementId = event.target.getAttribute("id")

        if (elementId === "to-login-prompt") {
            transition(loadLogin)
        }

        if (elementId === "register-button") {

            event.preventDefault()

            const form = getById("register-form")
            const formData = getFormData(form)

            const invalidElements = queryElements(".invalid")

            if (invalidElements.length > 0)
                return makeToastNotification("Fix errors first")

            const response = await window.ipcRenderer.invoke("register", formData);
                
            if (response.status === "success") {
                new RecoveryCodesDialog(response.recoveryCodes)                
                makeToastNotification(response.toast[0])
                transition(loadLogin);
            
            } else {
            
                response.toast.forEach(error => {
                    makeToastNotification(error)
                })
            
                if (response.hasOwnProperty("fieldErrors")) {

                    const { fieldErrors } = response
                    const fieldNames = Object.keys(fieldErrors)

                    fieldNames.forEach(name => {
                        getById(`${camelToDashed(name)}-field__info__error`).textContent = fieldErrors[name]
                    })

                }
            }
        }
    }
}