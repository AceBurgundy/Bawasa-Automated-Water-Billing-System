/**
 * A utility class for constructing response objects with standardized properties.
 * @class
 */
class Response {
	constructor() {
		this.response = {
			status: "success",
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
		this.response.status = "failed";
		return this;
	}

	/**
     * Sets the response status to "success".
     * @function
     * @returns {Response} The Response instance.
     */
	success() {
		this.response.status = "success";
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
     * Sets the response status to "failed", adds toast and field error if provided.
     * @function
     * @param {string} [errorMessage] - The general error message to be added.
     * @param {string} [fieldName] - The name of the field associated with the error.
     * @returns {Object} The constructed response object.
     */
	responseError(errorMessage, fieldName) {
		this.failed();
		errorMessage && this.addToast(errorMessage);
		fieldName && this.addFieldError(fieldName, errorMessage);
		return this.getResponse();
	}	  

	/**
     * Retrieves the constructed response object.
     * @function
     * @returns {Object} The constructed response object.
     */
	getResponse() {
		return this.response;
	}
}

module.exports = Response