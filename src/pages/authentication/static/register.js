import { makeToastNotification, transition } from "../../../helper.js";
import loadLogin from "./login.js";

export function loadRegister() {

    const template = `
    
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

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

            formData.forEach((value, key) => {

                if (key === "first-name") {

                    if (value.trim() === "") {
                        makeToastNotification("First name cannot be empty");
                        errors++;
                    }
                    if (value.trim().length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "last-name") {

                    if (value.trim() === "") {
                        makeToastNotification("Last name cannot be empty");
                        errors++;
                    }
                    if (value.trim().length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "email") {

                    if (value.trim() === "") {
                        makeToastNotification("Email cannot be empty");
                        errors++;
                    }
                    if (!value.trim().includes("@")) {
                        makeToastNotification("Missing '@'");
                        errors++;
                    }
                    if (value.trim().length > 255) {
                        makeToastNotification("Cannot be greater than 255");
                        errors++;
                    }
                }

                if (key === "password") {

                    if (value.trim() === "") {
                        makeToastNotification("Password cannot be empty");
                        errors++;
                    }
                    if (value.trim().length > 255) {
                        makeToastNotification("Cannot be greater than 255");
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
                    response.message.forEach(message => {
                        makeToastNotification(message)
                    })
                }
            }
        }
    };
}
