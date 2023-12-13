/**
 * A utility class for constructing response
 * objects with standardized properties.
 * @class
 * @public
 */
class Response {
  /**
     * Represents the success status.
     * @constant {string}
     */
  static SUCCESS = 'success';

  /**
     * Represents the failed status.
     * @constant {string}
     */
  static FAILED = 'failed';

  /**
     * Creates a new Response instance with default properties.
     * @constructor
     * @property {string} status - The status of the response.
     * @property {Array<string>} toast - An array to store toast messages.
     * @property {Object<string, string>} fieldErrors - An object to store field-specific errors.
     */
  constructor() {
    this.response = {
      status: Response.SUCCESS, // Type for status not provided in the code snippet.
      toast: [],
      fieldErrors: {}
    };
  }

  /**
     * Sets the response status to 'failed'.
     * @method
     * @return {Response}
     */
  failed() {
    this.response.status = Response.FAILED;
    return this;
  }

  /**
     * Sets the response status to 'success'.
     * @method
     * @return {Response}
     */
  success() {
    this.response.status = Response.SUCCESS;
    return this;
  }

  /**
     * Adds a toast message to the response.
     * @method
     * @param {string} message - The message to be added.
     * @return {Response}
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
     * @return {Response}
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
     * @return {Response}
     */
  addObject(key, value) {
    this.response[key] = value;
    return this;
  }

  /**
     * Sets the response status to 'failed', adds toast and field error if provided.
     * @method
     * @param {string|null} message - The general error message to be added.
     * @param {string|null} fieldName - The name of the field associated with the error.
     * @return {Response}
     */
  error(message=null, fieldName=null) {
    this.failed();
    if (fieldName) this.addFieldError(fieldName, message);
    if (message) this.addToast(message);
    return this.getResponse();
  }

  /**
     * Shorter way to return response by returning response.success() with a response.toast().
     * @method
     * @param {string|null} message - The general success message to be added.
     * @return {Response}
     */
  ok(message=null) {
    this.success();
    if (message) this.addToast(message);
    return this.getResponse();
  }

  /**
     * Shorter way to return response with data by returning error with data.
     * @method
     * @param {string} key - The key to be added.
     * @param {string} value - The value for the key.
     * @throws {Error} When no key value is added, or either the key or value is missing.
     * @return {Response}
     */
  errorWithData = (key, value) => {
    if (!key && !value) {
      throw new Error('A response with data method must have a key : value for the data');
    }

    if (!key && value) {
      throw new Error('A response value must have a key');
    }

    if (key && !value) {
      throw new Error('A response key must have a value');
    }

    this.failed();
    this.addObject(key, value);
    return this.getResponse();
  };

  /**
     * Shorter way to return response with data by returning success with data.
     * @method
     * @param {string} key - The key to be added.
     * @param {string} value - The value for the key.
     * @throws {Error} When no key value is added, or either the key or value is missing.
     * @return {Response}
     */
  okWithData = (key, value) => {
    if (!key && !value) {
      throw new Error('A response with data method must have a key : value for the data');
    }

    if (!key && value) {
      throw new Error('A response value must have a key');
    }

    if (key && !value) {
      throw new Error('A response key must have a value');
    }

    this.success();
    this.addObject(key, value);
    return this.getResponse();
  };

  /**
     * Returns the constructed response object.
     * @method
     * @return {Object} The response object.
     */
  getResponse = () => this.response;
}

module.exports = Response;
