/**
 * Performs a transition to a new section in the application.
 *
 * @param {Function} callback - The function to execute during the transition.
 * @return {void}
 */
export function transition(callback) {
  const box = getById('container');
  callback();

  setTimeout(() => {
    if (box) {
      const lastChild = box.lastElementChild;
      lastChild.style.zIndex = '3';
      lastChild.classList.add('active');
    }
  }, 200);

  setTimeout(() => {
    if (box) {
      box.firstElementChild.remove();
      box.lastElementChild.style.zIndex = '2';
    }
  }, 800);
}


/**
 *
 * @param {Date} date - date object to be formatted
 * @return {Date.toLocaleDateString|null} the formatted date in format 'MMM DD, YYYY' or null
 */
export function formatDate(date) {
  if (date === null || date === undefined) {
    return null;
  }

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Retrieves an HTML element by its ID.
 *
 * @param {string} id - The ID of the HTML element to retrieve.
 * @return {HTMLElement|null} The HTML element with the specified ID, or null if not found.
 */
export function getById(id) {
  return document.getElementById(id);
}

/**
 * Retrieves the first HTML element that matches a CSS selector.
 *
 * @param {string} tag - The selector to query for.
 * @return {HTMLElement|null} The first HTML element that matches the selector,
 * or null if not found.
 */
export function queryElement(tag) {
  return document.querySelector(tag);
}

/**
 * Retrieves a list of HTML elements that match a CSS selector.
 *
 * @param {string} tag - The selector to query for.
 * @return {NodeList} A list of HTML elements that match the selector.
 */
export function queryElements(tag) {
  return document.querySelectorAll(tag);
}

/**
 *
 * @param {string} template - The template literal to be converted to HTML
 * @return {HTMLElement} The HTML element generated from the template.
 */
export const generateHTML = template => {
  const buffer = document.createElement('div');
  buffer.innerHTML = template;

  template = buffer.firstElementChild;
  buffer.remove();

  return template;
};

/**
 * Checks if a string is in camelCase notation and converts it to dashed notation if so.
 *
 * @param {string} inputString - The input string to check and convert.
 * @return {string} The input string in dashed notation if it was in camelCase,
 * otherwise, the input string as is.
 * @example
 * ```
 * const inputString = 'userName'
 * const dashedString = camelToDashed(inputString)
 * console.log(dashedString) // Output: 'user-name'
 * ```
 */
export function camelToDashed(inputString) {
  if (!inputString) {
    console.error('Missing input for camelToDashed');
    return;
  }

  if (typeof inputString !== 'string') {
    console.error('camelToDashed only accepts strings as arguments');
    return;
  }

  const inCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(inputString);
  if (!inCamelCase) return inputString;

  const dashSeparatedWords = [/([a-z])([A-Z])/g, '$1-$2'];
  return inputString.replace([...dashSeparatedWords]).toLowerCase();
};

/**
 * A function that converts a sentence case to camelCase.
 *
 * @param {string} inputString - The input string to be converted.
 * @return {string} The camelCase version
 * @example
 * ```
 * const inputString = "Hello World"
 * const result = sentenceToDashed(inputString)
 * console.log(result) // "helloWorld"
 * ```
 */
export function sentenceToDashed(inputString) {
  if (!inputString) {
    console.error('Missing input for sentenceToDashed');
    return;
  }

  if (typeof inputString !== 'string') {
    console.error('sentenceToDashed only accepts strings as arguments');
    return;
  }

  if (inputString.length > 1) {
    return inputString.split(' ').map((token, index) => {
      if (index === 0) {
        token.toLowerCase();
      } else {
        token.toLowerCase().charAt(0).toUpperCase();
      }
    }).join('');
  }

  return inputString.toLowerCase();
}

/**
 * Get form data by manually iterating through form fields.
 *
 * @param {HTMLFormElement} formElement - The HTML form element to extract data from.
 * @return {formFieldData} A FormData like object containing the form field values.
 */
export function getFormData(formElement) {
  const formFieldData = {};

  const formFields = formElement.querySelectorAll('.form-field__input');

  for (let index = 0; index < formFields.length; index++) {
    const field = formFields[index];
    if (field.name) {
      formFieldData[field.name] = field.value;
    } else {
      console.error(`input with id ${field.id} doesnt have a name attribute`);
    }
  }

  return formFieldData;
}

/**
 * Fixed strings to follow basic sentence casing.
 *
 * @param {string} sentence - Sentence to be transformed to sentence case.
 * @return {string} new sentence
 */
export const toSentenceCase = sentence => {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
};

const dialog = queryElement('dialog');
const background = getById('dialog-backdrop');

/**
 * Fills dialog innerHTML
 *
 * @param {string} template - The innerHTML of the parent dialog
 */
export const fillAndShowDialog = template => {
  dialog.innerHTML = template;
  background.style.display = 'block';
  background.classList.add('open');
  dialog.show();
};

/**
 * Clears the dialog then closes it
 */
export const clearAndHideDialog = () => {
  dialog.classList.add('closing');
  background.classList.add('closing');
  background.classList.remove('open');

  setTimeout(() => {
    dialog.close();
    dialog.innerHTML = '';
    dialog.classList.remove('closing');

    background.classList.remove('closing');
    background.style.display = 'none';
  }, 520);
};

/**
 * Generates a unique input element id attribute value
 *
 * @param {string} name - The string that will be joined to a random number
 * @return {void} the new input element id
 */
export const generateUniqueId = name => {
  if (name === null || name === undefined || typeof name !== 'string') {
    console.error('generateUniqueId only accepts strings as arguments');
    return;
  }

  const randomNumber = Math.floor(Math.random() * 100) + 1;
  const id = [name, randomNumber].join('-');

  return getById(id) ? generateUniqueId(name) : id;
};
