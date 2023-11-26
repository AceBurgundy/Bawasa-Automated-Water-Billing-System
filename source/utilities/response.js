/**
 * A utility class for constructing response objects with standardized properties.
 * @class
 * @public
 */
class Response {

	/**
	 * Represents the success status.
	 * @constant {string}
	 */
	static SUCCESS = "success";

	/**
	 * Represents the failed status.
	 * @constant {string}
	 */
	static FAILED = "failed";
	
	/**
	 * Creates a new Response instance with default properties.
	 * @constructor
	 */
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
	 * @method
	 * @returns {Response} - The Response instance.
	 */
	failed() {
		this.response.status = Response.FAILED;
		return this;
	}

	/**
	 * Sets the response status to "success".
	 * @method
	 * @returns {Response} - The Response instance.
	 */
	success() {
		this.response.status = Response.SUCCESS;
		return this;
	}

	/**
	 * Adds a toast message to the response.
	 * @method
	 * @param {string} message - The message to be added.
	 * @returns {Response} - The Response instance.
	 */
	addToast(message) {
		this.response.toast.push(message);
		return this;
	}

	/**
	 * Adds a field-specific error message to the response.
	 * @method
	 * @param {string} fieldName - The name of the field associated with the error.
	 * @param {string} errorMessage - The error message to be added.
	 * @returns {Response} - The Response instance.
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
	 * @method
	 * @param {string} key - The key to be added or updated.
	 * @param {any} value - The value associated with the key.
	 * @returns {Response} - The Response instance.
	 */
	addObject(key, value) {
		this.response[key] = value;
		return this;
	}

	/**
	 * Sets the response status to "failed", adds toast and field error if provided.
	 * @method
	 * @param {string} errorMessage - The general error message to be added.
	 * @param {string} fieldName - The name of the field associated with the error.
	 * @returns {Response} - The Response instance.
	 */
	Error(errorMessage, fieldName) {
		this.failed();
		if (fieldName) this.addFieldError(fieldName, errorMessage);
		if (errorMessage) this.addToast(errorMessage);
		return this.getResponse();
	}

	/**
	 * Shorter way to return response by returning response.success() with a response.toast().
	 * @method
	 * @param {string|null} message - The general success message to be added.
	 * @returns {Response} - The Response instance.
	 */
	Ok(message = null) {
		this.success();
		if (message) this.addToast(message);
		return this.getResponse();
	}

	/**
	 * Shorter way to return response with data by returning response.failed() with a response.addObject().
	 * @method
	 * @param {string} key - The key to be added.
	 * @param {string} value - The value for the key.
	 * @throws {Error} When no key value is added, or either the key or value is missing.
	 * @returns {Response} - The Response instance.
	 */
	ErrorWithData = (key, value) => {

		if (!key && !value) {
			throw new Error("A response with data method must have a key : value for the data");
		}

		if (!key && value) {
			throw new Error("A response value must have a key");
		}

		if (key && !value) {
			throw new Error("A response key must have a value");
		}

		this.failed();
		this.addObject(key, value);
		return this.getResponse();
	}

	/**
	 * Shorter way to return response with data by returning response.success() with a response.addObject().
	 * @method
	 * @param {string} key - The key to be added.
	 * @param {string} value - The value for the key.
	 * @throws {Error} When no key value is added, or either the key or value is missing.
	 * @returns {Response} - The Response instance.
	 */
	OkWithData = (key, value) => {

		if (!key && !value) {
			throw new Error("A response with data method must have a key : value for the data");
		}
		
		if (!key && value) {
			throw new Error("A response value must have a key");
		}

		if (key && !value) {
			throw new Error("A response key must have a value");
		}
		
		this.success();
		this.addObject(key, value);
		return this.getResponse();
	}

	/**
	 * Returns the constructed response object.
	 * @method
	 * @returns {Object} - The response object.
	 */
	getResponse = () => this.response;
}

/**
 * Default instance of the Response class.
 * @const {Response}
 */
const response = new Response();

/**
 * Exports the Response instance for external use.
 */
module.exports = response;
