import { 
    clearAndHideDialog, 
    fillAndShowDialog, 
    generateHTML, 
    generateUniqueId, 
    getById, 
    makeToastNotification, 
    showData 
} from "../../../../assets/scripts/helper.js";

import BillingRow from "./BillingRow.js";

/**
 * Generates a ${this.billType} bill entry form template for a client's billing record.
 *
 * @param {Object} account - The form data containing client details and bills.
 * @param {boolean} forNewBill - Indicates whether the form is for a ${this.billType} bill entry.
 * @returns {string} - The HTML template for the ${this.billType} bill entry form.
 */
export default class BillForm {

    constructor(rowId, billType, account, forNewBill) {
        
        this.billType = billType
        this.account = account
        this.forNewBill = forNewBill
        this.rowId = rowId

        const latestBill = this.account.Bills[0];
        this.billId = latestBill?.id
        console.log(latestBill, this.billId);
        
        const { lastName, fullName, id } = account

        this.clientId = id ?? ''

        let readingWarning = null
        let title = null
        
        if (billType === "new") {

            title = `New Reading for Mr/Mrs ${showData(account.fullName)}`

            readingWarning = latestBill === undefined || this.forNewBill ?
                "This will be the client's new billing record" 
            :
                `Mr/Mrs ${showData(lastName)}'s previous reading is ${showData(latestBill.firstReading)}`;
        }
    
        if (billType === "pay") {

            title = `Bills payment for Mr/Mrs ${showData(account.fullName)}`
            
            readingWarning = latestBill.paymentStatus === "unpaid" ?
                `Mr/Mrs ${showData(fullName)} current bill is ${showData(latestBill.billAmount)}`
            
            : latestBill.paymentStatus === "underpaid" ?
                `Mr/Mrs ${showData(fullName)} remaining balance is ${showData(latestBill.remainingBalance)}`
            
            : ''
        }
    

        this.closeButtonId = generateUniqueId(`${billType}-bill-form-close`)
        this.submitButtonId = generateUniqueId(`${billType}-bill-form-submit`)
        this.dialogId = generateUniqueId(`${billType}-bill-box`)
        this.dialogErrorId = generateUniqueId(`${billType}-bill-form-input-box-header-error`)
        this.dialogInputId = generateUniqueId(`${billType}-bill-form-input-box-input`)

        this.template = `
                <form id="${billType}-bill-form">
                    <p id="${billType}-bill-form-title">${title}</p>
                    <div id="${billType}-bill-form__input-box">
                        <p id="${billType}-bill-form__input-box__warning">${readingWarning}</p>
                            <div id="${billType}-bill-form-input-box-header">
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
                    <div id="${billType}-bill-form-buttons">
                        <button class="button-primary" id="${this.closeButtonId}">Cancel</button>
                        <button class="button-primary" id="${this.submitButtonId}">${
                            billType === "new" ? "Add" : "Pay"
                        }</button>
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
            
            const newBillData = {
                clientId: this.clientId,
                monthlyReading: paymentAmount,
                billId: this.billId ?? '',
            }

            const payBillData = {
                amount: paymentAmount,
                billId: this.billId
            }

            if (type === "new") {
                this.oldMonthlyReading = this.account["monthlyReading"]
            } else {
                this.oldAmount = this.account["amount"]
            }

            this.updateRow()

            const response = await window.ipcRenderer.invoke(`${this.billType}-bill`, this.billType === "new" ? newBillData : payBillData)
            
            if (response.status === "failed") {
                makeToastNotification(response.toast[0])
                this.rollbackOriginalRow(type)
            }

        }

        return
    }

    updateRow() {
        const originalRow = getById(this.rowId)
        originalRow.replaceWith(generateHTML(new BillingRow(this.account)))
        clearAndHideDialog()
    }

    rollbackOriginalRow(type) {

        if (type === "new") {
            this.account["monthlyReading"] = this.oldMonthlyReading
        } else {
            this.account["amount"] = this.oldAmount
        }

        const originalRow = getById(this.rowId)
        originalRow.replaceWith(generateHTML(new BillingRow(this.account)))
    }

    loadScripts() {

        setTimeout(() => {
            
            const closeButton = getById(this.closeButtonId)
            const submitButton = getById(this.submitButtonId)

            if (closeButton) {
                closeButton.onclick = clearAndHideDialog()
            }

            if (submitButton) {
                submitButton.onclick = async event => {
                    event.preventDefault()
                    await this.processForm()
                }
            }

        }, 0);
    }
}
