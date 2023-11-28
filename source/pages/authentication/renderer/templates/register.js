// icons
import { icons } from "../../../assets/scripts/icons.js"

// components
import Select from "../../../components/Select.js"
import Input from "../../../components/Input.js"

/**
 * 
 * @function registerTemplate
 * @returns {string} HTML string template of the register section 
 */
export default function () {

    const { 
        isBirthDate, 
        isEmail, 
        isEmpty, 
        isValidPhoneNumber, 
        notIn,
        userRelationshipTypes
    } = window
    
    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length

    return `
    
    <div id="register" class="page">
    
        <form data-action="" id="register-form" class="authentication-form">
        
            <p id="register-form-title" class="authentication-form__title">Create new account</p>
        
            <div class="authentication-form__inputs">

                <div class="authentication-form__inputs-child">

                    ${
                        [
                            
                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "firstName",
                                    value: "Juan",
                                    placeholder: "First Name",
                                    maxlength: "255"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "middleName",
                                    placeholder: "Middle Name",
                                    value: "Quezon",
                                    maxlength: "255",    
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "lastName",
                                    placeholder: "Last Name",
                                    value: "Dela Cruz",
                                    maxlength: "255",    
                                }
                            }),

                            new Input([isEmpty, isBirthDate], {
                                flags: ["required"],
                                attributes: {
                                    name: "birthDate",
                                    type: "date",
                                    placeholder: "BirthDate",
                                    value: "1995-05-10"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 15, 70]], {
                                flags: ["required"],
                                attributes: {
                                    name: "age",
                                    type: "number",
                                    placeholder: "Age",
                                    value: "28"
                                }
                            })

                        ].join("\n")
                    }

                </div>

                <div class="authentication-form__inputs-child">
                    
                    ${

                        [

                            new Select([
                                isEmpty,
                                [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                                [notIn, [...Object.keys(window.userRelationshipTypes)]]
                            ], {
                                options: window.userRelationshipTypes,
                                attributes: {
                                    name: "relationshipStatus",
                                    selected: "Single",
                                },
                                flags: ["required"]
                            }),

                            new Input([isValidPhoneNumber], {
                                flags: ["required"],
                                classes: ["number-input"],
                                attributes: {
                                    name: "phoneNumber",
                                    type: "number",
                                    placeholder: "Phone Number",
                                    value: "9965739119",
                                    maxlength: "10"
                                }
                            }),

                            new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "email",
                                    type: "email",
                                    placeholder: "Email",
                                    value: "JuanDelaCruz@gmail.com"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 10, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "password",
                                    type: "password",
                                    placeholder: "Password",
                                    value: "JuanDelaCruz1234."
                                }
                            }),

                        ].join("\n")

                    }

                </div>
            </div>
                
            <div id="register-form-bottom" class="authentication-form__bottom">
                <p class="authentication-form__bottom__tag">Register</p>
                <button id="register-button" class="authentication-form__submit">
                    ${
                        icons.arrowIcon("arrow")
                    }
                </button>    
            </div>

        </form>

        <p id="to-login-prompt" class="bottom-prompt">
            Already Have an Account? Login instead
        </p>
    `
}