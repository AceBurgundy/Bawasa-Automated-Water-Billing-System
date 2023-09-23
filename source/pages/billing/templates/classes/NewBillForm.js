import { clearAndHideDialog, fillAndShowDialog, generateHTML, generateUniqueId, getById, makeToastNotification, showData, showDialog } from "../../../../assets/scripts/helper.js";
import BillingRow from "./BillingRow.js";

/**
 * Generates a new bill entry form template for a client's billing record.
 *
 * @param {Object} formData - The form data containing client details and bills.
 * @param {boolean} forNewBill - Indicates whether the form is for a new bill entry.
 * @returns {string} - The HTML template for the new bill entry form.
 */
export default class NewBillForm {

    constructor(rowId, formData, forNewBill) {
        
        this.formData = formData
        this.forNewBill = forNewBill
        this.rowId = rowId
        this.clientId = formData.id ?? ''

        const latestBill = this.formData.Bills[0];
        this.billId = latestBill?.id

        const readingWarning = (latestBill === undefined || this.forNewBill) ?
            "This will be the client's new billing record" :
            `Mr/Mrs ${formData?.lastName}'s previous reading is ${latestBill.firstReading}`;
    
        this.closeButtonId = generateUniqueId("new-bill-form-close")
        this.submitButtonId = generateUniqueId("new-bill-form-submit")
        this.dialogId = generateUniqueId("new-bill-box")
        this.dialogErrorId = generateUniqueId("new-bill-form-input-box-header-error")
        this.dialogInputId = generateUniqueId("new-bill-form-input-box-input")

        this.template = `
                <form id="new-bill-form">
                    <p id="new-bill-form-title">New Reading for Mr/Mrs ${showData(formData.fullName)}</p>
                    <div id="new-bill-form__input-box">
                        <p id="new-bill-form__input-box__warning">${readingWarning}</p>
                            <div id="new-bill-form-input-box-header">
                            <label>Reading</label>
                        <p id="${this.dialogErrorId}"></p>
                        </div>
                        <input 
                            id="${this.dialogInputId}" 
                            type="number"
                            name="reading"
                            value="12"
                            required>
                    </div>
                    <div id="new-bill-form-buttons">
                        <button class="button-primary" id="${this.closeButtonId}">Cancel</button>
                        <button class="button-primary" id="${this.submitButtonId}">Add</button>
                    </div>
                </form>
        `;
    
        this.loadScripts()
        this.toString()
    }

    toString() {
        fillAndShowDialog(this.template)
    }

    async processForm() {
        
        const paymentAmountInput = getById(this.dialogInputId)
        const errorElement = getById(this.dialogErrorId)

        const paymentAmount = paymentAmountInput.value

        if (isNaN(paymentAmount)) {
            errorElement.textContent = "Must be a number"
            return
        }

        if (!paymentAmount) {
            errorElement.textContent = "Payment amount cannot be empty"
            return
        }

        if (this.clientId, paymentAmount) {
            
            const data = {
                    clientId: this.clientId,
                    monthlyReading: paymentAmount,
                    billId: this.billId ?? '',
                }

            const response = await window.ipcRenderer.invoke(`new-bill`, data)
            console.log(response, response.billId);
            if (response.status === "success") {
                makeToastNotification(response.toast[0])
                clearAndHideDialog()

                const getResponse = await window.ipcRenderer.invoke("get-bill", { billId: response.billId ?? this.billId, clientId: this.clientId })
                console.log(getResponse);

                if (getResponse.status === "failed") {
                    getResponse.toast[0] && makeToastNotification(getResponse.toast[0])
                    return
                }

                const updatedBill = JSON.parse(getResponse.data)

                console.log(updatedBill);

                const originalRow = getById(this.rowId)

                console.log(new BillingRow(updatedBill));
                originalRow.replaceWith(generateHTML(new BillingRow(updatedBill)))
                              

            } else {
                makeToastNotification(response.toast[0])
            }
        }

        return
    }

    loadScripts() {

        setTimeout(() => {
            
            const closeButton = getById(this.closeButtonId)
            const submitButton = getById(this.submitButtonId)

            const exists = element => document.body.contains(element)

            if (exists(closeButton)) {
                closeButton.onclick = () => {
                    this.dialogElement.close()
                    this.dialogElement.innerHTML = ''
                }
            }

            if (exists(submitButton)) {
                submitButton.onclick = async event => {
                    event.preventDefault()
                    await this.processForm()
                }
            }

        }, 0);
    }
}
