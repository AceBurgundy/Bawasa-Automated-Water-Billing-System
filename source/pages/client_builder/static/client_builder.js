import { makeToastNotification, transition } from "../../../helper.js";
import { renderBillingSection } from "../../billing/static/billing.js";
import { renderClientSection } from "../../clients/static/clients.js";
import Webcam from "../../../assets/scripts/Webcam.js";
import "../../../../model_helpers.js";

export async function renderClientBuilder() {

	const template = `

        <section id="section-type-container" class="page client-builder">

            <nav>
                <div id="nav-items">
                    <div id="clients" class="nav-item">Clients</div>
                    <div id="billing" class="nav-item">Billing</div>
                    <div id="logout" class="nav-item">Logout</div>
                </div>
            </nav>

            <section>

                <div id="client-builder" class="section-child">

                    <div class="section-child__top">
                        <div>
                            <img src="assets/images/Logo.png" alt="">
                            <p class="section-child__top-title">BAWASA Automated Billing System</p>
                        </div>
                        <img src="assets/images/Logo.png" alt="">
                    </div>

                    <form class="section-child__center-client-builder-client-builder" id="client-registration-form">

                        <p id="new-client-form-title">Client Registration Form</p>

                        <div class="section-child__center-client-builder-box">

                            <div class="section-child__center-client-builder-box__section-group">

                                <div class="section-child__center-client-builder-box__section-group__left">

                                    <div class="section-child__center-client-builder-box__section">

                                        <div class="section-child__center-client-builder-box__section__input-box">

                                            <p>Full Name</p>

                                            <div class="section-child__center-client-builder__child__child">

                                                    <div class="registration-input-box">
                                                        <div class="registration-input-box__title">
                                                            <label>First Name</label>
                                                            <ul class="registration-input-box__title__errors" data-error-key="firstName" >
                                                            </ul>
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            name="firstName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <div class="registration-input-box__title">
                                                            <label>Middle Name</label>
                                                            <ul class="registration-input-box__title__errors" data-error-key="middleName" >
                                                            </ul>
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            name="middleName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <div class="registration-input-box__title">
                                                            <label>Last Name</label>
                                                            <ul class="registration-input-box__title__errors" data-error-key="lastName" >
                                                            </ul>
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            name="lastName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <div class="registration-input-box__title">
                                                            <label>Extension</label>
                                                            <ul class="registration-input-box__title__errors" data-error-key="extension" >
                                                            </ul>
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            name="extension">

                                                    </div>

                                            </div>

                                        </div>
                                        
                                    </div>
                                    
                                    <div class="section-child__center-client-builder-box__section">                            

                                        <div class="section-child__center-client-builder-box__section__input-box no-title">

                                            <div class="section-child__center-client-builder__child__child">

                                                <div class="registration-input-box">

                                                        <div class="registration-input-box__title">
                                                            <label>Relationship Status</label>
                                                            <ul class="registration-input-box__title__errors" data-error-key="relationshipStatus" >
                                                            </ul>
                                                        </div>

                                                    <select 
                                                        class="input-style"
                                                        name="relationshipStatus" 
                                                        required>
                                                        <option disabled selected>Relationship Status</option>
                                                        ${Object.values(window.userRelationshipTypes).map(value => {
															return value === "Single" ? `<option value="${value}" selected>${value}</option>` : `<option value="${value}">${value}</option>`;
														})}
                                                    </select>

                                                </div>

                                            </div>

                                        </div>
                                    
                                    </div>
                                    
                                    <div class="section-child__center-client-builder-box__section">                            
                                        
                                        <div class="section-child__center-client-builder-box__section__input-box no-title">

                                            <div class="section-child__center-client-builder__child__child">

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Birthdate</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="birthDate" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="date"
                                                        required name="birthDate">

                                                </div>

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Age</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="age" >
                                                        </ul>
                                                    </div> 
                                                   <input 
                                                        type="number"
                                                        required 
                                                        name="age" 
                                                        max="70" 
                                                        min="15">

                                                </div>

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Email</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="email" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        required 
                                                        maxLength="255" 
                                                        minlength="5">

                                                </div>

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Occupation</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="occupation" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        name="occupation" 
                                                        required 
                                                        maxLength="100" 
                                                        minLength="5">

                                                </div>

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Meter Number</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="meterNumber" >
                                                        </ul>
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        required name="meterNumber" required>

                                                </div>

                                                <div class="registration-input-box">
                                                    <div class="registration-input-box__title">
                                                        <label>Phone Number</label>
                                                        <ul class="registration-input-box__title__errors" data-error-key="phoneNumber" >
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
                                                            value="9956291448"
                                                            maxlength="10">

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                        
                                    </div>
                                    
                                </div>

                                <div id="client-register-client-image-box">
                                    <video id="client-register-client-video" autoplay playsinline></video>
                                    <canvas id="client-register-client-image-template"></canvas>
                                
                                    <div id="client-register-client-image-box-options">
                                        <input type="file" accept="image/*" id="client-registration-image">
                                        <button id="client-register-client-image-capture" class="button-primary take-image">
                                            Take Image
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div class="section-child__center-client-builder-box__section">                            
                                
                                <div class="section-child__center-client-builder-box__section__input-box">

                                    <div class="section-child__center-client-builder-box__section__input-box-title">
                                        <p>Present Address</p>
                                        <div>
                                            <input type="checkbox" id="mergePresentAndMainPrompt"> 
                                            <p>Main Address the same as Present Address</p>
                                        </div>
                                    </div>

                                    <div class="section-child__center-client-builder__child__child">

                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Street</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressStreet" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Subdivision</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressSubdivision" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Barangay</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressBarangay" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>City</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressCity" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Province</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressProvince" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Postal Code</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressPostalCode" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="number"
                                                    name="presentAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Details</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="presentAddressDetails" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="presentAddressDetails" 
                                                    required 
                                                    maxLength="255" 
                                                    minLength="20">

                                            </div>

                                    </div>

                                </div>
                            
                            </div>

                            <div class="section-child__center-client-builder-box__section">                            
                                    
                                <div class="section-child__center-client-builder-box__section__input-box">

                                    <p>Main Address</p>

                                    <div class="section-child__center-client-builder__child__child">

                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Street</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressStreet" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Subdivision</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressSubdivision" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Barangay</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressBarangay" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>City</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressCity" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Province</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressProvince" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Postal Code</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressPostalCode" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="number"
                                                    name="mainAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <div class="registration-input-box__title">
                                                    <label>Details</label>
                                                    <ul class="registration-input-box__title__errors" data-error-key="mainAddressDetails" >
                                                    </ul>
                                                </div>
                                                <input 
                                                    type="text"
                                                    name="mainAddressDetails" 
                                                    required 
                                                    maxLength="255" 
                                                    minLength="20">

                                            </div>

                                    </div>

                                </div>
                            
                            </div>

                            <div class="section-child__center-client-builder-box__section last">                            
                                <button class="button-primary" id="client-register-submit-button">Create</button>
                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </section>

    </section>
    `;

    const getElementById = id => document.getElementById(id);
    const querySelector = selector => document.querySelector(selector);

    const formDataBuffer = {
		formData: null,
		image: null,
	};

	getElementById("container").innerHTML += template;
	setFieldValues(fields);

	setTimeout(() => {getElementById("section-type-container").classList.add("active")}, 500);

	const canvas = getElementById("client-register-client-image-template");
	const camera = getElementById("client-register-client-video");
	const webcam = new Webcam(camera, "user", canvas);

    //if webcam is allowed, renders the capture toggle, else renders an file image input
	webcam.info().then(data => {
		const numberOfWebCams = data.filter(value => value["kind"] === "videoinput" && value["label"] !== "screen-capture-recorder").length;
		showHideImageCapture(numberOfWebCams);
	});

	// Handle form submission
	getElementById("client-register-submit-button").addEventListener("click", event => {
		event.preventDefault();
		handleFormSubmit(formDataBuffer);
	});

	// Handle image capture
	getElementById("client-register-client-image-capture").addEventListener("click", event => {
		event.preventDefault();

		const { target, classList } = event;

		const toggleCaptureClass = () => {
			const newClass = classList.contains("take-image") ? "capture" : "take-image";
			classList.replace("take-image", newClass);
			target.innerHTML = newClass === "capture" ? "Capture" : "Take Image";
			camera.style.zIndex = newClass === "capture" ? "2" : "1";
			canvas.style.zIndex = newClass === "capture" ? "1" : "2";
		};

		if (classList.contains("take-image")) {
			webcam.start()
				.then(() => makeToastNotification("Click capture to capture the image"))
				.catch(error => {
					if (error === "Camera access denied") {
						makeToastNotification(error);
						getElementById("client-registration-image").style.display = "block";
						target.nextElementSibling.style.display = "none";
					}
				});
			toggleCaptureClass();
        }
        
        if (classList.contains("capture")) {
			webcam.snap(data => {
				formDataBuffer.image = { base64: data, fromInput: false };
				canvas.value = data;
			});
			webcam.stop();
			toggleCaptureClass();
		}
	})

	// Handle merging addresses
	let duplicateAddress = false;

    //clears all input if duplicate address was unchecked else refills their values
    getElementById("mergePresentAndMainPrompt").addEventListener("change", event => {
		const duplicateAddress = event.target.checked;
		const addressType = duplicateAddress ? "present" : "main";
		const inputFields = document.querySelectorAll(`input[name^='${addressType}']`);

		inputFields.forEach(input => {
			const targetName = input.name.replace(addressType, "main");
			const targetInput = document.querySelector(`input[name='${targetName}']`);
			targetInput.value = duplicateAddress ? input.value : "";
		});
	});
      
    /*
        if duplicate address is checked,
        any values placed inside present address fields also duplicates to main address fields 
    */
    getElementById("client-registration-form").addEventListener("keyup", ({ target }) => {
		if (duplicateAddress) {
			const targetName = target.getAttribute("name").replace("present", "main");
			querySelector(`input[name='${targetName}']`).value = target.value;
		}
	})
    
	getElementById("client-registration-image").addEventListener("change", event => {

        const fileInput = document.getElementById("client-registration-image");

		const ctx = canvas.getContext("2d");

		if (fileInput.files && fileInput.files[0]) {
			const file = fileInput.files[0];

			if (file.type.startsWith("image/")) {
				const reader = new FileReader();

				reader.onload = function (e) {
					const image = new Image();

					image.onload = function () {
						canvas.width = image.width;
						canvas.height = image.height;
						ctx.drawImage(image, 0, 0);
					};

					image.src = e.target.result;

					formDataBuffer.image = {
						base64: null,
						fromInput: true,
						path: file.path,
						size: file.size,
						type: file.type,
						format: file.name.split(".")[1],
					};
				};

				reader.readAsDataURL(file);
			} else {
				event.preventDefault();
				return "Please select an image file"
			}
		}
	});

	function showHideImageCapture(numWebcams) {
		const registrationImage = getElementById("client-registration-image");
		const imageCapture = getElementById("client-register-client-image-capture");

		if (numWebcams > 0) {
			registrationImage.style.display = "none";
			imageCapture.style.display = "block";
		} else {
			registrationImage.style.display = "block";
			imageCapture.style.display = "none";
		}
	}

	function addFieldError(field, error) {
		const errorField = querySelector(`ul[data-error-key="${field}"]`);

		if (errorField) {
			errorField.innerHTML = `<li class="registration-input-box__title__errors-item">${error}</li>`;
		}
	}

	function clearFieldErrors() {
		const fieldErrors = document.querySelectorAll(".registration-input-box__title__errors-item");

		if (fieldErrors) {
			fieldErrors.forEach(field => (field.innerHTML = ""));
		}
	}

	function validateFormData(formDataBuffer) {
		let errors = 0;

		const longestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length > a.length ? b : a)).length;
		const shortestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length < a.length ? b : a)).length;

		const validationMethods = {
			firstName: [[window.isEmpty], [window.isOverThan, 2, 255]],

			middleName: [[window.isEmpty], [window.isOverThan, 2, 255]],

			lastName: [[window.isEmpty], [window.isOverThan, 2, 255]],

			relationshipStatus: [[window.isEmpty], [window.isOverThan, shortestRelationshipOption, longestRelationshipOption], [window.notIn, [...Object.values(window.userRelationshipTypes)]]],

			birthDate: [[window.isEmpty], [window.isBirthDate]],

			age: [[window.isEmpty], [window.isOverThan, 15, 70]],

			email: [[window.isEmpty], [window.isEmail], [window.isOverThan, 10, 255]],

			occupation: [[window.isEmpty], [window.isOverThan, 5, 255]],

			phoneNumber: [[window.isEmpty], [window.isValidPhoneNumber]],

			presentAddressStreet: [[window.isEmpty], [window.isOverThan, 5, 9999]],

			presentAddressSubdivision: [[window.isEmpty], [window.isOverThan, 5, 255]],

			presentAddressBarangay: [[window.isEmpty], [window.isOverThan, 5, 255]],

			presentAddressCity: [[window.isEmpty], [window.isOverThan, 5, 255]],

			presentAddressProvince: [[window.isEmpty], [window.isOverThan, 5, 255]],

			presentAddressPostalCode: [[window.isEmpty], [window.isOverThan, 5, 9999]],

			presentAddressDetails: [[window.isEmpty], [window.isOverThan, 5, 255]],

			mainAddressStreet: [[window.isEmpty], [window.isOverThan, 5, 9999]],

			mainAddressSubdivision: [[window.isEmpty], [window.isOverThan, 5, 255]],

			mainAddressBarangay: [[window.isEmpty], [window.isOverThan, 5, 255]],

			mainAddressCity: [[window.isEmpty], [window.isOverThan, 5, 255]],

			mainAddressProvince: [[window.isEmpty], [window.isOverThan, 5, 255]],

			mainAddressPostalCode: [[window.isEmpty], [window.isOverThan, 5, 9999]],

			mainAddressDetails: [[window.isEmpty], [window.isOverThan, 5, 255]],
		};

		formData.forEach((dirtyValue, key) => {
			if (typeof dirtyValue !== "object") {
				const value = dirtyValue.trim();

				if (validationMethods.hasOwnProperty(key)) {
					validationMethods[key].forEach(([validationMethod, ...args]) => {
						const [validationErrors, validationMessage] = validationMethod(value, ...args);
						errors += validationErrors;

						validationMessage.length > 0 && addFieldError(key, validationMessage);
					});
				}
			}
		});

		if (formDataBuffer.image === null) {
			makeToastNotification("Profile Picture is required when registering a new client");
			errors++;
		}

		return errors;
	}

	async function handleFormSubmit(formDataBuffer) {
		const errors = validateFormData(formDataBuffer);

		if (errors === 0) {
			clearFieldErrors();
			formDataBuffer.formData = Object.fromEntries(formData.entries());

			const response = await window.ipcRenderer.invoke("add-client", formDataBuffer);

			if (response.status === "success") {
				response.toast.forEach(toast => {
					makeToastNotification(toast);
				});
				transition(renderClientSection);
			} else {
				if (response.field_errors) {
					Object.keys(response.field_errors).forEach(key => {
						querySelector(`ul[data-error-key="${key}"]`).innerHTML = `<li class="registration-input-box__title__errors-item">${response.field_errors[key]}</li>`;
					});
				}

				response.toast.forEach(toast => {
					makeToastNotification(toast);
				});
			}
		}
	}
}
