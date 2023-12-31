const userRelationshipTypes = {
  Single: 'Single',
  Married: 'Married',
  RatherNotSay: 'Rather not say'
};

/**
 * Checks if the provided value is empty.
 *
 * @param {string} value - The value to be checked.
 * @return {Object} An object with a 'result' property indicating whether
 * the value is empty, and a 'message' property with error messages if applicable.
 */
const isEmpty = value => {
  if (value === null) {
    return {
      passed: false,
      message: `${isEmpty.name} validation cannot work without a value`
    };
  }

  return value === '' || value === 'N/A'?
        {passed: false, message: 'is empty'} :
        {passed: true};
};

/**
 * Checks if the provided value is a valid email address.
 *
 * @param {string} value - The value to be checked.
 * @return {Object} An object with a 'result' property indicating whether
 * the value is a valid email address, and a 'message' property with error messages if applicable.
 */
const isEmail = value => {
  if (value === null) {
    return {
      passed: false,
      message: `${isEmail.name} validation cannot work without a value`
    };
  }

  if (!value.includes('@')) {
    return {passed: false, message: `is missing '@' symbol`};
  }

  if (!value.includes('.')) {
    return {passed: false, message: `is missing 'domain' (.domain)`};
  }

  return {passed: true};
};

/**
 * Checks if the provided value is not in a given list of values.
 *
 * @param {Array} list - The list of values to check against.
 * @param {string} value - The value to be checked.
 * @return {Object} An object with a 'result' property indicating whether the
 * value is not in the list, and a 'message' property with error messages if applicable.
 */
const notIn = (list, value) => {
  if (value === null) {
    return {
      passed: false,
      message: `${notIn.name} validation cannot work without a value`
    };
  }

  return !list.includes(value) ?
        {passed: false, message: `${value} is not among the choices ${list.join(', ')}`} :
        {passed: true};
};

/**
 * Checks if the provided string has no symbols.
 *
 * @param {string} value - The string to be checked.
 * @return {Object} An object with a 'passed' property indicating whether the
 * string has no symbols, and a 'message' property with error messages if applicable.
 */
const hasNoSymbols = value => {
  if (!value) {
    return {
      passed: false,
      message: `${hasNoSymbols.name} validation cannot work without a value`
    };
  }

  const regex = /[^a-zA-Z0-9]/g;

  // Test the value against the regex
  const result = !regex.test(String(value).trim());

  if (!result) {
    return {passed: false, message: 'should not have symbols'};
  }

  return {passed: true};
};


/**
 * Checks if the provided value is a valid birthdate.
 *
 * @param {string} value - The value to be checked.
 * @return {Object} An object with a 'result' property indicating whether the
 * value is a valid birthdate, and a 'message' property with error messages if applicable.
 */
const isBirthDate = value => {
  if (value === null) {
    return {
      passed: false,
      message: `${isBirthDate.name} validation cannot work without a value`};
  }

  const enteredDate = new Date(value);

  return isNaN(enteredDate.getTime()) ?
        {passed: false, message: 'must be a valid birthdate mm/dd/yyyy'} :
        {passed: true};
};

/**
 * Checks if the provided value is a valid phone number.
 *
 * @param {string} value - The value to be checked.
 * @return {Object} An object with a 'result' property indicating whether the
 * value is a valid phone number, and a 'message' property with error messages if applicable.
 */
const isValidPhoneNumber = value => {
  if (value === null) {
    return {
      passed: false,
      message: ` ${isValidPhoneNumber.name} validation cannot work without a value`
    };
  }

  const phoneNumberRegex = /^\d{10}$/;

  return !phoneNumberRegex.test(value) ?
        {passed: false, message: `${value} is not a valid phone number`} :
        {passed: true};
};

/**
 * Checks if the provided value is within a specified range.
 *
 * @param {number} start - The minimum allowed value.
 * @param {number} limit - The maximum allowed value.
 * @param {string|number} value - The value to be checked.
 * @return {[number, string[]]} An array with two elements:
 *   - The number of errors (0, 1, or 2).
 *   - An array of error messages (empty if no errors).
 */
const isOverThan = (start, limit, value) => {
  if (value === null) {
    return {
      passed: false,
      message: `${isOverThan.name} validation cannot work without a value`
    };
  }

  const isEmptyValidation = isEmpty(value);
  if (!isEmptyValidation.passed) return {passed: false, message: isEmptyValidation.message};

  const number = isNaN(parseInt(value)) ? value.length : value;

  return number > limit ?
        {passed: false, message: `must not be greater than ${limit}`} :
    number < start ?
        {passed: false, message: `must not be lesser than ${start}`} :
        {passed: true};
};

/**
 * Validates the provided formData object.
 *
 * @param {Object} formData - The formData object to be validated.
 * @return {Object} An object containing validation errors the moment it finds one, if any.
 *   - {boolean} status - Indicates whether the validation passed (`true`) or failed (`false`).
 *   - {string} [field] - The field that failed validation, available only if status is `false`.
 *   - {string} [message] - The error message describing the validation failure,
 *  available only if status is `false`.
 */
function validateFormData(formData) {
  const errors = {
    status: true
  };

  const longestRelationshipOption = Object
      .values(userRelationshipTypes)
      .reduce((a, b) => (b.length > a.length ? b : a))
      .length;

  const shortestRelationshipOption = Object
      .values(userRelationshipTypes)
      .reduce((a, b) => (b.length < a.length ? b : a))
      .length;

  const validations = {
    firstName: [
      [isEmpty], [isOverThan, 2, 255]
    ],

    middleName: [
      [isEmpty], [isOverThan, 2, 255]
    ],

    lastName: [
      [isEmpty], [isOverThan, 2, 255]
    ],

    relationshipStatus: [
      [isEmpty],
      [isOverThan, shortestRelationshipOption, longestRelationshipOption],
      [notIn, [...Object.values(userRelationshipTypes)]]
    ],

    birthDate: [
      [isEmpty], [isBirthDate]
    ],

    age: [
      [isEmpty], [isOverThan, 15, 70]
    ],

    email: [
      [isEmpty], [isEmail], [isOverThan, 5, 255]
    ],

    occupation: [
      [isEmpty], [isOverThan, 2, 255]
    ],

    phoneNumber: [
      [isEmpty], [isValidPhoneNumber]
    ],

    presentAddressStreet: [
      [isEmpty], [isOverThan, 5, 9999]
    ],

    // presentAddressRegion: [
    //   [isOverThan, 5, 255]
    // ],

    presentAddressBarangay: [
      [isEmpty], [isOverThan, 5, 255]
    ],

    presentAddressCity: [
      [isEmpty], [isOverThan, 5, 255]
    ],

    presentAddressPostalCode: [
      [isEmpty], [isOverThan, 5, 9999]
    ],

    presentAddressDetails: [
      [isEmpty], [isOverThan, 5, 255]
    ],

    mainAddressStreet: [
      [isEmpty], [isOverThan, 5, 9999]
    ],

    mainAddressBarangay: [
      [isEmpty], [isOverThan, 5, 255]
    ],

    mainAddressCity: [
      [isEmpty], [isOverThan, 5, 255]
    ],

    mainAddressPostalCode: [
      [isEmpty], [isOverThan, 5, 9999]
    ],

    mainAddressDetails: [
      [isEmpty], [isOverThan, 5, 255]
    ]

    // mainAddressRegion: [
    //   [isOverThan, 5, 255]
    // ]
  };

  const entries = Object.entries(formData);

  for (const [key, dirtyValue] of entries) {
    if (typeof dirtyValue !== 'object') {
      const value = dirtyValue.trim();

      if (key in validations) {
        for (const [validator, ...args] of validations[key]) {
          const response = validator(...args, value);

          if (response.passed === false) {
            errors['status'] = false;
            errors['field'] = key;
            errors['message'] = `${camelCaseToTitleCase(key)} ${response.message}`;
            break;
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Converts camelCase string to Title Case
 * @param {string} inputString - The input to be converted.
 * @return {string} the converted text
 */
function camelCaseToTitleCase(inputString) {
  const notCamelCase = !/^[a-z]+([A-Z][a-z]*)*$/.test(inputString);
  if (notCamelCase) return inputString;
  // Split the string into words
  const words = inputString.split(/(?=[A-Z])/);
  // UpperCase each first letter and join them again into a single string
  const result = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return result;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    isValidPhoneNumber,
    validateFormData,
    hasNoSymbols,
    isBirthDate,
    isEmpty,
    isEmail,
    notIn
  };
} else {
  window.isValidPhoneNumber = isValidPhoneNumber;
  window.validateFormData = validateFormData,
  window.hasNoSymbols = hasNoSymbols;
  window.isBirthDate = isBirthDate;
  window.isOverThan = isOverThan;
  window.isEmpty = isEmpty;
  window.isEmail = isEmail;
  window.notIn = notIn;
}
