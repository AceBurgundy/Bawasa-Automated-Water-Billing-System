import { makeToastNotification, transition } from "../../../helper.js"
import "../../../../model_helpers.js"
import "../../input_validations.js"
import loadLogin from "./login.js"

export function loadRegister() {

    const template = `
    
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

                <div class="authentication-form__inputs-child">

                    <input 
                        type="text"
                        name="firstName"
                        id="register-form-first-name" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="First name"
                        value="Sam"
                        maxlength="255">

                    <input 
                        type="text"
                        name="middleName"
                        id="register-form-middle-name" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Middle name"
                        value="Panganoron"
                        maxlength="255">

                    <input 
                        type="text"
                        name="lastName"
                        id="register-form-last-name" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Last name"
                        value="Sabalo"
                        maxlength="255">

                    <input 
                        type="date"
                        name="birthDate"
                        id="register-form-birthdate" 
                        class="authentication-form__input-box__input"
                        required
                        value="2001-08-20"
                        placeholder="Birthdate">

                    <input 
                        type="number"
                        name="age"
                        id="register-form-age" 
                        class="authentication-form__input-box__input"
                        required
                        value="18"
                        placeholder="Age">
                        
                </div>

                <div class="authentication-form__inputs-child">

                    <select 
                        name="relationshipStatus" 
                        id="register-form-relationship-status"
                        class="authentication-form__input-box__input"
                        required>
                        <option disabled selected>Relationship Status</option>
                        ${Object.values(window.userRelationshipTypes).map((value) => {
                            return (
                                value === "Single" ?
                                `<option value="${value}" selected>${value}</option>` :
                                `<option value="${value}">${value}</option>`
                            )
                        })}
                    </select>

                    <div class="authentication-form__input-box__input number">
                        <div id="country-code">
                            +63
                        </div>
                        <input 
                            type="number" 
                            name="phoneNumber"
                            id="register-form-phone-number"
                            required
                            placeholder="12-345-6789"
                            value="123456789"
                            maxlength="9">
                    </div>
                    
                    <input 
                        type="email"
                        name="email"
                        id="register-form-email" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Email"
                        value="samadriansabalo99@gmail.com"
                        maxlength="255">

                    <input 
                        type="password" 
                        name="password"
                        id="register-form-password" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Password"
                        value="Adrian2001."
                        maxlength="255">

                    <select 
                        name="userType" 
                        id="register-form-user-type"
                        class="authentication-form__input-box__input"
                        required>
                        <option disabled selected>User Type</option>
                        ${Object.values(window.userTypes).map((value) => {
                            return (
                                value === "Admin" ?
                                `<option value="${value}" selected>${value}</option>` :
                                `<option value="${value}">${value}</option>`
                            )
                        })}
                    </select>

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

    document.getElementById("container").innerHTML += template

    window.onclick = async (event) => {

        const elementId = event.target.getAttribute("id")
        console.log(elementId);

        if (elementId === "to-login-prompt") {
            transition(loadLogin)
        }

        if (elementId === "register-button") {

            event.preventDefault()

            const formData = new FormData(document.getElementById("register-form"))

            const longestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
            const shortestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length
            const longestUserOption = Object.values(window.userTypes).reduce((a, b) => b.length > a.length ? b : a).length
            const shortestUserOption = Object.values(window.userTypes).reduce((a, b) => b.length < a.length ? b : a).length

            let errors = 0

            const validationMethods = {
                
                firstName: [
                    [window.isEmpty, "First name"],
                    [window.isOverThan, 2, 255, "First name"]
                ],

                middleName: [
                    [window.isEmpty, "Middle name"],
                    [window.isOverThan, 2, 255, "Middle name"]
                ],

                lastName: [
                    [window.isEmpty, "Last name"],
                    [window.isOverThan, 2, 255, "Last name"]
                ],
                
                birthDate: [
                    [window.isEmpty, "Birthdate"],
                    [window.isBirthDate]
                ],

                age: [
                    [window.isEmpty, "Age"],
                    [window.isOverThan, 15, 70, "Age"]
                ],

                relationshipStatus: [
                    [window.isEmpty, "Relationship Status"],
                    [window.isOverThan, shortestRelationshipOption, longestRelationshipOption, "Relationship Status"],
                    [window.notIn, [...Object.values(window.userRelationshipTypes)], "Relationship Status"]
                ],

                phoneNumber: [
                    [window.isEmpty, "Phone Number"],
                    [window.isValidPhoneNumber, "Phone Number"]
                ],

                email: [
                    [window.isEmpty, "Email"],
                    [window.isEmail, "Email"],
                    [window.isOverThan, 10, 255, "Email"]
                ],

                password: [
                    [window.isEmpty, "Password"],
                    [window.isOverThan, 10, 255, "Password"]
                ],

                userType: [
                    [window.isEmpty, "User Type"],
                    [window.isOverThan, shortestUserOption, longestUserOption, "User Type"],
                    [window.notIn, [...Object.values(window.userTypes)], "User Type"]
                ]
            }

            formData.forEach((dirtyValue, key) => {

                const value = dirtyValue.trim()

                if (!validationMethods.hasOwnProperty(key)) {
                    console.error(`Validation methods for key '${key}' not found.`)
                    return
                }    
                
                validationMethods[key].forEach(([validationMethod, ...args]) => {
                    const [validationErrors, validationMessage] = validationMethod(value, ...args)
                    errors += validationErrors

                    validationMessage.length > 0 && validationMessage.forEach((message) => makeToastNotification(message))
                })
            })

            if (errors === 0) {
                const response = await window.ipcRenderer.invoke("register", Object.fromEntries(formData.entries()));

                if (response.status === "success") {
                    transition(loadLogin);
                } else {
                    response.message.forEach(message => { makeToastNotification(message) })
                }
            }
        }
    }
}