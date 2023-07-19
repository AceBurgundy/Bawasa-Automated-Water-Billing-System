import { makeToastNotification, transition } from "../../../helper.js";
import { renderClientSection } from "../../Clients/static/clients.js";
import { loadRegister } from "./register.js"

export default function loadLogin() {
    const template = `
    <div id="login" class="page">
    
        <form data-action="" id="login-form" class="authentication-form">
        
            <p id="login-form-title" class="authentication-form__title">Welcome</p>
        
            <div class="authentication-form__inputs">
                <input 
                    type="email"
                    name="email"
                    id="login-form-email" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="Email"
                    value="Samadriansabalo99@gmail.com"
                    maxlength="255">

                <input 
                    type="password" 
                    name="password"
                    id="login-form-password" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="Password"
                    value="Adrian2001."
                    maxlength="255">
            </div>
        
            <!-- <div class="authentication-form__input-box"></div> -->
        
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
    `;

    document.getElementById("container").innerHTML += template;

    setTimeout(() => {
        document.getElementById("login").classList.add("active");
    }, 500);

    window.onclick = async (event) => {

        const elementId = event.target.getAttribute("id");

        if (elementId === "to-register-prompt") {
            transition(loadRegister);
        }

        if (elementId === "login-button") {

            event.preventDefault();

            const formData = new FormData(
                document.getElementById("login-form")
            );

            let errors = 0;

            // loops through each form and increments errors for each error
            formData.forEach((value, key) => {
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
                    "login",
                    Object.fromEntries(formData.entries())
                );

                if (response.status === "success") {
                    transition(renderClientSection);
                } else {
                    response.message.forEach(message => {
                        makeToastNotification(message)
                    })
                }
            }
        }
    };
}
