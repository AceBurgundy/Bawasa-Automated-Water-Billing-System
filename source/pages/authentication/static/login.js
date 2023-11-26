import ForgetPasswordDialog from "../templates/classes/ForgetPasswordDialog.js"
import renderBillingSection from "../../billing/static/billing.js"
import { loginTemplate } from "../templates/login.js"

import "../../../utilities/validations.js"
import loadRegister from "./register.js"

import {
    makeToastNotification,
    queryElements,
    getFormData,
    transition,
    getById,
} from "../../../assets/scripts/helper.js"

/**
 * Loads login template and events
 */
export default async function loadLogin() {

    const template = loginTemplate()

    getById("container").innerHTML += template

    setTimeout(() => {
        getById("login").classList.add("active")
    }, 500)

    window.onclick = async event => {

        switch (event.target.id) {

            case "to-register-prompt":
                transition(loadRegister)
            break;
        
            case "forgot-password":
                new ForgetPasswordDialog()
            break
            case "login-button":
                event.preventDefault()
                await loginUser()
            break;
                
            default:
                break;
        }

    }
}

async function loginUser() {

    const form = getById("login-form")
    const formData = getFormData(form)
    const invalidElements = queryElements(".invalid")

    if (invalidElements.length > 0) {
        makeToastNotification("Fix errors first")
        return
    }
        
    const response = await window.ipcRenderer.invoke("login", formData)

    makeToastNotification(response.toast)

    if (response.status === "success") {
        transition(renderBillingSection);
        return
    }

    const responseHasFieldErrors = response.hasOwnProperty("fieldErrors")

    if (responseHasFieldErrors) {

        const { fieldErrors } = response
        const fieldNames = Object.keys(fieldErrors)

        fieldNames.forEach(name => {
            const fieldElementErrorId = `${name}-field__info__error`
            getById(fieldElementErrorId).textContent = fieldErrors[name]
        })

    }
}