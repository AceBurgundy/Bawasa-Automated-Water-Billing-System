import { getSampleForm } from "../main/random-form-filler.js";

// components
import Select from "../../../../components/Select.js";
import Input from "../../../../components/Input.js";

// icons
import { icons } from "../../../../assets/scripts/icons.js";

// constants
import "../../../../utilities/constants.js";

export default function getTemplate(forEdit, clientData) { 
    
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

    const formSample = getSampleForm()

    const navigationObject = [
        { title: "Clients", icon: icons.usersIcon("users-icon") },
        { title: "Billing", icon: icons.billIcon("bill-icon") },
        { title: "Logout", icon: icons.powerIcon("power-icon") },
    ]

    return `

    <section id="section-type-container" class="page client">

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
            <div id="profile" class="nav-item">
                <div>${ icons.userIcon("user-icon") }</div>
                <p>Profile</p>
            </div>
        </nav>

        <section>

            <div id="client" class="content">

                <div class="content__top">
                    <div>
                        <img src="assets/images/Logo.png" alt="">
                        <p class="content__top-title">BAWASA Automated Billing System</p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>

                <form class="content__form content__center" id="client-form">

                    <p id="new-client-form-title">Client ${forEdit ? "Edit" : "Registration"} Form</p>

                        <div class="content__form-box">

                            <div class="content__form-box__group">

                                <div class="content__form-box__group__left">

                                        <div class="content__form-box__input-box">

                                            <p>Full Name</p>

                                            <div class="content__form-box__input-box__inputs first-group">

                                                    ${
                                                        [

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                attributes: {
                                                                    label: "First Name",
                                                                    name: "firstName",
                                                                    value: `${forEdit ? clientData?.firstName : formSample.firstName }`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                attributes: {
                                                                    label: "Middle Name",
                                                                    name: "middleName",
                                                                    value: `${forEdit ? clientData?.middleName : formSample.middleName }`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                attributes: {
                                                                    label: "Last Name",
                                                                    name: "lastName",
                                                                    value: `${forEdit ? clientData?.lastName : formSample.lastName }`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input([isEmpty, [isOverThan, 2, 255]], {
                                                                attributes: {
                                                                    label: "Extension",
                                                                    name: "extension",
                                                                    value: `${forEdit ? clientData?.extension : formSample.extension }`
                                                                },
                                                                flags: ["required"]
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
                                                        attributes: {
                                                            label: "Relationship Status",
                                                            name: "relationshipStatus",
                                                            selected: forEdit ? clientData?.relationshipStatus : formSample.relationshipStatus,
                                                        },
                                                        classes: ["input-style"],
                                                        flags: ["Required"]
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
                                                            attributes: {
                                                                name: "birthDate",
                                                                type: "date",
                                                                label: "BirthDate",
                                                                value: `${forEdit ? clientData?.birthDate : formSample.birthDate }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, [isOverThan, 15, 70]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "age",
                                                                type: "number",
                                                                label: "Age",
                                                                value: `${forEdit ? clientData?.age : formSample.age }`
                                                            }
                                                        }),
                            
                                                        new Input([isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "email",
                                                                type: "email",
                                                                label: "Email",
                                                                value: `${forEdit ? clientData?.email : formSample.email }`,
                                                                minLength: 5
                                                            }
                                                        }),

                                                        new Input([isEmpty, [isOverThan, 2, 255]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "occupation",
                                                                label: "Occupation",
                                                                value: `${forEdit ? clientData?.occupation : formSample.occupation }`,
                                                                minLength: 2,
                                                                maxLength: 100
                                                            }
                                                        }),

                                                        new Input([], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "meterNumber",
                                                                label: "Meter Number",
                                                                value: `${forEdit ? clientData?.meterNumber : formSample.meterNumber }`
                                                            }
                                                        }),

                                                        new Input([isEmpty, isValidPhoneNumber], {
                                                            flags: ["required"],
                                                            classes: ["number-input"],
                                                            attributes: {
                                                                name: "phoneNumber",
                                                                type: "number",
                                                                label: "Phone Number",
                                                                value: `${forEdit ? clientData?.phoneNumbers[0]?.phoneNumber : formSample.phoneNumber }`,
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
                                            <input type="checkbox" id="mergePresentAndMainPrompt"> 
                                            <p>Main Address the same as Present Address</p>
                                        </div>
                                    </div>

                                    <div class="content__form-box__input-box__inputs">

                                            ${
                                                
                                                [

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        attributes: {
                                                            name: "presentAddressStreet",
                                                            label: "Street",
                                                            value: `${forEdit ? clientData?.presentAddress?.street : formSample.presentAddressStreet }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        attributes: {
                                                            name: "presentAddressSubdivision",
                                                            label: "Subdivision",
                                                            value: `${forEdit ? clientData?.presentAddress?.subdivision : formSample.presentAddressSubdivision }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressBarangay",
                                                            label: "Barangay",
                                                            value: `${forEdit ? clientData?.presentAddress?.barangay : formSample.presentAddressBarangay }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressCity",
                                                            label: "City",
                                                            value: `${forEdit ? clientData?.presentAddress?.city : formSample.presentAddressCity }`,
                                                            maxLength: 255, 
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressProvince",
                                                            label: "Province",
                                                            value: `${forEdit ? clientData?.presentAddress?.province : formSample.presentAddressProvince }`,
                                                            maxLength: 255, 
                                                            minLength: 10
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 4, 9999]], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressPostalCode",
                                                            label: "Postal Code",
                                                            type: "number",
                                                            value: `${forEdit ? clientData?.presentAddress?.postalCode : formSample.postalCode }`,
                                                            maxlength: 4,
                                                            minLength: 4
                                                        }
                                                    }),

                                                    new Input([isEmpty, [isOverThan, 5, 255]], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressDetails",
                                                            label: "Details",
                                                            value: `${forEdit ? clientData?.presentAddress?.details : formSample.details }`,
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
                                                    attributes: {
                                                        name: "mainAddressStreet",
                                                        label: "Street",
                                                        value: `${forEdit ? clientData?.mainAddress?.street :  formSample.mainAddressStreet }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    attributes: {
                                                        name: "mainAddressSubdivision",
                                                        label: "Subdivision",
                                                        value: `${forEdit ? clientData?.mainAddress?.subdivision :  formSample.mainAddressSubdivision }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressBarangay",
                                                        label: "Barangay",
                                                        value: `${forEdit ? clientData?.mainAddress?.barangay : formSample.mainAddressBarangay }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressCity",
                                                        label: "City",
                                                        value: `${forEdit ? clientData?.mainAddress?.city : formSample.mainAddressCity }`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressProvince",
                                                        label: "Province",
                                                        value: `${forEdit ? clientData?.mainAddress?.province : formSample.mainAddressProvince }`,
                                                        maxlength: 50,
                                                        minLength: 10
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 4, 9999]], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressPostalCode",
                                                        label: "Postal Code",
                                                        type: "number",
                                                        value: `${forEdit ? clientData?.mainAddress?.postalCode : formSample.postalCode }`,
                                                        maxlength: 4,
                                                        minLength: 4
                                                    }
                                                }),

                                                new Input([isEmpty, [isOverThan, 5, 255]], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressDetails",
                                                        label: "Details",
                                                        value: `${forEdit ? clientData?.mainAddress?.details : formSample.details }`,
                                                        maxLength: 255, 
                                                        minLength: 20
                                                    }
                                                }),

                                            ].join("\n")

                                        }

                                    </div>

                                </div>
                            
                                <div class="content__form-box__input-box files">
                                </div>
                        
                            <div class="content__form-box__input last">                            
                                <button class="button-primary" id="client-register-submit-button">
                                    ${forEdit ? clientData && "Edit" : 'Create' }
                                </button>
                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </section>

    </section>`;

}