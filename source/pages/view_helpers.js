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

module.exports = tryCatchWrapper