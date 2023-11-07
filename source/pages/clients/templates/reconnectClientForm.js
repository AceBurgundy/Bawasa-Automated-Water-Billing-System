import { clearAndHideDialog, showData } from "../../../assets/scripts/helper.js"

/**
 * Generates a reconnection form template for a client.
 * 
 * @param {Object} client - The client data.
 * @returns {string} - The HTML template for the reconnection form.
 */
export class ReconnectClientForm {

    constructor(client) {
        const billAmount = showData(client.Bills[0].billAmount)

        this.closeButtonId = generateUniqueId(`reconnect-form-close`)
        this.submitButtonId = generateUniqueId(`reconnect-form-submit`)
        this.dialogId = generateUniqueId(`reconnect-box`)
        this.dialogErrorId = generateUniqueId(`reconnect-form-input-box-header-error`)
        this.dialogInputId = generateUniqueId(`reconnect-form-input-box-input`)

        this.template = `
            <form id="reconnect-form">
                <p id="reconnect-form-title">Reconnection for Mr/Mrs ${showData(client.fullName)}</p>
                <div id="reconnect-form__input-box">
                    <p id="${ this.dialogErrorId }"></p>
                    <p id="reconnect-form__input-box__warning">A total amount of ${billAmount} must be paid first to complete reconnection</p>
                    <input 
                        id="${ this.dialogInputId }" 
                        type="number"
                        name="reconnectAmount"
                        data-total="${ billAmount }"
                        value=""
                        required>
                </div>
                <div id="reconnect-form-buttons">
                    <button class="button-primary" id="${ this.closeButtonId }">Cancel</button>
                    <button class="button-primary" id="${ this.submitButtonId }">Reconnect</button>
                </div>
            </form>
        `    

        this.loadScripts()
        this.toString()
    }

    toString() {
        fillAndShowDialog(this.template)
    }

    async processReconnection() {

        const reconnectFormInput = getById(this.dialogInputId)
        const errorMessage = getById(this.dialogErrorId)

        const expectedPayment = reconnectFormInput.dataset.total
        const paidAmount = reconnectFormInput.value

        if (paidAmount !== expectedPayment) {
            errorMessage.textContent = "The full amount must be paid in order to continue"
            return
        }

        this.setRowReconnected()
        clearAndHideDialog()

        const response = await window.ipcRenderer.invoke("reconnect-client", {
            clientId: this.clientId,
            paidAmount: paidAmount
        })

        if (response.status === "failed") {
            makeToastNotification(response.toast[0])
            this.revertOriginalRow()
            return
        }

        makeToastNotification(response.toast[0])
    }

    setRowReconnected() {
        const rowElement = getById(`client-row-${this.clientId}`)
        rowElement.children[6].firstElementChild.textContent = window.connectionStatusTypes.Connected
        rowElement.removeAttribute(`id`)
        rowElement.querySelector(".table-info__options-item.reconnect").style.display = "none"
    }

    revertOriginalRow() {
        const rowElement = getById(`client-row-${clientId}`)
        
        if (rowElement) {
            rowElement.children[6].firstElementChild.textContent = window.connectionStatusTypes.Disconnected
            rowElement.id = `client-row-${this.clientId}`
            rowElement.querySelector(".table-info__options-item.reconnect").style.display = "block"
        }
    }

    loadScripts() {

        setTimeout(() => {
            
            const closeButton = getById(this.closeButtonId)
            const submitButton = getById(this.submitButtonId)

            if (closeButton) {
                closeButton.onclick = event => {
                    event.preventDefault()
                    clearAndHideDialog()
                }
            }

            if (submitButton) {
                submitButton.onclick = async event => {
                    event.preventDefault()
                    await this.processReconnection()
                }
            }

        }, 0);
    }
}