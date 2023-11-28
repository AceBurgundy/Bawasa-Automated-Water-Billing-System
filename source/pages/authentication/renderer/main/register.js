// helpers
import { transition, getById, getFormData, queryElements, camelToDashed } from "../../../../assets/scripts/helper.js"
import makeToastNotification from "../../../../assets/scripts/toast.js"

// dialog
import RecoveryCodesDialog from "../components/RecoveryCodesDialog.js"

// template
import registerTemplate from "../templates/register.js"

// main
import login from "./login.js"

/**
 * @function register
 * @description Loads register template and events
 */
export default function () {

    const template = registerTemplate()
    
    getById("container").innerHTML += template
    setTimeout(() => getById("register").classList.add("active"), 500)

    window.onclick = async event => {

        switch (event.target.id) {

            case "to-login-prompt":
                transition(login)
                break;

            case "register-button":
                event.preventDefault()
                await registerUser()
                break;

            default:
                break;
        }

    }
}

/**
 * Registers a new user based on the provided form data.
 * 
 * @async
 * @returns {Promise<void>} Resolves after the user registration process is completed.
 */
async function registerUser() {
    const form = getById("register-form");
    const formData = getFormData(form);

    const invalidElements = queryElements(".invalid");

    if (invalidElements.length > 0) {
        makeToastNotification("Fix errors first");
        return;
    }

    const response = await window.ipcRenderer.invoke("register", formData);

    if (response.status === "success") {
        new RecoveryCodesDialog(response.recoveryCodes);
        makeToastNotification(response.toast);
        transition(login);
        return;
    }

    makeToastNotification(response.toast);

    const hasFieldErrors = response.hasOwnProperty("fieldErrors");

    if (hasFieldErrors) {
        const { fieldErrors } = response;
        const fieldNames = Object.keys(fieldErrors);

        fieldNames.forEach(fieldName => {
            const fieldElementErrorId = `${camelToDashed(fieldName)}-field__info__error`;
            getById(fieldElementErrorId).textContent = fieldErrors[fieldName];
        });
    }
}
