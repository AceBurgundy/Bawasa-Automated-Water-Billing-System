
import Select from "../../../components/Select.js"
import Input from "../../../components/Input.js"
import { showData } from "../../../assets/scripts/helper.js"
import "../../../utilities/constants.js"

export function getTemplate(forEdit, user) { 
    
    const { 
        isBirthDate, 
        isEmail, 
        isEmpty, 
        isValidPhoneNumber, 
        notIn,
        isOverThan,
        userRelationshipTypes
    } = window
    
    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length

    return `

    <section id="section-type-container" class="page user">

        <nav>
            <div id="nav-items">
                <div id="CLIENTs" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="users-icon"><rect width="256" height="256" fill="none"></rect><circle cx="88" cy="108" r="52" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M155.41251 57.937A52.00595 52.00595 0 1 1 169.52209 160M15.99613 197.39669a88.01736 88.01736 0 0 1 144.00452-.00549M169.52209 160a87.89491 87.89491 0 0 1 72.00032 37.3912"></path></svg>
                    </div>
                    <p>CLIENTs</p>
                </div>
                <div id="billing" class="nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="bill-icon">
                        <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m25 29-1.59-.8a6 6 0 0 0-4.91-.2L16 29l-2.5-1a6 6 0 0 0-4.91.2L7 29V3h18ZM11 7h8M11 11h6M11 15h10"></path>
                    </svg>
                    <p>Billing</p>
                </div>
                <div id="logout" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="power-icon"><rect width="256" height="256" fill="none"></rect><line x1="127.992" x2="127.992" y1="48.003" y2="124.003" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M176.00189,54.23268a88,88,0,1,1-96.00346-.00021"></path></svg>
                    </div>
                    <p>Logout</p>
                </div>
            </div>
            <div id="profile" class="nav-item active">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="user-icon"><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="96" r="64" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002"></path></svg>
                </div>
                <p>Profile</p>
            </div>
        </nav>

        <section>

            <div id="user" class="content">

                <div class="content__top">
                    <div>
                        <img src="assets/images/Logo.png" alt="">
                        <p class="content__top-title">BAWASA Automated Billing System</p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>

                <form class="content__form content__center" id="user-form">

                    <p id="user-form-title">Admin ${forEdit ? "Edit Form" : user.fullName }</p>

                        <div class="content__form-box">

                            <div class="content__form-box__group">

                                <div class="content__form-box__group__left">

                                        <div class="content__form-box__input-box">

                                            <p>Full Name</p>

                                            <div class="content__form-box__input-box__inputs first-group">

                                                    ${
                                                        [

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "First Name",
                                                                    name: "firstName",
                                                                    value: `${ showData(user?.firstName, "N/A") }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Middle Name",
                                                                    name: "middleName",
                                                                    value: `${ showData(user?.middleName, "N/A") }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Last Name",
                                                                    name: "lastName",
                                                                    value: `${ showData(user?.lastName, "N/A") }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Extension",
                                                                    name: "extension",
                                                                    value: `${ showData(user?.extension, "N/A") }`
                                                                }
                                                            })

                                                        ].join("\n")

                                                    }

                                            </div>

                                        </div>
                                        
                                    
                                        <div class="content__form-box__input-box no-title">

                                            <div class="content__form-box__input-box__inputs">

                                                ${
                                                    new Select([
                                                        isEmpty,
                                                        [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                                                        [notIn, [...Object.keys(userRelationshipTypes)]]
                                                    ], {
                                                        options: userRelationshipTypes,
                                                        flags: ["Required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            label: "Relationship Status",
                                                            name: "relationshipStatus",
                                                            selected:  user?.relationshipStatus,
                                                        },
                                                    })
                                                }

                                            </div>

                                        </div>
                                    
                                                                        
                                        <div class="content__form-box__input-box no-title">

                                            <div class="content__form-box__input-box__inputs">

                                                ${
                                                    
                                                    [

                                                        new Input([isEmpty, isBirthDate], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "birthDate",
                                                                type: "date",
                                                                label: "BirthDate",
                                                                value: `${ showData(user?.birthDate, "N/A") }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, [isOverThan, 15, 70]], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "age",
                                                                type: "number",
                                                                label: "Age",
                                                                value: `${ showData(user?.age, "N/A") }`
                                                            }
                                                        }),
                            
                                                        new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "email",
                                                                type: "email",
                                                                label: "Email",
                                                                value: `${ showData(user?.email, "N/A") }`,
                                                                minLength: 5
                                                            }
                                                        }),

                                                        new Input([], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "meterNumber",
                                                                label: "Meter Number",
                                                                value: `${ showData(user?.meterNumber, "N/A") }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, isValidPhoneNumber], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`, "number-input"],
                                                            attributes: {
                                                                name: "phoneNumber",
                                                                type: "number",
                                                                label: "Phone Number",
                                                                value: `${ showData(user?.phoneNumbers[0]?.phoneNumber, "N/A") }`,
                                                                maxlength: "10"
                                                            }
                                                        }),

                                                    ].join("\n")
                                                }

                                            </div>

                                        </div>
                                              
                                </div>

                            </div>
                                
                                <div class="content__form-box__input-box">

                                    <div id="duplicate-addresses-box">
                                        <p>Present Address</p>
                                        <div>
                                            <input type="checkbox" id="merge-addresses-checkbox"> 
                                            <p>Main Address the same as Present Address</p>
                                        </div>
                                    </div>

                                    <div class="content__form-box__input-box__inputs">

                                            ${
                                                
                                                [

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressStreet",
                                                            label: "Street",
                                                            value: `${ showData(user?.presentAddress?.street, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressSubdivision",
                                                            label: "Subdivision",
                                                            value: `${ showData(user?.presentAddress?.subdivision, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressBarangay",
                                                            label: "Barangay",
                                                            value: `${ showData(user?.presentAddress?.barangay, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressCity",
                                                            label: "City",
                                                            value: `${ showData(user?.presentAddress?.city, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressProvince",
                                                            label: "Province",
                                                            value: `${ showData(user?.presentAddress?.province, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 10
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 4, 9999]], {
                                                        flags: ["required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressPostalCode",
                                                            label: "Postal Code",
                                                            type: "number",
                                                            value: `${ showData(user?.presentAddress?.postalCode, "N/A") }`,
                                                            maxlength: 4,
                                                            minLength: 4
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressDetails",
                                                            label: "Details",
                                                            value: `${ showData(user?.presentAddress?.details, "N/A") }`,
                                                            maxLength: 255, 
                                                            minLength: 20
                                                        }
                                                    }),

                                                ].join("\n")

                                            }

                                    </div>

                                </div>
                                                                
                                <div class="content__form-box__input-box">

                                    <p>Main Address</p>

                                    <div class="content__form-box__input-box__inputs">

                                        ${
                                                    
                                            [

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressStreet",
                                                        label: "Street",
                                                        value: `${ showData(user?.mainAddress?.street, "N/A") }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressSubdivision",
                                                        label: "Subdivision",
                                                        value: `${ showData(user?.mainAddress?.subdivision, "N/A") }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressBarangay",
                                                        label: "Barangay",
                                                        value: `${ showData(user?.mainAddress?.barangay, "N/A") }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressCity",
                                                        label: "City",
                                                        value: `${ showData(user?.mainAddress?.city, "N/A") }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressProvince",
                                                        label: "Province",
                                                        value: `${ showData(user?.mainAddress?.province, "N/A") }`,
                                                        maxlength: 50,
                                                        minLength: 10
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 4, 9999]], {
                                                    flags: ["required"],
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressPostalCode",
                                                        label: "Postal Code",
                                                        type: "number",
                                                        value: `${ showData(user?.mainAddress?.postalCode, "N/A") }`,
                                                        maxlength: 4,
                                                        minLength: 4
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressDetails",
                                                        label: "Details",
                                                        value: `${ showData(user?.mainAddress?.details, "N/A") }`,
                                                        maxLength: 255, 
                                                        minLength: 20
                                                    }
                                                }),

                                            ].join("\n")

                                        }

                                    </div>

                                </div>
                        
                            <div class="content__form-box__input last">                            
                                <button class="button-primary" id="user-register-submit-button">
                                    ${forEdit ? "Save" : "Edit" }
                                </button>
                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </section>

    </section>`;

}