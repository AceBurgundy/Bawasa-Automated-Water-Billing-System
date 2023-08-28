/**
 * Generates a payment form template for a client's bill payment.
 * This form will be added as the html template of the <dialog></dialog> code in html
 *
 * @param {Object} formData - The form data containing client details and bills.
 * @returns {string} - The HTML template for the payment form.
 */
export async function payBillForm(formData) {

    const latestBill = formData.Client_Bills[0]
    const paymentStatus = latestBill.paymentStatus
    const fullName = formData.fullName

    console.log(latestBill);
    
    const readingWarning =
        (paymentStatus === "unpaid" && `Mr/Mrs ${fullName} current bill is ${latestBill.billAmount}`) ||
        (paymentStatus === "underpaid" && `Mr/Mrs ${fullName} remaining balance is ${latestBill.remainingBalance}`)

	const template = `
        <form id="pay-bill-form">
            <p id="pay-bill-form-title">New payment for Mr/Mrs ${formData.fullName}</p>
            <div id="pay-bill-form__input-box">
                <p id="pay-bill-form__input-box__warning">${readingWarning}</p>
                <div id="pay-bill-form-input-box-header">
                    <label>Payment Amount</label>
                    <p id="pay-bill-form-input-box-header-error"> </p>
                </div>
                <input 
                id="pay-bill-form-input-box-input" 
                    type="number" 
                    name="amount" 
                    value="12"
                    required>
            </div>
            <div id="pay-bill-form-buttons">
                <button class="button-primary" id="pay-bill-form-close">Cancel</button>
                <button class="button-primary" id="pay-bill-form-submit" data-client-id="${formData?.id}" data-bill-id="${latestBill?.id || ""}">Pay</button>
            </div>
        </form>
    `

	return template
}
