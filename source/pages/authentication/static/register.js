import "../../../utilities/validations.js"
import "../../../utilities/constants.js"
import loadLogin from "./login.js"

import { 
    makeToastNotification, 
    transition,
    getById,
    getFormData,
    queryElements,
    camelToDashed
} from "../../../assets/scripts/helper.js"

import { Select } from "../../../assets/scripts/classes/Select.js"
import { Input } from "../../../assets/scripts/classes/Input.js"

const { 
    isBirthDate, 
    isEmail, 
    isEmpty, 
    isValidPhoneNumber, 
    notIn,
    userRelationshipTypes
} = window

/**
 * Handles user registration
 */
export default function loadRegister() {

    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length

    const template = `
    
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

                <div class="authentication-form__inputs-child">

                    ${
                        [
                            
                            new Input(false, [isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "firstName",
                                    value: "James",
                                    title: "First Name",
                                    placeholder: "First Name",
                                    maxlength: "255"
                                }
                            }),

                            new Input(false, [isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "middleName",
                                    title: "Middle Name",
                                    placeholder: "Middle Name",
                                    value: "Panganoron",
                                    maxlength: "255",    
                                }
                            }),

                            new Input(false, [isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "lastName",
                                    title: "Last Name",
                                    placeholder: "Last Name",
                                    value: "Sabalo",
                                    maxlength: "255",    
                                }
                            }),

                            new Input(false, [isEmpty, isBirthDate], {
                                flags: ["required"],
                                attributes: {
                                    name: "birthDate",
                                    type: "date",
                                    title: "BirthDate",
                                    placeholder: "BirthDate",
                                    value: "2001-08-20"
                                }
                            }),

                            new Input(false, [isEmpty, [isOverThan, 15, 70]], {
                                flags: ["required"],
                                attributes: {
                                    name: "age",
                                    type: "number",
                                    title: "Age",
                                    placeholder: "Age",
                                    value: "18"
                                }
                            })

                        ].join("\n")
                    }

                </div>

                <div class="authentication-form__inputs-child">
                    
                    ${

                        [

                            new Select(false, [
                                isEmpty,
                                [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                                [notIn, [...Object.keys(window.userRelationshipTypes)]]
                            ], {
                                options: window.userRelationshipTypes,
                                attributes: {
                                    name: "relationshipStatus",
                                    selected: "Single",
                                    title: "Relationship Status"
                                },
                                flags: ["required"]
                            }),

                            new Input(false, [], {
                                flags: ["required"],
                                classes: ["number-input"],
                                attributes: {
                                    name: "phoneNumber",
                                    type: "number",
                                    title: "Phone Number",
                                    placeholder: "Phone Number",
                                    value: "",
                                    maxlength: "10"
                                }
                            }),

                            new Input(false, [isEmpty, isEmail, [isOverThan, 10, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "email",
                                    type: "email",
                                    title: "Email",
                                    placeholder: "Email",
                                    value: "sabalo99@gmail.com"
                                }
                            }),

                            new Input(false, [isEmpty, [isOverThan, 10, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "password",
                                    type: "password",
                                    title: "Password",
                                    placeholder: "Password",
                                    value: "AceBurgundy"
                                }
                            }),

                        ].join("\n")

                    }

                </div>
            </div>
                
            <div id="register-form-bottom" class="authentication-form__bottom">
                <p class="authentication-form__bottom__tag">Register</p>
                <button id="register-button" class="authentication-form__submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="20" id="arrow"><path fill-rule="evenodd" d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413"></path></svg>
                </button>    
            </div>

        </form>

        <p id="to-login-prompt" class="bottom-prompt">
            Already Have an Account? Login instead
        </p>
    `

    getById("container").innerHTML += template

    setTimeout(() => {
        getById("register").classList.add("active")
    }, 500)

    window.onclick = async (event) => {

        const elementId = event.target.getAttribute("id")

        if (elementId === "to-login-prompt") {
            transition(loadLogin)
        }

        if (elementId === "register-button") {

            event.preventDefault()

            const form = getById("register-form")
            const formData = getFormData(form)

            const invalidElements = queryElements("invalid")

            if (invalidElements > 0)
                return makeToastNotification("Fix errors first")

            const response = await window.ipcRenderer.invoke("register", formData);

            if (response.status === "success") {
            
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