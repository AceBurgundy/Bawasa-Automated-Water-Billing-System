import { 
    clearAndHideDialog, 
    fillAndShowDialog,
    generateUniqueId, 
    getById, 
    makeToastNotification 
} from "../../../../assets/scripts/helper.js";

/**
 * Shows a list of recovery codes for the user
 */
export default class RecoveryCodesDialog {

    constructor(recoveryCodes) {
        
        this.recoveryCodes = recoveryCodes
        const recoveryCodeElements = recoveryCodes.map(recoveryCode => `<p>${recoveryCode}</p>`)
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
                            <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" id="clipboard"><path d="M24,30H8a3,3,0,0,1-3-3V7A3,3,0,0,1,8,4h2a1,1,0,0,1,0,2H8A1,1,0,0,0,7,7V27a1,1,0,0,0,1,1H24a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H22a1,1,0,0,1,0-2h2a3,3,0,0,1,3,3V27A3,3,0,0,1,24,30Z"></path><path d="M22,8H10A1,1,0,0,1,9,7V5a3,3,0,0,1,3-3h1.17a3,3,0,0,1,5.66,0H20a3,3,0,0,1,3,3V7A1,1,0,0,1,22,8ZM11,6H21V5a1,1,0,0,0-1-1H18a1,1,0,0,1-1-1,1,1,0,0,0-2,0,1,1,0,0,1-1,1H12a1,1,0,0,0-1,1Zm8-3h0Z"></path></svg>
                        </div>
                    </div>
                    <div class="recovery-codes-form__center__list">
                        <div class="recovery-codes-form__center__list__codes">
                            ${ recoveryCodeElements.join("") }
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

            const exists = element => document.body.contains(element)

            if (exists(closeButton)) {
                closeButton.onclick = event => {
                    event.preventDefault()
                    clearAndHideDialog()
                }
            }

            if (exists(clipBoardBox)) {
                clipBoardBox.onclick = async () => {
                    navigator.clipboard.writeText(this.recoveryCodes.join(", "))
                        .then(() => makeToastNotification('Codes copied to clipboard.'))
                        .catch(error => {
                            makeToastNotification('Failed to copy codes');
                            console.error(error)
                        })
                }
            }

        }, 0);
    }
}
