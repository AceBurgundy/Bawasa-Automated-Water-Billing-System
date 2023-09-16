import { Field } from "./Field.js"

/**
 * Represents a Select field that extends the base Field class.
 * This class is used to create HTML select input fields with various options.
 * @extends Field
 * @constructor
 * @param {boolean} forEdit - Indicates whether the field is for editing.
 * @param {object} validations - The validations to apply to the field.
 * @param {object} props - The properties of the Select field.
 * @throws {Error} Throws an error if invalid properties are provided.
 * 
 * @example
 * new Select(false, {}, {
 *   attributes: {
 *     name: 'mySelect',
 *     placeholder: 'Choose an option',
 *   },
 *   options: {
 *     option1: 'Option 1',
 *     option2: 'Option 2',
 *   },
 *   classes: ["input-type"],
 *   flags: ["required", "readonly"]
 * })
 */
class Select extends Field {

    /**
     * Create a Select field.
     * @param {boolean} forEdit - Indicates if the field is for editing.
     * @param {object} validations - The validations to apply.
     * @param {object} props - The field's properties.
     */
    constructor(forEdit, validations, props) {
        super(forEdit, validations, props)
    }

    /**
     * Get a string representation of the Select field.
     * @returns {string} The rendered HTML.
     */
    toString() {
        return this.render()
    }

    /**
     * Render the Select field.
     * @returns {string} The rendered HTML.
     */
    renderField() {
        /**
         * Evaluation result object.
         * @typedef {Object} EvaluationResult
         * @property {boolean} evalStatus - The evaluation status.
         * @property {string} evalMessage - The evaluation message.
         */
        const { evalStatus, evalMessage } = this.evaluateProps()
        if (evalStatus === false) return evalMessage

        const { name, placeholder } = this.attributes

        const { options } = this.props

        const selectAttributes = this.cleanAttributes(this.attributes)
        const selectClasses = this.cleanClasses(this.classes)

        return `
            <select id="${this.dashedName}-field__input" name="${name}" class="input-style form-field__input ${selectClasses}" ${selectAttributes} ${this.flags}>
            <option disabled selected>
                    ${ placeholder !== undefined ? placeholder : "Select" }
                </option>
                ${ this.renderOptions(options) }
            </select>
        `
    }

    /**
     * Evaluate the field's properties.
     * @returns {EvaluationResult} The evaluation result.
     */
    evaluateProps() {

        /**
         * Error message.
         * @param {string} error - The error message.
         * @returns {EvaluationResult} The evaluation result with an error message.
         */
        const error = error => {
            console.error(error)
            return { evalStatus: false, evalMessage: error }
        }

        if (this.props.hasOwnProperty("id"))
            return error(`id is not required as name stands as id`)

        for (let data of ["flags", "attributes", "options"]) {
            if (
                data !== "attributes" &&
                data !== "options" &&
                !Array.isArray(this.props[data])
            ) {
                return error(`${data} must be an array`)
            }

            if (
                (data === "attributes" || data === "options") &&
                typeof this.props[data] !== "object"
            ) {
                return error(`${data} must be key value pairs`)
            }

            if (!this.props.hasOwnProperty(data)) {
                return error(`Missing ${data} for select attribute`)
            }
        }

        return { evalStatus: true, evalMessage: "" }
    }

    /**
     * Render the Select field's options.
     * @param {object} options - The field's options.
     * @returns {string} The rendered options HTML.
     */
    renderOptions(options) {
        return Object.entries(options)
            .map(([key, value]) => {
                return this.attributes.selected &&
                    this.attributes.selected === value
                    ? `<option value="${key}" selected>${value}</option>`
                    : `<option value="${key}">${value}</option>`
            })
            .join("\n")
    }

    /**
     * Clean the class names.
     * @param {string[]} classes - The class names.
     * @returns {string} The cleaned class names.
     */
    cleanClasses(classes) {
        if (this.forEdit) classes.push("input-readonly")
        return classes.join(" ")
    }

}

export { Select }