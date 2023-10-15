import Input from "../../../../components/Input.js"

import {
    clearAndHideDialog,
    fillAndShowDialog,
    generateHTML,
    generateUniqueId,
    getById,
    getFormData,
    makeToastNotification
} from "../../../../assets/scripts/helper.js"

/**
 * Shows the forget password dialog to the user
 */
export default class ForgetPasswordDialog {
    constructor() {

        const { isEmail, isEmpty, isOverThan, hasNoSymbols } = window

        this.states = {
            VERIFY: "verify",
            RECOVER: "recover"
        }

        this.currentState = this.states.VERIFY

        this.dialogRecoveryCodeInputId = generateUniqueId(`forget-password-form-input-box-recovery-code-input`)
        this.dialogPasswordInputId = generateUniqueId(`forget-password-form-input-box-password-input`)
        this.dialogEmailInputId = generateUniqueId(`forget-password-form-input-box-email-input`)
        this.dialogErrorId = generateUniqueId(`forget-password-form-input-box-header-error`)
        this.submitButtonId = generateUniqueId(`forget-password-form-submit`)
        this.closeButtonId = generateUniqueId(`forget-password-form-close`)
        this.dialogId = generateUniqueId(`forget-password-box`)
        this.formId = generateUniqueId(`forget-password-form`)

        this.dialogPasswordInput = new Input([isEmpty], {
            flags: ["required"],
            attributes: {
                id: this.dialogPasswordInputId,
                value: "Adrian2001.",
                label: "Password",
                name: "password",
                type: "password",
                maxlength: "255"
            }
        })

        this.template = `
            <form id="${this.formId}">
                <p id="forget-password-form-title">Account Recovery</p>
                <div id="forget-password-form__input-box">
                    <p id="forget-password-form__input-box__warning">A recovery code is required to proceed</p>
                    ${[
                        new Input([isEmpty, isEmail, [isOverThan, 0, 255]], {
                            flags: ["required"],
                            attributes: {
                                value: "samadriansabalo99@gmail.com",
                                id: this.dialogEmailInputId,
                                maxlength: "255",
                                label: "Email",
                                name: "email"
                            }
                        }),
                        new Input([isEmpty, hasNoSymbols, [isOverThan, 0, 8]], {
                            flags: ["required"],
                            attributes: {
                                id: this.dialogRecoveryCodeInputId,
                                label: "Recovery Code",
                                name: "recoveryCode",
                                value: "AvkPIVI1",
                                maxlength: "8"
                            }
                        })
                    ]}
                </div>
                <div id="forget-password-form-buttons">
                    <button class="button-primary" id="${this.closeButtonId}">Cancel</button>
                    <button class="button-primary" id="${this.submitButtonId}">Verify Code</button>
                </div>
            </form>
        `

        this.loadScripts()
        this.toString()
    }

    toString() {
        fillAndShowDialog(this.template)
    }

    async verifyRecoveryCode() {
        const form = getById(this.formId)
        const formData = getFormData(form)

        const response = await window.ipcRenderer.invoke("reset-password", {
            email: formData.email,
            userRecoveryCode: formData.recoveryCode
        })

        if (response.toast) makeToastNotification(response.toast[0])

        if (response.status === "success") {
            getById("recovery-code-field").replaceWith(generateHTML(this.dialogPasswordInput))
            this.currentState = this.states.RECOVER
            getById(this.submitButtonId).textContent = "Change Password"
        }
    }

    async changePassword() {
        const form = getById(this.formId)
        const formData = getFormData(form)

        const response = await window.ipcRenderer.invoke("change-password", {
            email: formData.email,
            password: formData.password
        })

        console.log(response);
        
        if (response.toast) makeToastNotification(response.toast[0])

        if (response.status === "success") {
            clearAndHideDialog()
        }
    }

    loadScripts() {
        setTimeout(() => {
            const closeButton = getById(this.closeButtonId)
            const submitButton = getById(this.submitButtonId)

            if (closeButton) {
                closeButton.onclick = () => clearAndHideDialog()
            }

            if (submitButton) {
                submitButton.onclick = async event => {
                    event.preventDefault()
                
                    switch (this.currentState) {
                        case this.states.VERIFY:
                                await this.verifyRecoveryCode()
                            break;
                    
                        case this.states.RECOVER:
                                await this.changePassword()
                            break;
                        default:
                            break;
                    }
                }
            }
        }, 0)
    }
}
