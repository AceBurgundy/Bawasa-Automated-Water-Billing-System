/**
 * Generates a new bill entry form template for a client's billing record.
 *
 * @param {Object} formData - The form data containing client details and bills.
 * @param {boolean} forNewBill - Indicates whether the form is for a new bill entry.
 * @returns {string} - The HTML template for the new bill entry form.
 */
export function newBillForm(formData, forNewBill) {

    const latestBill = formData.Client_Bills[0];

    const readingWarning = (latestBill === undefined || forNewBill) ?
        "This will be the client's new billing record" :
        `Mr/Mrs ${formData?.lastName}'s previous reading is ${latestBill.firstReading}`;

    const template = `
        <form id="new-bill-form">
            <p id="new-bill-form-title">New Reading for Mr/Mrs ${formData?.fullName}</p>
            <div id="new-bill-form__input-box">
                <p id="new-bill-form__input-box__warning">${readingWarning}</p>
                    <div id="new-bill-form-input-box-header">
                    <label>Reading</label>
                <p id="new-bill-form-input-box-header-error"> </p>
                </div>
                <input 
                    id="new-bill-form-input-box-input" 
                    type="number" 
                    name="reading" 
                    value="12"
                    required>
            </div>
            <div id="new-bill-form-buttons">
                <button class="button-primary" id="new-bill-form-close">Cancel</button>
                <button class="button-primary" id="new-bill-form-submit" data-client-id="${formData?.id}" data-bill-id="${forNewBill ? '' : latestBill !== null && latestBill !== undefined ? latestBill.id : ''}">Add</button>
            </div>
        </form>
    `;

    return template;
}
