// helpers
import { clearAndHideDialog, fillAndShowDialog, generateHTML, generateUniqueId, getById } from "../../../../assets/scripts/helper.js"
import makeToastNotification from "../../../../assets/scripts/toast.js"

// row
import BillingRow from "./BillingRow.js"

/**
 * Generates a ${this.billType} bill entry form template for a client's billing record.
 *
 * @class BillForm
 * @param {Object} formData - The form data containing client details and bills.
 * @param {boolean} forNewBill - Indicates whether the form is for a ${this.billType} bill entry.
 * @returns {string} The HTML template for the ${this.billType} bill entry form.
 */
export default class {

    constructor(rowId, billType, formData, forNewBill) {
        
        latestBill = formData.bills ? formData.bills[0] : null
        const { lastName, id } = formData

        this.billType = billType
        this.rowId = rowId
                
        this.billId = latestBill.id || null
        this.clientId = id || null

        familyName = `Mr/Mrs ${lastName}`

        this.formPurpose = `${billType}-bill`

        const [readingWarning , title] = getReadingWarningAndTitle(latestBill, forNewBill, familyName)
    
        this.dialogErrorId = generateUniqueId(`${ this.formPurpose }-form-input-box-header-error`)
        this.dialogInputId = generateUniqueId(`${ this.formPurpose }-form-input-box-input`)
        this.dialogId = generateUniqueId(`${ this.formPurpose }-box`)
        
        this.submitButtonId = generateUniqueId(`${ this.formPurpose }-form-submit`)
        this.closeButtonId = generateUniqueId(`${ this.formPurpose }-form-close`)

        this.template = `
            <form id="${ this.formPurpose }-form">
                <p id="${ this.formPurpose }-form-title">${title}</p>
                <div id="${ this.formPurpose }-form__input-box">
                    <p id="${ this.formPurpose }-form__input-box__warning">${readingWarning}</p>
                    <div id="${ this.formPurpose }-form-input-box-header">
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
                <div id="${ this.formPurpose }-form-buttons">
                    <button class="button-primary" id="${this.closeButtonId}">Cancel</button>
                    <button class="button-primary" id="${this.submitButtonId}">
                        ${ billType === "new" ? "Add" : "Pay" }
                    </button>
                </div>
            </form>
        `
    
        this.loadScripts()
        this.toString()
    }

    toString() {
        fillAndShowDialog(this.template)
    }

    getReadingWarningAndTitle(latestBill, forNewBill, familyName) {

        let readingWarning = null
        let title = null
        
        switch (billType) {

            case "new":

                title = `New Reading for ${ familyName }`

                if (!latestBill || forNewBill) {
                    readingWarning = "This will be the client's new billing record"
                    break
                }
                
                readingWarning = `${ familyName }'s previous reading is ${ latestBill.firstReading || '' }`
                break

            case "pay":

                if (!latestBill) break

                title = `Bills payment for ${ familyName }`
                const paymentStatus = latestBill.paymentStatus

                switch (paymentStatus) {
                    
                    case "unpaid":
                        readingWarning = `${ familyName } current bill is ${ latestBill.billAmount || "Not found" }`
                        break

                    case "unpaid":
                        readingWarning = `${ familyName } remaining balance is ${ latestBill.remainingBalance || "Not found" }`
                        break

                    default:
                        readingWarning = ''
                        break
                }

                break
        
            default:
                break
        }

        return [readingWarning, title]
    }

    async processForm() {
        
        const errorElement = getById(this.dialogErrorId)
        const dialogInput = getById(this.dialogInputId)
        const notFloat = !inputValue.test(/[0-9.]/g)

        const inputValue = dialogInput.value
        
        if (inputValue.trim() === '') {
            errorElement.textContent = "Payment amount cannot be empty"
            return
        }

        if (!this.clientId) {
            errorElement.textContent = "Missing client id"
            return
        }

        if (notFloat) {
            errorElement.textContent = "Must be a number"
            return
        }

        const newBillData = {
            monthlyReading: inputValue,
            clientId: this.clientId,
            billId: this.billId,
        }

        const payBillData = {
            amount: inputValue,
            billId: this.billId
        }

        // process bill
        const processBillArguments = this.billType === "new" ? newBillData : payBillData            
        const processBill = await window.ipcRenderer.invoke(this.formPurpose, processBillArguments)
        
        makeToastNotification(processBill.toast)

        if (processBill.status === "failed") return
        clearAndHideDialog()

        await this.updateRow(processBill)

    }

    async updateRow(processBill) {
        
        const getBill = await window.ipcRenderer.invoke("get-bill", { 
            billId: processBill.billId || this.billId, 
            clientId: this.clientId 
        })
        
        makeToastNotification(getBill.toast)

        if (getBill.status === "failed") return

        const updatedBillData = JSON.parse(getBill.data)
        
        const newRowTemplate = new BillingRow(updatedBillData)
        const newRowHTML = generateHTML(newRowTemplate)

        const originalRow = getById(this.rowId)
        originalRow.replaceWith(newRowHTML)

    }

    loadScripts() {

        setTimeout(() => {
            
            const closeButton = getById(this.closeButtonId)
            const submitButton = getById(this.submitButtonId)

            closeButton.onclick = event => {
                event.preventDefault()
                clearAndHideDialog()
            }

            submitButton.onclick = async event => {
                event.preventDefault()
                await this.processForm()
            }

        }, 0)
    }
}
