import "../../../../model_helpers.js";

export function getTemplate(forEdit, clientData) { 
    
const template = `

    <section id="section-type-container" class="page client">

        <nav>
            <div id="nav-items">
                <div id="clients" class="nav-item">Clients</div>
                <div id="billing" class="nav-item">Billing</div>
                <div id="logout" class="nav-item">Logout</div>
            </div>
        </nav>

        <section>

            <div id="client" class="section-child">

                <div class="section-child__top">
                    <div>
                        <img src="assets/images/Logo.png" alt="">
                        <p class="section-child__top-title">BAWASA Automated Billing System</p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>

                <form class="section-child__center-client-client" id="client-form">

                    <p id="new-client-form-title">Client ${forEdit ? "Edit" : "Registration"} Form</p>

                    <div class="section-child__center-client-box">

                        <div class="section-child__center-client-box__section-group">

                            <div class="section-child__center-client-box__section-group__left">

                                <div class="section-child__center-client-box__section">

                                    <div class="section-child__center-client-box__section__input-box">

                                        <p>Full Name</p>

                                        <div class="section-child__center-client-builder__child__child">

                                                <div class="client-form-input-box">
                                                    <div class="client-form-input-box__title">
                                                        <label>First Name</label>
                                                        <ul class="client-form-input-box__title__errors" data-error-key="firstName" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        name="firstName"
                                                        value="${forEdit ? clientData?.firstName : ''}">

                                                </div>
                                                <div class="client-form-input-box">
                                                    <div class="client-form-input-box__title">
                                                        <label>Middle Name</label>
                                                        <ul class="client-form-input-box__title__errors" data-error-key="middleName" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        name="middleName"
                                                        value="${forEdit ? clientData?.middleName : ''}">

                                                </div>
                                                <div class="client-form-input-box">
                                                    <div class="client-form-input-box__title">
                                                        <label>Last Name</label>
                                                        <ul class="client-form-input-box__title__errors" data-error-key="lastName" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        name="lastName"
                                                        value="${forEdit ? clientData?.lastName : ''}">

                                                </div>
                                                <div class="client-form-input-box">
                                                    <div class="client-form-input-box__title">
                                                        <label>Extension</label>
                                                        <ul class="client-form-input-box__title__errors" data-error-key="extension" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        name="extension"
                                                        value="${forEdit ? clientData?.extension : ''}">

                                                </div>

                                        </div>

                                    </div>
                                    
                                </div>
                                
                                <div class="section-child__center-client-box__section">                            

                                    <div class="section-child__center-client-box__section__input-box no-title">

                                        <div class="section-child__center-client-builder__child__child">

                                            <div class="client-form-input-box">

                                                    <div class="client-form-input-box__title">
                                                        <label>Relationship Status</label>
                                                        <ul class="client-form-input-box__title__errors" data-error-key="relationshipStatus" >
                                                        </ul>
                                                    </div>

                                                <select 
                                                    class="input-style"
                                                    name="relationshipStatus" 
                                                    required>
                                                    <option disabled selected>Relationship Status</option>
                                                    ${Object.values(window.userRelationshipTypes).map(value =>
                                                        `<option value="${value}" ${value === clientData?.relationshipStatus ? " selected" : ""}>
                                                            ${value}
                                                        </option>`
                                                    )}                                                    
                                                </select>

                                            </div>

                                        </div>

                                    </div>
                                
                                </div>
                                
                                <div class="section-child__center-client-box__section">                            
                                    
                                    <div class="section-child__center-client-box__section__input-box no-title">

                                        <div class="section-child__center-client-builder__child__child">

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Birthdate</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="birthDate" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="date"
                                                    required name="birthDate"
                                                    value="${forEdit ? clientData?.birthDate : ''}">

                                            </div>

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Age</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="age" >
                                                    </ul>
                                                </div> 
                                            <input 
                                                    type="number"
                                                    required 
                                                    name="age" 
                                                    max="70" 
                                                    min="15"
                                                    value="${forEdit ? clientData?.age : ''}">

                                            </div>

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Email</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="email" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="email"
                                                    name="email" 
                                                    required 
                                                    maxLength="255" 
                                                    minlength="5"
                                                    value="${forEdit ? clientData?.email : ''}">

                                            </div>

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Occupation</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="occupation" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="occupation" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5"
                                                    value="${forEdit ? clientData?.occupation : ''}">

                                            </div>

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Meter Number</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="meterNumber" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    required 
                                                    name="meterNumber"
                                                    value="${forEdit ? clientData?.meterNumber : ''}">

                                            </div>

                                            <div class="client-form-input-box">
                                                <div class="client-form-input-box__title">
                                                    <label>Phone Number</label>
                                                    <ul class="client-form-input-box__title__errors" data-error-key="phoneNumber" >
                                                    </ul>
                                                </div>
                                                <div class="client-phone-container number">
                                                    <div class="country-code client">
                                                        +63
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        name="phoneNumber"
                                                        required
                                                        id="client-register-phone-number"
                                                        placeholder="12-345-6789"
                                                        value="${forEdit ? clientData?.Client_Phone_Numbers[0]?.phoneNumber : ''}"
                                                        maxlength="10">

                                                </div>

                                            </div>

                                        </div>

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

                        <div class="section-child__center-client-box__section">                            
                            
                            <div class="section-child__center-client-box__section__input-box">

                                <div class="section-child__center-client-box__section__input-box-title">
                                    <p>Present Address</p>
                                    <div>
                                        <input type="checkbox" id="mergePresentAndMainPrompt"> 
                                        <p>Main Address the same as Present Address</p>
                                    </div>
                                </div>

                                <div class="section-child__center-client-builder__child__child">

                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Street</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressStreet" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressStreet" 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.presentAddress?.street : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Subdivision</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressSubdivision" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressSubdivision" 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.presentAddress?.subdivision : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Barangay</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressBarangay" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressBarangay" 
                                                required 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.presentAddress?.barangay : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>City</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressCity" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressCity" 
                                                required 
                                                maxLength="100" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.presentAddress?.city : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Province</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressProvince" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressProvince" 
                                                required 
                                                maxLength="50" 
                                                minLength="10"
                                                value="${forEdit ? clientData?.presentAddress?.province : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Postal Code</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressPostalCode" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="number"
                                                name="presentAddressPostalCode" 
                                                required 
                                                maxLength="4" 
                                                minLength="4"
                                                value="${forEdit ? clientData?.presentAddress?.postalCode : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Details</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="presentAddressDetails" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="presentAddressDetails" 
                                                required 
                                                maxLength="255" 
                                                minLength="20"
                                                value="${forEdit ? clientData?.presentAddress?.details : ''}">

                                        </div>

                                </div>

                            </div>
                        
                        </div>

                        <div class="section-child__center-client-box__section">                            
                                
                            <div class="section-child__center-client-box__section__input-box">

                                <p>Main Address</p>

                                <div class="section-child__center-client-builder__child__child">

                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Street</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressStreet" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressStreet" 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.mainAddress?.street : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Subdivision</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressSubdivision" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressSubdivision" 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.mainAddress?.subdivision : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Barangay</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressBarangay" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressBarangay" 
                                                required 
                                                maxLength="50" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.mainAddress?.barangay : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>City</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressCity" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressCity" 
                                                required 
                                                maxLength="100" 
                                                minLength="5"
                                                value="${forEdit ? clientData?.mainAddress?.city : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Province</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressProvince" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressProvince" 
                                                required 
                                                maxLength="50" 
                                                minLength="10"
                                                value="${forEdit ? clientData?.mainAddress?.province : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Postal Code</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressPostalCode" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="number"
                                                name="mainAddressPostalCode" 
                                                required 
                                                maxLength="4" 
                                                minLength="4"
                                                value="${forEdit ? clientData?.mainAddress?.postalCode : ''}">

                                        </div>
                                        <div class="client-form-input-box">
                                            <div class="client-form-input-box__title">
                                                <label>Details</label>
                                                <ul class="client-form-input-box__title__errors" data-error-key="mainAddressDetails" >
                                                </ul>
                                            </div>
                                            <input 
                                                type="text"
                                                name="mainAddressDetails" 
                                                required 
                                                maxLength="255" 
                                                minLength="20"
                                                value="${forEdit ? clientData?.mainAddress?.details : ''}">

                                        </div>

                                </div>

                            </div>
                        
                        </div>

                        <div class="section-child__center-client-box__section last">                            
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

    return template
}