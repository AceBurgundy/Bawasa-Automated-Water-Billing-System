/**
 * Wraps a callback function in a try-catch block for error handling.
 * @function
 * @param {Function} callback - The callback function to wrap.
 */
async function tryCatchWrapper(callback) {
	try {
		return await callback()
	} catch (error) {
		console.log(error)
		console.log(`\n${error.name}\n`)
		console.log(`${error.message}`)
	}
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
 * Generates the next account/bill number based on the last client's account/bill number.
 * @async
 * @function
 * @returns {Promise<string>} The generated account number.
 */
const generateNextAccountOrBillNumber = async function (type) {

	isClient = type === "Client"

    const latestRecord = await isClient ?
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
        
        lastLetterCharCode === 90
            ? (nextLetter = isClient ? "AA" : "AAAA")
            : (nextLetter = "A" + String.fromCharCode(lastLetterCharCode + 1))
    } else {
        nextNumber = String((isClient ? "0000" : "000000000") + (numberSection + 1)).slice(-nextNumber.length)
        nextLetter = letterSection
    }

	return `${nextNumber}-${nextLetter}`

}

module.exports = { tryCatchWrapper, formatDate, generateNextAccountOrBillNumber }