// constants
const {connectionStatusTypes} = require('../../../utilities/constants');

// utilities
const Response = require('../../../utilities/Response');

// models
const Client = require('../../../../models/Client');

const {ipcMain} = require('electron');

// functions
const {
  calculatePartialPaymentsTotal,
  getBillWithPartialPayments,
  processZeroPaymentBill,
  insertSecondReading,
  handleUnderpaidBill,
  getBillAndStatus,
  handleUnpaidBill,
  createNewBill,
  getAllClients,
  getBillById
} = require('./functions');

// Retrieves a list of bills with associated client data.
ipcMain.handle('accounts', async event => {
  const accounts = await getAllClients();

  if (accounts && accounts.length > 0) {
    const stringAccounts = JSON.stringify(accounts);
    return new Response().okWithData('data', stringAccounts);
  } else {
    return new Response().errorWithData('message', 'No accounts yet');
  }
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
  const {clientId} = args;

  if (!clientId) return new Response().error('Missing client id');

  let clientBill = null;
  const message = 'Cannot find clients bill';

  try {
    clientBill = await Client.findByPk(clientId);
  } catch (error) {
    console.log(error);
    return new Response().error(message);
  }

  if (!clientBill) {
    return new Response().error(message);
  }

  // MISSING CODE TO PRINT RECEIPT
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

  const hasSecondReading = clientBill.secondReading !== null;
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

  const bill = billQuery.toJSON();
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
