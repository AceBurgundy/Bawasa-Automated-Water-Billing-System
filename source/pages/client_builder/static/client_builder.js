import { makeToastNotification, transition } from "../../../helper.js"
import { renderBillingSection } from "../../billing/static/billing.js"
import { renderClientSection } from "../../clients/static/clients.js"
import Webcam from "../../../assets/scripts/Webcam.js"
import "../../../../model_helpers.js"

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
															return value === "Single" ? 
                                                                `<option value="${value}" selected>${value}</option>` 
                                                                : 
                                                                `<option value="${value}">${value}</option>`
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
`

	let formDataBuffer = {
		formData: null,
		image: null,
	}

	document.getElementById("container").innerHTML += template

	setTimeout(() => {document.getElementById("section-type-container").classList.add("active")}, 500)

	const canvas = document.getElementById("client-register-client-image-template")
	const camera = document.getElementById("client-register-client-video")

	const webcam = new Webcam(camera, "user", canvas)

	const numberOfWebCams = await webcam
		.info()
		.then(data => {
			let list = data.filter(value => value["kind"] === "videoinput" && value["label"] !== "screen-capture-recorder")
			return list.length
		})
		.catch(error => {
			console.log("Failed to get info")
		})

    if (numberOfWebCams > 0) {
        document.getElementById("client-registration-image").style.display = "none"
        document.getElementById("client-register-client-image-capture").style.display = "block"
    } else {
        document.getElementById("client-registration-image").style.display = "block"
        document.getElementById("client-register-client-image-capture").style.display = "none"
    }

	window.onclick = async event => {

		const elementId = event.target.getAttribute("id")

		if (elementId === "client-register-submit-button") {

			event.preventDefault()

            const formData = new FormData(document.getElementById("client-registration-form"))

            let errors = 0

			const longestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length > a.length ? b : a)).length
			const shortestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length < a.length ? b : a)).length

			const validationMethods = {
				firstName: [
					[window.isEmpty],
					[window.isOverThan, 2, 255]
				],

				middleName: [
					[window.isEmpty],
					[window.isOverThan, 2, 255]
				],

				lastName: [
					[window.isEmpty],
					[window.isOverThan, 2, 255]
				],

				relationshipStatus: [
					[window.isEmpty],
					[window.isOverThan, shortestRelationshipOption, longestRelationshipOption],
					[window.notIn, [...Object.values(window.userRelationshipTypes)]]
				],

				birthDate: [
                    [window.isEmpty], 
                    [window.isBirthDate]
                ],

				age: [
					[window.isEmpty],
					[window.isOverThan, 15, 70]
				],

				email: [
					[window.isEmpty],
					[window.isEmail],
					[window.isOverThan, 10, 255]
				],

				occupation: [
					[window.isEmpty],
					[window.isOverThan, 10, 255]
				],

				phoneNumber: [
					[window.isEmpty],
					[window.isValidPhoneNumber]
				],

				presentAddressStreet: [
					[window.isEmpty],
					[window.isOverThan, 5, 9999]
				],

				presentAddressSubdivision: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				presentAddressBarangay: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				presentAddressCity: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				presentAddressProvince: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				presentAddressPostalCode: [
					[window.isEmpty],
					[window.isOverThan, 5, 9999]
				],

				presentAddressDetails: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				mainAddressStreet: [
					[window.isEmpty],
					[window.isOverThan, 5, 9999]
				],

				mainAddressSubdivision: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				mainAddressBarangay: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				mainAddressCity: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				mainAddressProvince: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],

				mainAddressPostalCode: [
					[window.isEmpty],
					[window.isOverThan, 5, 9999]
				],

				mainAddressDetails: [
					[window.isEmpty],
					[window.isOverThan, 5, 255]
				],
			}

			formData.forEach((dirtyValue, key) => {
				if (typeof dirtyValue !== "object") {
					const value = dirtyValue.trim()

					if (validationMethods.hasOwnProperty(key)) {
						validationMethods[key].forEach(([validationMethod, ...args]) => {
							const [validationErrors, validationMessage] = validationMethod(value, ...args)
							errors += validationErrors
                            
							if (validationMessage.length > 0) {
                                document.querySelector(`ul[data-error-key="${key}"]`).innerHTML = 
                                    `<li class="registration-input-box__title__errors-item">${validationMessage}</li>`
                            }
						})
					}
				}
			})

            if (formDataBuffer.image === null) {
                makeToastNotification("Profile Picture is required when registering a new client")
                errors++
            }

			if (errors === 0) {
				formDataBuffer.formData = Object.fromEntries(formData.entries())

				const response = await window.ipcRenderer.invoke("add-client", formDataBuffer)

				if (response.status === "success") {
					response.message.forEach(message => {
						makeToastNotification(message)
					})
					transition(renderClientSection)
				} else {
					response.message.forEach(message => {
						makeToastNotification(message)
					})
				}
			}
		}

        //admin clicks either that take image button or capture button
		if (elementId === "client-register-client-image-capture") {

			event.preventDefault()

            if (event.target.classList.contains("take-image")) {
				event.target.classList.replace("take-image", "capture")
				event.target.innerHTML = "Capture"
				camera.style.zIndex = "2"
				canvas.style.zIndex = "1"
				webcam
					.start()
					.then(() => makeToastNotification("Click capture to capture the image"))
					.catch(error => {

						if (error === "Camera access denied") {

							makeToastNotification(error)
							document.getElementById("client-registration-image").style.display = "block"
							event.target.nextElementSibling.style.display = "none"

						}
					})
                    
				return
			}

			if (event.target.classList.contains("capture")) {
				event.target.classList.replace("capture", "take-image")
				event.target.innerHTML = "Take Image"
				webcam.snap(data => {
					formDataBuffer.image = {
						base64: data,
						fromInput: false,
					}
					canvas.value = data
				})
				webcam.stop()
				camera.style.zIndex = "1"
				canvas.style.zIndex = "2"
				return
			}              
		}
        
	}

    /*
        When true allows for several functionalities.
        1. duplicate values in present address inputs to main address inputs.
        2. automatically copies present address input values to main address inputs.
        
        Automatically clears main address input values when set to false.
    */
    let mainAddressSameAsPresentAddress = false
    const form = document.getElementById("client-registration-form");

    document.getElementById("mergePresentAndMainPrompt").onchange = event => {

        mainAddressSameAsPresentAddress = event.target.checked;

        if (!mainAddressSameAsPresentAddress) {
            document.querySelectorAll("input[name^='main']").forEach(input => { input.value = "" });
        } else {
            document.querySelectorAll("input[name^='present']").forEach(input => {
                document.querySelector(`input[name='${input.name.replace("present", "main")}']`).value = input.value
            })
        }
    }

    form.addEventListener("keyup", event => {

        const input = event.target;

        if (mainAddressSameAsPresentAddress) {
            const targetName = input.getAttribute("name").replace("present", "main");
            const targetInput = document.querySelector(`input[name='${targetName}']`);
            targetInput.value = input.value;
        }
    });
    
	document.getElementById("client-registration-image").onchange = event => {

		const fileInput = document.getElementById("client-registration-image")
		const canvas = document.getElementById("client-register-client-image-template")
		const ctx = canvas.getContext("2d")

		if (fileInput.files && fileInput.files[0]) {
            
			const file = fileInput.files[0]

			if (file.type.startsWith("image/")) {

				const reader = new FileReader()

				reader.onload = function (e) {

					const image = new Image()

					image.onload = function () {
						canvas.width = image.width
						canvas.height = image.height
						ctx.drawImage(image, 0, 0)
					}

					image.src = e.target.result

					formDataBuffer.image = {
						base64: null,
						fromInput: true,
						path: file.path,
						size: file.size,
						type: file.type,
                        format: file.name.split('.')[1]
					}
				}

				reader.readAsDataURL(file)

			} else {
                event.preventDefault()
				makeToastNotification("Please select an image file")
			}
		}
	}
}
