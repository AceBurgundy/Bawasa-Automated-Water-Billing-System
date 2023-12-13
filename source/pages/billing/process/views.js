
// utilities
const {connectionStatusTypes} = require('../../../utilities/constants');
const receiptTemplate = require('../../../utilities/receipt-template');
const {printReceipt, getMonth} = require('../../../utilities/helpers');
const Response = require('../../../utilities/response');

const {Sequelize} = require('sequelize');
const {ipcMain} = require('electron');
const {getYear} = require('date-fns');

// functions
const {
  calculatePartialPaymentsTotal,
  getBillWithPartialPayments,
  processZeroPaymentBill,
  insertSecondReading,
  handleUnderpaidBill,
  getBillAndStatus,
  handleUnpaidBill,
  getCompleteData,
  createNewBill,
  getAllClients,
  getBillById
} = require('./functions');

// Retrieves a list of bills with associated client data.
ipcMain.handle('accounts', async (event, table) => {
  const whereClause = {};

  if (table.columnName) {
    whereClause[table.columnName] = {
      [Sequelize.Op.like]: `%${table.columnData}%`
    };
  }

  let accounts = null;
  const statistics = {};

  try {
    accounts = await getAllClients(whereClause);

    if (accounts && accounts.length <= 0) {
      accounts = await getAllClients();
      if (accounts.length <= 0) {
        return new Response().errorWithData('message', 'No accounts yet');
      }
    }
  } catch (error) {
    console.log(error);
    return new Response().errorWithData('message', 'Error in searching for accounts');
  }

  if (accounts) {
    accounts.forEach(account => {
      const hasStatus = account.hasOwnProperty('bills');
      if (hasStatus && account.bills.length > 0) {
        const status = account.bills[0].status;
        if (status in statistics) {
          statistics[status] += 1;
        } else {
          statistics[status] = 1;
        }
      }
    });
  }

  const stringAccounts = JSON.stringify(accounts);
  const stringStatistics = JSON.stringify(statistics);
  return new Response()
      .success()
      .addObject('data', stringAccounts)
      .addObject('statistics', stringStatistics)
      .getResponse();
});

// Retrieves the the bill of a client.
ipcMain.handle('get-bill', async (event, args) => {
  const {billId, clientId} = args;

  if (!billId) {
    return new Response().error('Bill id not found');
  }

  if (!clientId) {
    return new Response().error('Client id not found');
  }

  const bill = await getBillAndStatus(clientId);

  if (!bill) {
    return new Response().error('Cannot find clients bill');
  }

  const stringBill = JSON.stringify(bill);
  return new Response().okWithData('data', stringBill);
});

ipcMain.handle('print-bill', async (event, args) => {
  const {accountId, billId} = args;

  if (!accountId) return new Response().error('Missing account id');
  if (!billId) return new Response().error('Missing bill id');

  const clientWithBill = await getCompleteData(args);
  if (!clientWithBill) return new Response().error('Client not found');

  const fullName = clientWithBill.fullName;
  const billMonth = getMonth(clientWithBill.bills[0].createdAt);
  const billYear = getYear(clientWithBill.bills[0].createdAt);
  const receiptFileName = [fullName, billMonth, billYear, 'receipt'].join(' ');
  const template = receiptTemplate(clientWithBill);

  try {
    await printReceipt(template, receiptFileName, event);
    return new Response().ok(`${receiptFileName} has been printed`);
  } catch (error) {
    return new Response().error(error.message);
  }
});

ipcMain.handle('new-bill', async (event, args) => {
  const {clientId, monthlyReading, billId} = args;

  if (!clientId) {
    return new Response().error('Missing client id');
  }

  if (!monthlyReading) {
    return new Response().error('Missing monthly reading');
  }

  const client = await getBillAndStatus(clientId);

  if (!client) {
    return new Response().error('Cannot find client');
  }

  const connectedEnum = connectionStatusTypes.Connected;
  const hasConnectionStatus = client.connectionStatuses.length > 0;
  const latestNotConnected = client.connectionStatuses[0].status !== connectedEnum;

  /**
     * return if the client doesn't have any connection status records yet or
     * the latest connection status the client (if they have any) is not 'connected'
     * which indicates that the client may currently be 'due for disconnection' or is 'disconnected'
     */
  if (hasConnectionStatus && latestNotConnected) {
    return new Response().error(`Reconnect client first`);
  }

  const clientBill = await getBillById(billId);

  let latestBillAlreadyPaid = false;

  if (clientBill) {
    const billPaid = clientBill.status === 'paid';
    const billOverpaid = clientBill.status === 'overpaid';
    const hasSecondReading = clientBill.secondReading !== null;

    const OverpaidWithSecondReading = billOverpaid && hasSecondReading;

    latestBillAlreadyPaid = billPaid || OverpaidWithSecondReading;
  }

  const hasSecondReading = clientBill && clientBill.secondReading !== null;
  const NotPaidButHasSecondReading = clientBill && !latestBillAlreadyPaid && hasSecondReading;

  if (NotPaidButHasSecondReading) {
    return new Response().error('Current bill must be paid first before proceeding');
  }

  const noBillOrAlreadyPaid = !clientBill || latestBillAlreadyPaid;

  // creation of new bill
  if (noBillOrAlreadyPaid) {
    return await createNewBill(client.id, monthlyReading);
  }

  // Bill updates for 2nd reading or exact payment
  if (!billId) {
    return new Response().error('Bill id not found');
  }

  const bill = await getBillById(billId);

  if (!bill) {
    return new Response().error('Bill not found');
  }

  // If first reading matches new reading, then there is nothing to pay
  const nothingToPay = bill.firstReading === parseFloat(monthlyReading);

  if (nothingToPay) {
    return await processZeroPaymentBill(bill);
  }

  return await insertSecondReading(bill, monthlyReading);
});

ipcMain.handle('pay-bill', async (event, args) => {
  console.log('called');
  console.log(args);
  const {amount, billId} = args;

  if (!amount) {
    return new Response().error('Missing payment amount');
  }

  if (!billId) {
    return new Response().error('Bill id missing');
  }

  const amountPaid = parseFloat(amount);
  const billQuery = await getBillWithPartialPayments(billId);

  if (!billQuery) {
    return new Response().error('Cannot find bill');
  }

  const bill = billQuery;
  const totalPartialPayments = calculatePartialPaymentsTotal(bill);

  switch (bill.status) {
    case 'paid':
      return new Response().error('Bill had already been paid');

    case 'underpaid':
      return await handleUnderpaidBill(bill, totalPartialPayments, amountPaid);

    case 'unpaid':
      return await handleUnpaidBill(billQuery, bill, amountPaid, bill.clientId);

    default:
      return new Response().error('Wrong bill status type');
  }
});
