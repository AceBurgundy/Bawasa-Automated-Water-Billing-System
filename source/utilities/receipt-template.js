const {formatDate, getMonth} = require('./helpers.js');

/**
 * Returns a complete receipt template for the clients bill
 * @function receiptTemplate
 * @param {Object} client - Client data and bill object
 * @return {string} complete string template for the receipt
 */
module.exports = function(client) {
  const bill = client.bills.length > 0 ? client.bills[0] : null;

  return /* html */`
    <section
      id="receipt"
      style="
        width: 100%;
        font-size: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 5px;">

      <div
        id="receipt-company"
        class="receipt__section"
        style="
          display: grid;
          place-items: center;
          padding: 1rem;
          padding-bottom: 0;">
        <div id="receipt-company-name" style="font-size: 2rem; text-align: center;">
          Barangay Water and Sanitation Association
        </div>
      </div>

      <div
        id="receipt-title"
        style="
          margin: 0 auto;
          font-size: calc(5vw + 1rem);">
        WATER BILL
      </div>

      <div
        id="receipt-month"
        style="
          margin: 0 auto;">
        MONTH OF ${getMonth(bill.createdAt) ?? ''}
      </div>

      <div
        id="receipt-owner"
        style="
          margin: 0 auto;
          text-transform: uppercase;
          font-size: calc(4vw + 1rem);
          text-align: center;">
        ${client.fullName ?? ''}
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="account-number">
            Account No:
        </div>
        <div class="receipt__data-content">
            ${client.accountNumber ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="address">
            Address:
        </div>
        <div class="receipt__data-content">
            ${client.mainAddress.fullAddress ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="meter-no">
            Meter No:
        </div>
        <div class="receipt__data-content">
            ${client.meterNumber ?? ''}
        </div>
      </div>

      <div
        class="divider"
        style="
          border-bottom: 1px dashed gray;
          margin: 1rem 0;">
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="due-date">
            Due Date:
        </div>
        <div class="receipt__data-content">
            ${formatDate(bill.dueDate, 'long') ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="disconnection-date">
            Disonnection Date:
        </div>
        <div class="receipt__data-content">
            ${formatDate(bill.disconnectionDate, 'long') ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="period-covered-from">
            Period Covered From:
        </div>
        <div class="receipt__data-content">
            ${formatDate(bill.createdAt, 'long') ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="period-covered-to">
            Period Covered To:
        </div>
        <div class="receipt__data-content">
          ${formatDate(bill.updatedAt, 'long') ?? ''}
        </div>
      </div>

      <div
        class="divider"
        style="
          border-bottom: 1px dashed gray;
          margin: 1rem 0;">
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="present-reading">
            Pres Reading:
        </div>
        <div class="receipt__data-content">
            ${bill.secondReading ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="previous-reading">
            Prev Reading:
        </div>
        <div class="receipt__data-content">
            ${bill.firstReading ?? ''}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="consumption">
            Consumption:
        </div>
        <div class="receipt__data-content">
            ${bill.consumption ?? ''}
        </div>
      </div>

      <div
        class="divider"
        style="
          border-bottom: 1px dashed gray;
          margin: 1rem 0;">
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="bill-amount">
            Bill Amount:
        </div>
        <div class="receipt__data-content">
          ₱${parseFloat(bill.total).toFixed(2) ?? 0.00}
        </div>
      </div>

      <div
        class="divider"
        style="
          border-bottom: 1px dashed gray;
          margin: 1rem 0;">
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="total-amount">
            Total Amount:
        </div>
        <div class="receipt__data-content">
          ₱${parseFloat(bill.total).toFixed(2) ?? 0.00}
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="address">
            Penalty After Due:
        </div>
        <div class="receipt__data-content">
            5
        </div>
      </div>

      <div
        class="receipt__data"
        style="
          display: grid;
          grid-template-columns: 35% 70%;">
        <div
            class="receipt__data-title"
            data-for="address">
            Total After Due:
        </div>
        <div class="receipt__data-content">
          ₱${parseFloat(bill.total + 5).toFixed(2) ?? 0.00}
        </div>
      </div>

      <div
        class="divider"
        style="
          border-bottom: 1px dashed gray;
          margin: 1rem 0;">
      </div>

      <p id="receipt-message" style="margin-top: 0;">
        Kindly bring this statement when paying at the office.
        A penalty of 5 pesos penalty charge will be added to the bill
        after due date. You can pay your bill starting tomorrow
      </p>

    </section>
  `;
};
