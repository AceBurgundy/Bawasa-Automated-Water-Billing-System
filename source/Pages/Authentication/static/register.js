import { transition } from "../../../helper.js"

export default function loadRegister() {
    const template = `
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

                <input 
                    type="text"
                    name="first-name"
                    id="register-form-first-name" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="First name"
                    maxlength="255">

                <input 
                    type="text"
                    name="last-name"
                    id="register-form-last-name" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="Last name"
                    maxlength="255">

                <input 
                    type="email"
                    name="email"
                    id="register-form-email" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="Email"
                    maxlength="255">

                <input 
                    type="password" 
                    name="password"
                    id="register-form-password" 
                    class="authentication-form__input-box__input"
                    required
                    placeholder="Password"
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
    `

    document.getElementById("container").innerHTML = template

}