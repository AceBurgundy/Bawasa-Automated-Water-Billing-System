import { makeToastNotification, transition } from "../../../helper.js";
import "../../../../model_helpers.js";
import loadLogin from "./login.js";

export function loadRegister() {

    const template = `
    
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

                <div class="authentication-form__inputs-child">

                    <input 
                        type="text"
                        name="firstname"
                        id="register-form-first-name" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="First name"
                        value="Sam"
                        maxlength="255">

                    <input 
                        type="text"
                        name="lastname"
                        id="register-form-last-name" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Last name"
                        value="Sabalo"
                        maxlength="255">

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
                        
                </div>

                <div class="authentication-form__inputs-child">

                    <select 
                        name="relationshipStatus" 
                        id="register-form-relationship-status"
                        class="authentication-form__input-box__input"
                        required>
                        <option disabled selected>Relationship Status</option>
                        ${window.userRelationshipTypes.map((value) => {
                            return `<option value="${value}">${value}</option>`;
                        })}
                    </select>
                    
                    <input 
                        type="date"
                        name="birthdate"
                        id="register-form-birthdate" 
                        class="authentication-form__input-box__input"
                        required
                        placeholder="Birthdate"
                    >

                    <input 
                        type="number"
                        name="age"
                        id="register-form-age" 
                        class="authentication-form__input-box__input"
                        required
                        value="18"
                        placeholder="Age">

                    <select 
                        name="userType" 
                        id="register-form-user-type"
                        class="authentication-form__input-box__input"
                        required>
                        <option disabled selected>User Type</option>
                        ${window.userTypes.map((value) => {
                            return `<option value="${value}">${value}</option>`;
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
    `;

    document.getElementById("container").innerHTML += template;

    window.onclick = async (event) => {
        const elementId = event.target.getAttribute("id");

        if (elementId === "to-login-prompt") {
            transition(loadLogin);
        }

        if (elementId === "register-button") {
            event.preventDefault();

            const formData = new FormData(
                document.getElementById("register-form")
            );

            let errors = 0;

            formData.forEach((dirtyValue, key) => {
                const value = dirtyValue.trim();

                if (key === "firstname") {
                    if (value === "") {
                        makeToastNotification("First name cannot be empty");
                        errors++;
                    }
                    if (value.length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "lastname") {
                    if (value === "") {
                        makeToastNotification("Last name cannot be empty");
                        errors++;
                    }
                    if (value.length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "email") {
                    if (value === "") {
                        makeToastNotification("Email cannot be empty");
                        errors++;
                    }
                    if (!value.includes("@")) {
                        makeToastNotification("Missing '@'");
                        errors++;
                    }
                    if (value.length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "password") {
                    if (value === "") {
                        makeToastNotification("Password cannot be empty");
                        errors++;
                    }
                    if (value.length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "relationshipStatus") {
                    if (value === "") {
                        makeToastNotification(
                            "Relationship status cannot be empty"
                        );
                        errors++;
                    }
                    if (!window.userRelationshipTypes.includes(value)) {
                        makeToastNotification(
                            "Relationship status not among the choices"
                        );
                        errors++;
                    }
                }

                if (key === "birthdate") {

                    if (value === "") {
                        makeToastNotification("Birthdate cannot be empty");
                    }

                    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2]\d|3[0-1])\/\d{4}$/;
                    if (!value.match(dateRegex)) {
                        makeToastNotification("Invalid date format. Please use mm/dd/yyyy");
                        errors++;
                    }

                    const enteredDate = new Date(value);
                    if (isNaN(enteredDate.getTime())) {
                        makeToastNotification("Please enter a valid date");
                        errors++;
                    }

                }

                if (key === "age") {
                    if (value === "") {
                        makeToastNotification("Age cannot be empty");
                        errors++;
                    }
                    if (value < 15 && value > 70) {
                        makeToastNotification("Age limit is 70");
                        errors++;
                    }
                }

                if (key === "userType") {
                    if (value === "") {
                        makeToastNotification("User type cannot be empty");
                        errors++;
                    }
                    if (!window.userTypes.includes(value)) {
                        makeToastNotification(
                            "User type not among the choices"
                        );
                        errors++;
                    }
                }
            });

            if (errors === 0) {
                const response = await window.ipcRenderer.invoke(
                    "register",
                    Object.fromEntries(formData.entries())
                );

                if (response.status === "success") {
                    transition(loadLogin);
                } else {
                    response.message.forEach((message) => {
                        makeToastNotification(message);
                    });
                }
            }
        }
    };
}
