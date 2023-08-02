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
                                                        <label>First Name</label>
                                                        <input 
                                                            type="text"
                                                            name="firstName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Middle Name</label>
                                                        <input 
                                                            type="text"
                                                            name="middleName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Last Name</label>
                                                        <input 
                                                            type="text"
                                                            name="lastName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Extension</label>
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

                                                    <label>Relationship status</label>

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
                                                    <label>Age</label>
                                                    <input 
                                                        type="date"
                                                        required name="birthDate">

                                                </div>

                                                <div class="registration-input-box">
                                                    <label>Age</label>
                                                    <input 
                                                        type="number"
                                                        required 
                                                        name="age" 
                                                        max="70" 
                                                        min="15">

                                                </div>

                                                <div class="registration-input-box">
                                                    <label>Email</label>
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        required 
                                                        maxLength="255" 
                                                        minlength="5">

                                                </div>

                                                <div class="registration-input-box">
                                                    <label>Occupation</label>
                                                    <input 
                                                        type="text"
                                                        name="occupation" 
                                                        required 
                                                        maxLength="100" 
                                                        minLength="5">

                                                </div>

                                                <div class="registration-input-box">
                                                    <label>Meter Number</label>
                                                    <input 
                                                        type="text"
                                                        required name="meterNumber" required>

                                                </div>

                                                <div class="registration-input-box">
                                                    <label>Phone Number</label>
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
                                                <label>Street</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Subdivision</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Barangay</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>City</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Province</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Postal Code</label>
                                                <input 
                                                    type="number"
                                                    name="presentAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Details</label>
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
                                                <label>Street</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Subdivision</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Barangay</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>City</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Province</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Postal Code</label>
                                                <input 
                                                    type="number"
                                                    name="mainAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Details</label>
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
        document.getElementById("client-registration-image").style.display = "block"
        document.getElementById("client-register-client-image-capture").style.display = "none"
    } else {
        document.getElementById("client-registration-image").style.display = "none"
        document.getElementById("client-register-client-image-capture").style.display = "block"
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
					[window.isEmpty, "First name"],
					[window.isOverThan, 2, 255, "First name"]
				],

				middleName: [
					[window.isEmpty, "Middle name"],
					[window.isOverThan, 2, 255, "Middle name"]
				],

				lastName: [
					[window.isEmpty, "Last name"],
					[window.isOverThan, 2, 255, "Last name"]
				],

				relationshipStatus: [
					[window.isEmpty, "Relationship Status"],
					[window.isOverThan, shortestRelationshipOption, longestRelationshipOption, "Relationship Status"],
					[window.notIn, [...Object.values(window.userRelationshipTypes)], "Client Relationship Status"]
				],

				birthDate: [
                    [window.isEmpty, "Birthdate"], 
                    [window.isBirthDate]
                ],

				age: [
					[window.isEmpty, "Age"],
					[window.isOverThan, 15, 70, "Age"]
				],

				email: [
					[window.isEmpty, "Email"],
					[window.isEmail, "Email"],
					[window.isOverThan, 10, 255, "Email"]
				],

				occupation: [
					[window.isEmpty, "Occupation"],
					[window.isOverThan, 10, 255, "Occupation"]
				],

				phoneNumber: [
					[window.isEmpty, "Phone Number"],
					[window.isValidPhoneNumber, "Phone Number"]
				],

				presentAddressStreet: [
					[window.isEmpty, "Present Address Street"],
					[window.isOverThan, 5, 9999, "Present Address Street"]
				],

				presentAddressSubdivision: [
					[window.isEmpty, "Present Address Subdivision"],
					[window.isOverThan, 5, 255, "Present Address Subdivision"]
				],

				presentAddressBarangay: [
					[window.isEmpty, "Present Address Barangay"],
					[window.isOverThan, 5, 255, "Present Address Barangay"]
				],

				presentAddressCity: [
					[window.isEmpty, "Present Address City"],
					[window.isOverThan, 5, 255, "Present Address City"]
				],

				presentAddressProvince: [
					[window.isEmpty, "Present Address Province"],
					[window.isOverThan, 5, 255, "Present Address Province"]
				],

				presentAddressPostalCode: [
					[window.isEmpty, "Present Address Postal Code"],
					[window.isOverThan, 5, 9999, "Present Address Postal Code"]
				],

				presentAddressDetails: [
					[window.isEmpty, "Present Address Details"],
					[window.isOverThan, 5, 255, "Present Address Details"]
				],

				mainAddressStreet: [
					[window.isEmpty, "Main Address Street"],
					[window.isOverThan, 5, 9999, "Main Address Street"]
				],

				mainAddressSubdivision: [
					[window.isEmpty, "Main Address Subdivision"],
					[window.isOverThan, 5, 255, "Main Address Subdivision"]
				],

				mainAddressBarangay: [
					[window.isEmpty, "Main Address Barangay"],
					[window.isOverThan, 5, 255, "Main Address Barangay"]
				],

				mainAddressCity: [
					[window.isEmpty, "Main Address City"],
					[window.isOverThan, 5, 255, "Main Address City"]
				],

				mainAddressProvince: [
					[window.isEmpty, "Main Address Province"],
					[window.isOverThan, 5, 255, "Main Address Province"]
				],

				mainAddressPostalCode: [
					[window.isEmpty, "Main Address Postal Code"],
					[window.isOverThan, 5, 9999, "Main Address Postal Code"]
				],

				mainAddressDetails: [
					[window.isEmpty, "Main Address Details"],
					[window.isOverThan, 5, 255, "Main Address Details"]
				],
			}

			formData.forEach((dirtyValue, key) => {
				if (typeof dirtyValue !== "object") {
					const value = dirtyValue.trim()

					if (validationMethods.hasOwnProperty(key)) {
						validationMethods[key].forEach(([validationMethod, ...args]) => {
							const [validationErrors, validationMessage] = validationMethod(value, ...args)
							errors += validationErrors

							validationMessage.length > 0 && validationMessage.forEach(message => makeToastNotification(message))
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

    let mainAddressSameAsPresentAddress = false
    const form = document.getElementById("client-registration-form");

    document.getElementById("mergePresentAndMainPrompt").onchange = event => {
        const checkBox = event.target;
        mainAddressSameAsPresentAddress = checkBox.checked;
        if (!mainAddressSameAsPresentAddress) {
            document.querySelectorAll("input[name^='main']").forEach(input => {
                input.value = "";
            });
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
