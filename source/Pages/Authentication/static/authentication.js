import loadLogin from "./login.js"
import loadRegister from "./register.js"
import { transition } from "../../../helper.js"

document.addEventListener("DOMContentLoaded", loadLogin())

window.onclick = event => {

    if (event.target.id === "to-login-prompt") {
        transition(loadLogin)
    }

    if (event.target.id === "to-register-prompt") {
        transition(loadRegister)
    }
}
