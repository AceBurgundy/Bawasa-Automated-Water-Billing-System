// helpers
import { formatDate, getById } from "../../../../assets/scripts/helper.js";

// icons
import { icons } from "../../../../assets/scripts/icons.js";

// form
import BillForm from "./BillForm.js";

export default class BillingRow {

    constructor(account, isDisconnected, index) {

        this.isDisconnected = isDisconnected
        this.account = account

        const hasStatuses = account.connectionStatuses.length > 0
        const latestStatus = account.connectionStatuses[0].status

        this.connectionStatus = hasStatuses ? latestStatus : null
        this.clientHasBills = account.bills.length > 0
        this.billData = this.clientHasBills ? account.bills[0] : {}
        
        const { 
            disconnectionDate, 
            secondReading, 
            firstReading, 
            consumption, 
            amountPaid, 
            balance, 
            penalty, 
            dueDate, 
            excess, 
            status, 
            total
        } = this.billData

        const hasFirstReading = firstReading !== null && firstReading !== undefined
        const hasSecondReading = secondReading !== null && secondReading !== undefined

        this.hasEitherReadings = hasFirstReading || hasSecondReading
        this.hasBothReadings = hasFirstReading && hasSecondReading

        this.clientHasPaid = status === "paid" || status === "overpaid"
        
        this.printBillButtonId = ["print-button", index].join('-')
        this.newBillButtonId = ["new-button", index].join('-')
        this.payBillButtonId = ["pay-button", index].join('-')
        
        this.rowMenuToggleId = ["row-menu-toggle", index].join('-')
        this.rowMenuId = ["row-menu", index].join('-')
        this.rowId = ["table-row", index].join('-')

        this.template = `

            <div id="${this.rowId}" class="table-info account" data-client-id="${account.id}" data-account-number="${account.accountNumber}" data-meter-number="${account.meterNumber}" data-full-name="${account.fullName}">

                <div id="${this.rowMenuId}" class="table-info__options" data-client-id="${account.id}">
                    ${ this.renderRowOptions() }
                </div> 

                <div class="table-info__item">
                    <p>${ account.accountNumber || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ account.fullName || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ account.meterNumber || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ firstReading || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ secondReading || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ consumption || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ total || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ formatDate(dueDate) || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ status || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ penalty || "0.0" }</p>
                </div>
                <div class="table-info__item">
                    <p>${ excess || "0.0" }</p>
                </div>
                <div class="table-info__item">
                    <p>${ balance || "0.0" }</p>
                </div>
                <div class="table-info__item">
                    <p>${ amountPaid || "0.0" }</p>
                </div>
                <div class="table-info__item">
                    <p>${ formatDate(disconnectionDate) || '' }</p>
                </div>
                <div id="${this.rowMenuToggleId}" class="table-info__item table-menu" data-client-id="${account.id}" data-client-disconnected="${isDisconnected}">
                    <div class="icon-box">
                        ${ icons.menuIcon(null, "menu") }
                    </div>
                </div>
            </div>
        `

        this.loadScript()
    }

    toString() {
        return this.template
    }

    renderRowOptions() {

        return `
            <p>Menu</p>
            <div class="table-info__options-item-box account" data-client-has-paid="${this.clientHasPaid}" data-client-id="${ this.account.id }" data-client-has-bills="${ this.clientHasBills }">
                ${
                    this.isDisconnected ? 
                        this.disconnectedMessage() 
                    :
                        [
                            this.newBillButton(),
                            this.payBillButton(),
                            this.printBillButton(),
                        ].join("")
                }
            </div>    
        `
    }

    newBillButton() {

        return this.clientHasPaid || this.hasEitherReadings ? `
            <div id="${this.newBillButtonId}" class="table-info__options-item">
                ${ 
                    icons.editIcon(null, "edit-table-icon")
                }
                <p>New</p>
            </div>
        ` : ""
    }
    
    payBillButton() {

        return !this.clientHasPaid && this.hasBothReadings ? `
            <div id="${this.payBillButtonId}" class="table-info__options-item">
                ${ 
                    icons.payIcon(null, "table-pay-icon")
                }
                <p>Pay</p>
            </div>
        ` : ""
        }
        
    printBillButton() {
        
        return !this.clientHasPaid && this.hasBothReadings ? `
            <div id="${this.printBillButtonId}" class="table-info__options-item">
                ${
                    icons.printIcon(null, "print-bill-icon")
                }
                <p>Print Bill</p>
            </div>
        ` : ""
    }

    disconnectedMessage() {
        return `
            <div class="table-info__options-item">
                <p>Disconnected</p>
            </div>
        `
    }

    loadScript() {
        
        setTimeout(() => {
            
            const newBillButton = getById(this.newBillButtonId)
            const payBillButton = getById(this.payBillButtonId)
            const printBillButton = getById(this.printBillButtonId)
            const rowMenuToggle = getById(this.rowMenuToggleId)
            const rowMenu = getById(this.rowMenuId)
    
            if (newBillButton) {
                newBillButton.onclick = () => {
                    rowMenu.classList.remove("active")
                    new BillForm(this.rowId, "new", this.account, this.clientHasPaid)
                }
            }
    
            if (payBillButton) {
                payBillButton.onclick = () => {
                    rowMenu.classList.remove("active")
                    new BillForm(this.rowId, "pay", this.account, this.clientHasPaid)
                }
            }
    
            if (printBillButton) {
                printBillButton.onclick = () => {
                    console.log("print");
                    rowMenu.classList.remove("active")
                }
            }

            if (rowMenuToggle) {
                rowMenuToggle.onclick = () => {
                    rowMenu.classList.toggle("active")
                }
            }

        }, 0);

    }

}

