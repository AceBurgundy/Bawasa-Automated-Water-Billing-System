import { icons } from "../../../../assets/scripts/icons.js";

// components
import Select from "../../../../components/Select.js"
import Input from "../../../../components/Input.js"

import "../../../../utilities/constants.js"

export default function getTemplate(forEdit, user) { 
    
    const { 
        userRelationshipTypes,
        isValidPhoneNumber, 
        isBirthDate, 
        isOverThan,
        isEmail, 
        isEmpty, 
        notIn,
    } = window
    
    const longestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length

    const navigationObject = [
        { title: "Clients", icon: icons.usersIcon("users-icon") },
        { title: "Billing", icon: icons.billIcon("bill-icon") },
        { title: "Logout", icon: icons.powerIcon("power-icon") },
    ]

    return `

    <section id="section-type-container" class="page user">

        <nav>
            <div id="nav-items">
                ${
                    navigationObject.map(navigation => {
                        return `
                            <div id="${ navigation.title.toLowerCase() }" class="nav-item">
                                <div>${ navigation.icon }</div>
                                <p>${ navigation.title }</p>
                            </div>
                        `        
                    }).join("\n")
                }
            </div>
            <div id="profile" class="nav-item active">
                <div>${ icons.userIcon("user-icon") }</div>
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
                                                                    value: `${ user.firstName || "N/A" }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Middle Name",
                                                                    name: "middleName",
                                                                    value: `${ user.middleName || "N/A" }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Last Name",
                                                                    name: "lastName",
                                                                    value: `${ user.lastName || "N/A" }`
                                                                }
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                flags: ["required"],
                                                                classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                                attributes: {
                                                                    label: "Extension",
                                                                    name: "extension",
                                                                    value: `${ user.extension || "N/A" }`
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
                                                                value: `${ user.birthDate || "N/A" }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, [isOverThan, 15, 70]], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "age",
                                                                type: "number",
                                                                label: "Age",
                                                                value: `${ user.age || "N/A" }`
                                                            }
                                                        }),
                            
                                                        new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "email",
                                                                type: "email",
                                                                label: "Email",
                                                                value: `${ user.email || "N/A" }`,
                                                                minLength: 5
                                                            }
                                                        }),

                                                        new Input([], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                            attributes: {
                                                                name: "meterNumber",
                                                                label: "Meter Number",
                                                                value: `${ user.meterNumber || "N/A" }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, isValidPhoneNumber], {
                                                            flags: ["required"],
                                                            classes: [`${ forEdit ? '' : "input-readonly" }`, "number-input"],
                                                            attributes: {
                                                                name: "phoneNumber",
                                                                type: "number",
                                                                label: "Phone Number",
                                                                value: `${ user.phoneNumbers[0] ? user.phoneNumbers[0].phoneNumber : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.street : "N/A" }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                        attributes: {
                                                            name: "presentAddressSubdivision",
                                                            label: "Subdivision",
                                                            value: `${ user.presentAddress ? user.presentAddress.subdivision : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.barangay : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.city : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.province : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.postalCode : "N/A" }`,
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
                                                            value: `${ user.presentAddress ? user.presentAddress.details : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.street : "N/A" }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    classes: [`${ forEdit ? '' : "input-readonly" }`],
                                                    attributes: {
                                                        name: "mainAddressSubdivision",
                                                        label: "Subdivision",
                                                        value: `${ user.mainAddress ? user.mainAddress.subdivision : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.barangay : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.city : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.province : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.postalCode : "N/A" }`,
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
                                                        value: `${ user.mainAddress ? user.mainAddress.details : "N/A" }`,
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