import { Field } from "./Field.js"

/**
 * Represents an input field that extends the base Field class.
 * This class is used to create HTML input fields with various attributes and options.
 * @extends Field
 * @constructor
 * @param {boolean} forEdit - Indicates whether the input field is for editing.
 * @param {object} validations - The validation rules to apply to the input field.
 * @param {object} props - Additional properties for configuring the input field.
 * @throws {Error} Throws an error if invalid properties are provided.
 * @example
 * new Input(true, { required: true, maxLength: 50 }, {
 *   attributes: {
 *     name: 'username',
 *     type: 'text',
 *     placeholder: 'Enter your username',
 *   },
 *   classes: ["input-type"],
 *   flags: ["required", "readonly"]
 * });
 */
class Input extends Field {
    /**
     * Creates an instance of Input.
     * @param {boolean} forEdit - Indicates if the input is for editing.
     * @param {object} validations - Object containing validation rules.
     * @param {object} props - Additional properties for the input.
     */
    constructor(forEdit, validations, props) {
        super(forEdit, validations, props)
    }

    /**
     * Converts the input to its string representation.
     * @returns {string} The rendered input as a string.
     */
    toString() {
        return this.render()
    }

    /**
     * Renders the input field.
     * @returns {string} The HTML representation of the input field.
     */
    renderField() {
        const { name } = this.attributes
        const inputAttributes = this.cleanAttributes(this.attributes)
        const inputClasses = this.cleanClasses(this.classes)

        return `
            ${
                this.classes.includes("number-input") ? ` 
                    <div class="input-style">
                        <div class="country-code">
                            +63
                        </div>
                        <input id="${this.dashedName}-field__input" name="${name}" class="form-field__input number-input ${inputClasses}" ${inputAttributes} ${this.flags}>
                    </div> `
                : `
                    <input id="${this.dashedName}-field__input" name="${name}" class="form-field__input ${inputClasses}" ${inputAttributes} ${this.flags}>
                `
            }
        `
    }

    /**
     * Cleans and formats the input classes.
     * @param {string[]} classes - An array of classes to clean and format.
     * @returns {string} The cleaned and formatted classes as a string.
     */
    cleanClasses(classes) {
        if (this.forEdit) classes.push("input-readonly")
        return classes.join(" ")
    }
}

export { Input }
