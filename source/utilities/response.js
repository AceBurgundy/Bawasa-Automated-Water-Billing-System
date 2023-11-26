/**
 * A utility class for constructing response objects with standardized properties.
 * @class
 */
class Response {

	static SUCCESS = "success"
	static FAILED = "failed"
	
	constructor() {
		this.response = {
			status: Response.SUCCESS,
			toast: [],
			fieldErrors: {},
			elementName: null,
		};
	}

	/**
	 * Sets the response status to "failed".
	 * @function
	 * @returns {Response} The Response instance.
	 */
	failed() {
		this.response.status = Response.FAILED;
		return this;
	}

	/**
	 * Sets the response status to "success".
	 * @function
	 * @returns {Response} The Response instance.
	 */
	success() {
		this.response.status = Response.SUCCESS;
		return this;
	}

	/**
	 * Adds a toast message to the response.
	 * @function
	 * @param {string} message - The message to be added.
	 * @returns {Response} The Response instance.
	 */
	addToast(message) {
		this.response.toast.push(message);
		return this;
	}

	/**
	 * Adds a field-specific error message to the response.
	 * 
	 * @function
	 * @param {string} fieldName - The name of the field associated with the error.
	 * @param {string} errorMessage - The error message to be added.
	 * @returns {Response} The Response instance.
	 */
	addFieldError(fieldName, errorMessage) {
		if (!this.response.fieldErrors[fieldName]) {
			this.response.fieldErrors[fieldName] = [];
		}
		this.response.fieldErrors[fieldName].push(errorMessage);
		return this;
	}

	/**
	 * Adds or updates a key-value pair in the response object.
	 * 
	 * @function
	 * @param {string} key - The key to be added or updated.
	 * @param {any} value - The value associated with the key.
	 * @returns {Response} The Response instance.
	 */
	addObject(key, value) {
		this.response[key] = value;
		return this;
	}

	/**
	 * Sets the response status to "failed", adds toast and field error if provided.
	 * @function
	 * @param {string} [errorMessage] - The general error message to be added.
	 * @param {string} [fieldName] - The name of the field associated with the error.
	 * @returns {Object} The constructed response object.
	 */
	Error(errorMessage, fieldName) {
		this.failed();
		if (fieldName) this.addFieldError(fieldName, errorMessage);
		if (errorMessage) this.addToast(errorMessage);
		return this.getResponse();
	}

	/**
	 * Shorter way to return response by returning response.success() with a response.toast()
	 * 
	 * @function
	 * @param {string|null} message - The general success message to be added.
	 * @returns {Response} The constructed response object.
	 */
	Ok(message = null) {
		this.success()
		if (message) this.addToast(message)
		return this.getResponse()
	}

	/**
	 * @function ErrorWithData
	 * 
	 * @description 
	 * Shorter way to return response with data by returning 
	 * response.failed() with a response.addObject()
	 * 
	 * @param {string} key - The key to be added.
	 * @param {string} value - The value for the key.
	 * @throws {Exception} When no key value is added, or either the key or value is missing
     * @returns {Response} The constructed response object.
	 */
	ErrorWithData = (key, value) => {

		if (!key && !value) {
			throw new Error("A response with data method must have a key : value for the data")
		}

		if (!key && value) {
			throw new Error("A response value must have a key")
		}

		if (key && !value) {
			throw new Error("A response key must have a value")
		}

		this.failed()
		this.addObject(key, value)
		return this.getResponse()
	}

	/**
	 * @function OkWithData
	 * 
	 * @description
	 * Shorter way to return response with data by returning 
	 * response.success() with a response.addObject()
	 * 
	 * @param {string} key - The key to be added.
	 * @param {string} value - The value for the key.
	 * @throws {Exception} When no key value is added, or either the key or value is missing
     * @returns {Response} The constructed response object.
	 */
    OkWithData = (key, value) => {

		if (!key && !value) {
			throw new Error("A response with data method must have a key : value for the data")
		}

		if (!key && value) {
			throw new Error("A response value must have a key")
		}

		if (key && !value) {
			throw new Error("A response key must have a value")
		}

		this.success()
		this.addObject(key, value)
		return this.getResponse()
	}

	getResponse() {
		return this.response;
	}
}

const response = new Response()

module.exports = response
