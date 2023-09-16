
import { Select } from "../../../assets/scripts/classes/Select.js";
import { Input } from "../../../assets/scripts/classes/Input.js";
import "../../../utilities/constants.js";

export function getTemplate(forEdit, clientData) { 
    
    const longestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => b.length > a.length ? b : a).length
    const shortestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => b.length < a.length ? b : a).length

    return `

    <section id="section-type-container" class="page client">

        <nav>
            <div id="nav-items">
                <div id="clients" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="users-icon"><rect width="256" height="256" fill="none"></rect><circle cx="88" cy="108" r="52" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M155.41251 57.937A52.00595 52.00595 0 1 1 169.52209 160M15.99613 197.39669a88.01736 88.01736 0 0 1 144.00452-.00549M169.52209 160a87.89491 87.89491 0 0 1 72.00032 37.3912"></path></svg>
                    </div>
                    <p>Clients</p>
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
            <div id="profile" class="nav-item">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="user-icon"><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="96" r="64" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002"></path></svg>
                </div>
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

                                                            new Input(false, [], {
                                                                attributes: {
                                                                    label: "First Name",
                                                                    name: "firstName",
                                                                    value: `${forEdit ? clientData?.firstName : 'Sam'}`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input(false, [], {
                                                                attributes: {
                                                                    label: "Middle Name",
                                                                    name: "middleName",
                                                                    value: `${forEdit ? clientData?.middleName : 'Adrian'}`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input(false, [], {
                                                                attributes: {
                                                                    label: "Last Name",
                                                                    name: "lastName",
                                                                    value: `${forEdit ? clientData?.lastName : 'Panganoron'}`
                                                                },
                                                                flags: ["required"]
                                                            }),

                                                            new Input(false, [], {
                                                                attributes: {
                                                                    label: "Extension",
                                                                    name: "extension",
                                                                    value: `${forEdit ? clientData?.extension : 'Sabalo'}`
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
                                                    new Select(false, [
                                                        isEmpty,
                                                        [isOverThan, shortestRelationshipOption, longestRelationshipOption],
                                                        [notIn, [...Object.keys(window.userRelationshipTypes)]]
                                                    ], {
                                                        options: window.userRelationshipTypes,
                                                        attributes: {
                                                            label: "Relationship Status",
                                                            name: "relationshipStatus",
                                                            selected: clientData?.relationshipStatus,
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

                                                        new Input(false, [isEmpty, isBirthDate], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "birthDate",
                                                                type: "date",
                                                                label: "BirthDate",
                                                                value: `${forEdit ? clientData?.birthDate : ''}`
                                                            }
                                                        }),

                                                        new Input(false, [isEmpty, [isOverThan, 15, 70]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "age",
                                                                type: "number",
                                                                label: "Age",
                                                                value: `${forEdit ? clientData?.birthDate : ''}`
                                                            }
                                                        }),
                            
                                                        new Input(false, [isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "email",
                                                                type: "email",
                                                                label: "Email",
                                                                value: "sabalo99@gmail.com",
                                                                minLength: 5
                                                            }
                                                        }),

                                                        new Input(false, [isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "occupation",
                                                                label: "Occupation",
                                                                value: `${forEdit ? clientData?.occupation : 'Software Engineer'}`,
                                                                minLength: 5,
                                                                maxLength: 100
                                                            }
                                                        }),

                                                        new Input(false, [isEmpty, isEmail, [isOverThan, 10, 255]], {
                                                            flags: ["required"],
                                                            attributes: {
                                                                name: "meterNumber",
                                                                label: "Meter Number",
                                                                value: `${forEdit ? clientData?.meterNumber : 'dsgds3125'}`
                                                            }
                                                        }),

                                                        new Input(false, [], {
                                                            flags: ["required"],
                                                            classes: ["number-input"],
                                                            attributes: {
                                                                name: "phoneNumber",
                                                                type: "number",
                                                                label: "Phone Number",
                                                                value: `${forEdit ? clientData?.phoneNumbers[0]?.phoneNumber : '9965739119'}`,
                                                                maxlength: "10"
                                                            }
                                                        }),

                                                    ].join("\n")
                                                }

                                            </div>

                                        </div>
                                        
                                    
                                </div>

                                <div id="client-form-image-box">
                                    <video id="client-form-video" autoplay playsinline></video>
                                    <canvas id="client-form-image-template"></canvas>
                                
                                    <div id="client-form-image-box-options">
                                        <input type="file" accept="image/*" id="client-form-image">
                                        <button id="client-form-image-capture" class="button-primary take-image">
                                            Take Image
                                        </button>
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

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressStreet",
                                                            label: "Street",
                                                            value: `${forEdit ? clientData?.presentAddress?.street : 'Yumang'}`,
                                                            maxlength: 50,
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressSubdivision",
                                                            label: "Subdivision",
                                                            value: `${forEdit ? clientData?.presentAddress?.subdivision : 'Pineda'}`,
                                                            maxlength: 50,
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressBarangay",
                                                            label: "Barangay",
                                                            value: `${forEdit ? clientData?.presentAddress?.barangay : 'City Heights'}`,
                                                            maxlength: 50,
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressCity",
                                                            label: "City",
                                                            value: `${forEdit ? clientData?.presentAddress?.city : 'General Santos City'}`,
                                                            maxlength: 50,
                                                            minLength: 5
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressProvince",
                                                            label: "Province",
                                                            value: `${forEdit ? clientData?.presentAddress?.province : 'South Cotabato'}`,
                                                            maxlength: 50,
                                                            minLength: 10
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressPostalCode",
                                                            label: "Postal Code",
                                                            type: "number",
                                                            value: `${forEdit ? clientData?.presentAddress?.postalCode : 9500}`,
                                                            maxlength: 4,
                                                            minLength: 4
                                                        }
                                                    }),

                                                    new Input(false, [], {
                                                        flags: ["required"],
                                                        attributes: {
                                                            name: "presentAddressDetails",
                                                            label: "Details",
                                                            value: `${forEdit ? clientData?.presentAddress?.details : "Black gate, ladder style"}`,
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

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressStreet",
                                                        label: "Street",
                                                        value: `${forEdit ? clientData?.mainAddress?.street : 'Yumang'}`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressSubdivision",
                                                        label: "Subdivision",
                                                        value: `${forEdit ? clientData?.mainAddress?.subdivision : 'Pineda'}`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressBarangay",
                                                        label: "Barangay",
                                                        value: `${forEdit ? clientData?.mainAddress?.barangay : 'City Heights'}`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressCity",
                                                        label: "City",
                                                        value: `${forEdit ? clientData?.mainAddress?.city : 'General Santos City'}`,
                                                        maxlength: 50,
                                                        minLength: 5
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressProvince",
                                                        label: "Province",
                                                        value: `${forEdit ? clientData?.mainAddress?.province : 'South Cotabato'}`,
                                                        maxlength: 50,
                                                        minLength: 10
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressPostalCode",
                                                        label: "Postal Code",
                                                        type: "number",
                                                        value: `${forEdit ? clientData?.mainAddress?.postalCode : 9500}`,
                                                        maxlength: 4,
                                                        minLength: 4
                                                    }
                                                }),

                                                new Input(false, [], {
                                                    flags: ["required"],
                                                    attributes: {
                                                        name: "mainAddressDetails",
                                                        label: "Details",
                                                        value: `${forEdit ? clientData?.mainAddress?.details : "Black gate, ladder style"}`,
                                                        maxLength: 255, 
                                                        minLength: 20
                                                    }
                                                }),

                                            ].join("\n")

                                        }

                                    </div>

                                </div>
                            

                                <div class="content__form-box__input-box__inputs">

                                    <div class="client-form-input-box__title">
                                        <label>Client Documents</label>
                                        <ul class="client-form-input-box__title__errors" data-error-key="clientFiles" >
                                        </ul>
                                    </div>
                                    <label for="client-files-input" class="client-form-files__box">
                                        <input 
                                            type="file" 
                                            id="client-files-input"
                                            hidden
                                            name="clientFiles"
                                            multiple>
                                            
                                        <div id="client-form-files-box-message">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="upload"><path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V13a1,1,0,0,0-2,0v6a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12Z"></path></svg>
                                            <p>Drag and drop or click here to upload documents</p>
                                            <p>Upload any files from desktop</p>
                                        </div>
                                    </label>

                                </div>
                        
                            <div class="content__form-box__ last">                            
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