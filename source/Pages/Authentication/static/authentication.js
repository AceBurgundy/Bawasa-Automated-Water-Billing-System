import loadLogin from "./login.js"
import loadRegister from "./register.js"
import { transition, appendToHead } from "../../../helper.js"

document.addEventListener("DOMContentLoaded", () => {
    const authenticationStyle = `<link rel="stylesheet" href="Pages/Authentication/static/authentication.css">`;
    appendToHead(authenticationStyle)
    loadLogin()
})

window.onclick = event => {

    if (event.target.id === "to-login-prompt") {
        transition(loadLogin)
    }

    if (event.target.id === "to-register-prompt") {
        transition(loadRegister)
    }
}
