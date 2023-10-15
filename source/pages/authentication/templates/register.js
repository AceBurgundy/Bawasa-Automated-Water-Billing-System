export const registerTemplate = () => {

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
                                    value: "James",
                                    placeholder: "First Name",
                                    maxlength: "255"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "middleName",
                                    placeholder: "Middle Name",
                                    value: "Panganoron",
                                    maxlength: "255",    
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "lastName",
                                    placeholder: "Last Name",
                                    value: "Sabalo",
                                    maxlength: "255",    
                                }
                            }),

                            new Input([isEmpty, isBirthDate], {
                                flags: ["required"],
                                attributes: {
                                    name: "birthDate",
                                    type: "date",
                                    placeholder: "BirthDate",
                                    value: "2001-08-20"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 15, 70]], {
                                flags: ["required"],
                                attributes: {
                                    name: "age",
                                    type: "number",
                                    placeholder: "Age",
                                    value: "18"
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
                                    value: "samadriansabalo99@gmail.com"
                                }
                            }),

                            new Input([isEmpty, [isOverThan, 10, 255]], {
                                flags: ["required"],
                                attributes: {
                                    name: "password",
                                    type: "password",
                                    placeholder: "Password",
                                    value: "Adrian2001."
                                }
                            }),

                        ].join("\n")

                    }

                </div>
            </div>
                
            <div id="register-form-bottom" class="authentication-form__bottom">
                <p class="authentication-form__bottom__tag">Register</p>
                <button id="register-button" class="authentication-form__submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="20" id="arrow"><path fill-rule="evenodd" d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413"></path></svg>
                </button>    
            </div>

        </form>

        <p id="to-login-prompt" class="bottom-prompt">
            Already Have an Account? Login instead
        </p>
    `
}