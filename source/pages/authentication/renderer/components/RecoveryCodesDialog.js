// helpers
import { clearAndHideDialog, fillAndShowDialog, generateUniqueId, getById } from "../../../../assets/scripts/helper.js";
import makeToastNotification from "../../../../assets/scripts/toast.js";

// icons
import { icons } from "../../../../assets/scripts/icons.js";

/**
 * 
 * @class RecoveryCodesDialog
 * @description shows a list of recovery codes for the user
 */
export default class {

    constructor(recoveryCodes) {
        
        this.recoveryCodes = recoveryCodes

        this.closeButtonId = generateUniqueId(`recovery-codes-form__buttons__close`)
        this.clipBoardBoxId = generateUniqueId(`clipboard-box`)
        this.dialogId = generateUniqueId(`recovery-codes-box`)
        
        this.template = `
            <form class="recovery-codes-form">
                <p class="recovery-codes-form__title">Recovery Codes</p>

                <div class="recovery-codes-form__center">
                    <div class="recovery-codes-form__center__list__header">
                        <p class="recovery-codes-form__center__warning">This will be the recovery codes for your account. Without a recovery code you will never be able to recover your account. Click the icon to copy it and save it somewhere safe.</p>
                        <div id="${ this.clipBoardBoxId }" class="recovery-codes-form__center__list__header__clipboard-box">
                            ${
                                icons.clipboardIcon("clipboard")
                            }
                        </div>
                    </div>
                    <div class="recovery-codes-form__center__list">
                        <div class="recovery-codes-form__center__list__codes">
                            ${ 
                                recoveryCodes.map(recoveryCode => {
                                    return `<p>${recoveryCode}</p>`
                                }).join("") 
                            }
                        </div>
                    </div>
                </div>

                <div class="recovery-codes-form__buttons">
                    <button class="button-primary" id="${ this.closeButtonId }">Close</button>
                </div>
            </form>
        `;
    
        this.loadScripts()
        this.toString()
    }

    toString() {
        console.log(this.template);
        fillAndShowDialog(this.template)
    }

    loadScripts() {

        setTimeout(() => {
            
            const closeButton = getById(this.closeButtonId)
            const clipBoardBox = getById(this.clipBoardBoxId)

            closeButton.onclick = event => {
                event.preventDefault()
                clearAndHideDialog()
            }

            clipBoardBox.onclick = async () => {
                navigator.clipboard.writeText(this.recoveryCodes.join(", "))
                    .then(() => makeToastNotification('Codes copied to clipboard.'))
                    .catch(error => {
                        makeToastNotification('Failed to copy codes');
                        console.error(error)
                    })
            }

        }, 0);
    }
}
