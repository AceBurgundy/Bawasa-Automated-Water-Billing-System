/**
 * Updates the contents of a billing table row in the DOM.
 * @param {object} billing - The billing data object.
 * @param {number} index - The index of the billing entry.
 * @param {HTMLElement} element - The element to be updated.
 */
export function updateBillingTableRow(billing, index, element) {

    const clientHasBills = billing.Client_Bills.length > 0;
    const billData = billing.Client_Bills.length > 0 ? billing.Client_Bills[0] : {};
    const { firstReading, secondReading, consumption, billAmount, paymentExcess, dueDate, disconnectionDate, remainingBalance, paymentStatus, paymentAmount } = billData;
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const clientHasPaid = paymentStatus === "paid" || paymentStatus === "overpaid"

    /**
     * Formats a date into a string representation.
     * @param {string} date - The date to be formatted.
     * @returns {string} The formatted date string.
     */
    const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", dateOptions) : "";

    // Use the provided element for updating
    if (element) {
        element.dataset.accountNumber = billing.accountNumber;
        element.dataset.fullName = billing.fullName;
        element.dataset.meterNumber = billing.meterNumber;

        // Update clientPaymentStatus flag
        element.querySelector('.table-info__options-item-box').dataset.clientHasPaid = clientHasPaid
        // Update clientHasBills flag
        element.querySelector('.table-info__options-item-box').dataset.clientHasBills = clientHasBills;
        // Update add option index
        element.querySelector('.table-info__options-item.add').dataset.clientIndex = index;

        // Update pay option class and index
        const payItem = element.querySelector('.table-info__options-item.pay');
        payItem.dataset.clientIndex = index;

        // Update text content for each item in the row
        const items = element.querySelectorAll('.table-info__item p');

        const textContentUpdates = {
            0: billing.accountNumber,
            1: billing.fullName,
            2: billing.meterNumber,
            3: firstReading || "",
            4: secondReading || "",
            5: consumption ?? '',
            6: billAmount ?? '',
            7: formatDate(dueDate),
            8: paymentStatus || "",
            9: paymentExcess ?? "0.0",
            10: remainingBalance ?? '0.0',
            11: paymentAmount || "0.0",
            12: formatDate(disconnectionDate),
        }

        console.log(textContentUpdates);

        for (let index = 0; index <= 12; index++) {
            items[index].textContent = textContentUpdates[index]
        }

    }
}
