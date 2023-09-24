import renderBillingSection from "../../billing/static/billing.js"
import { renderProfile } from "../../profile/static/profile.js"
import Input from "../../../assets/scripts/classes/Input.js"
import "../../../utilities/validations.js"
import loadRegister from "./register.js"

import {
    makeToastNotification,
    transition,
    getById,
    queryElements,
    getFormData,
} from "../../../assets/scripts/helper.js"

import { renderClientBuilder } from "../../clientBuilder/static/clientBuilder.js"

const { isEmpty, isEmail, isOverThan } = window

/**
 * Handles user login
 */
export default async function loadLogin() {
    const template = `

    <div id="login" class="page">
    
        <form data-action="" id="login-form" class="authentication-form">
        
            <p id="login-form-title" class="authentication-form__title">Welcome</p>
        
            <div class="authentication-form__inputs">

                ${
                    [
                        new Input([ isEmail, [isOverThan, 0, 255]], {
                            flags: ["required"],
                            attributes: {
                                name: "email",
                                label: "Email",
                                value: "samadriansabalo99@gmail.com",
                                maxlength: "255",
                            }
                        }),

                        new Input([isEmpty], {
                            flags: ["required"],
                            attributes: {
                                name: "password",
                                label: "Password",
                                type: "password",
                                value: "Adrian2001.",
                                maxlength: "255",    
                            }
                        }),
                    
                    ].join("\n")
            
                }  

            </div>
                
            <div id="login-form-bottom" class="authentication-form__bottom">
                <p class="authentication-form__bottom__tag">Login</p>
                <button id="login-button" class="authentication-form__submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="20" id="arrow"><path fill-rule="evenodd" d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413"></path></svg>
                </button>    
            </div>

            <p id="forgot-password">Forgot Password?</p>

        </form>

        <p id="to-register-prompt" class="bottom-prompt">
            Don't have an account yet? Register and get verified
        </p>
    `

    getById("container").innerHTML += template

    setTimeout(() => {
        getById("login").classList.add("active")
    }, 500)

    window.onclick = async (event) => {
        const elementId = event.target.getAttribute("id")

        if (elementId === "to-register-prompt") {
            transition(loadRegister)
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
