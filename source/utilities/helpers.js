const Client = require("../../models/Client")
const ClientBill = require("../../models/ClientBill")

const path = require("path")

/**
 * Wraps a callback function in a try-catch block for error handling.
 * @async
 * @function
 * @param {Function} callback - The callback function to wrap.
 */
async function tryCatchWrapper(callback) {
	try {
		return await callback()
	} catch (error) {
		console.log(error)
	}
}

/**
 * The function throws an error and logs it, with an optional custom message.
 * 
 * @param {Error} error - The error parameter is the error object that you want to log and throw.
 * @param {string|null} customMessage - The customMessage parameter is an optional parameter that allows you to provide a custom error message. 
 * If no custom message is provided, the error message will be the same as the original error.
 * 
 * ```
 * new Error(customMessage ?? error)
 * ```
 * @returns a new Error object.
 */
function throwAndLogError(error, customMessage = null) {
    console.log(error)
    return customMessage ? new Error(customMessage) : error
}

function formatDate(date) {
    return date ?? false ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })    
    : ''
}

/**
 * Emits an event to the sender with a specified key and value.
 * @function
 * @param {Electron.Event} event - The event object from Electron.
 * @param {string} key - The key to identify the event.
 * @param {*} value - The value to be sent with the event.
 */
function emitEvent(event, key, value) {
    if (!event) {
        console.log("Missing event for emit")
        return
    } 
    
    event.sender.send(key, value)
}

/**
 * Joins and resolves paths.
 *
 * @param {(string|Array<string>)} resolveParams - The path or paths to resolve.
 * @param {(string|Array<string> )} joinParams - The path or paths to join.
 * @returns {string} The joined and resolved path.
 */
function joinAndResolve(resolveParams, joinParams) {
    return path.join(path.resolve(...[].concat(resolveParams)), ...[].concat(joinParams));
}

/**
 * Generates the next account/bill number based on the last client's account/bill number.
 * @async
 * @function
 * @returns {Promise<string>} The generated account number.
 */
async function generateNextAccountOrBillNumber(type) {

	const isClient = type === "Client"

    const latestRecord = isClient ?
		await Client.findOne({ order: [["createdAt", "DESC"]] })
	:
		await ClientBill.findOne({ order: [["createdAt", "DESC"]] })

    if (!latestRecord) {
        return isClient ? "0000-AA" : "000000000-AAAA"
    }

    let nextNumber = isClient ? "0000" : "000000000"
    let nextLetter = isClient ? "AA" : "AAAA"

    const latestNumber = isClient ? latestRecord.accountNumber : latestRecord.billNumber
    const numberSection = parseInt(latestNumber.split("-")[0], 10)
    const letterSection = latestNumber.split("-")[1]

    if (numberSection === 9999 || numberSection === 999999999) {
        const lastLetterCharCode = letterSection.charCodeAt(letterSection.length - 1);
        
        if (lastLetterCharCode !== 90) {
            nextLetter = "A" + String.fromCharCode(lastLetterCharCode + 1)
        }
    } else {
        nextNumber = String((isClient ? "0000" : "000000000") + (numberSection + 1)).slice(-nextNumber.length)
        nextLetter = letterSection
    }

	return [nextNumber, nextLetter].join('-')

}

module.exports = { 
    generateNextAccountOrBillNumber,
    throwAndLogError,
    tryCatchWrapper, 
    joinAndResolve,
    formatDate,
    emitEvent
}