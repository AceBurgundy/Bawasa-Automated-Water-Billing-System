import ForgetPasswordDialog from "../templates/classes/ForgetPasswordDialog.js"
import renderBillingSection from "../../billing/static/billing.js"
import { loginTemplate } from "../templates/login.js"
import "../../../utilities/validations.js"
import loadRegister from "./register.js"

import {
    makeToastNotification,
    transition,
    getById,
    queryElements,
    getFormData,
} from "../../../assets/scripts/helper.js"

/**
 * Handles user login
 */
export default async function loadLogin() {

    const template = loginTemplate()

    getById("container").innerHTML += template

    setTimeout(() => getById("login").classList.add("active"), 500)

    window.onclick = async (event) => {

        const elementId = event.target.getAttribute("id")

        if (elementId === "to-register-prompt") {
            transition(loadRegister)
        }

        if (elementId === "forgot-password") {
            new ForgetPasswordDialog()
        }

        if (elementId === "login-button") {
            
            event.preventDefault()
        
            const form = getById("login-form")
            const formData = getFormData(form)
            const invalidElements = queryElements(".invalid")

            if (invalidElements.length > 0)
                return makeToastNotification("Fix errors first")
                
            const response = await window.ipcRenderer.invoke("login", formData)
 
            if (response.status === "success") {

                transition(renderBillingSection);

            } else {
            
                if ("fieldErrors" in response && Object.keys(response.fieldErrors).length > 0) {

                    const { fieldErrors } = response

                    const fieldNames = Object.keys(fieldErrors)

                    fieldNames.forEach(name => {
                        getById(`${name}-field__info__error`).textContent = fieldErrors[name]
                    })

                } else {
                    makeToastNotification(response.toast[0])
                }
            }
        }
    }
}
