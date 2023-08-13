import { makeToastNotification, transition } from "../../../helper.js";
import { renderBillingSection } from "../../billing/static/billing.js";
import { renderClientSection } from "../../clients/static/clients.js";
import { getTemplate } from "../templates/client_builder.js"
import Webcam from "../../../assets/scripts/Webcam.js";
import "../../../../model_helpers.js";

export async function renderClientBuilder(edit, clientObject) {

	let forEdit = null
	let clientData = null

	if (edit && clientObject) {
		clientData = clientObject[0]
		forEdit = edit
	}

    const getElementById = id => document.getElementById(id);
    const querySelector = selector => document.querySelector(selector);

    const formDataBuffer = {
		formData: null,
		image: null,
	};

	getElementById("container").innerHTML += getTemplate(forEdit, clientData);

	// const initialData = {
	// 	firstName: "Sam Adrian",
	// 	middleName: "Panganoron",
	// 	lastName: "Sabalo",
	// 	extension: "",
	// 	birthDate: "2001-08-20",
	// 	age: "18",
	// 	email: "Samadriansabalo99@gmail.com",
	// 	occupation: "Software Engineer",
	// 	meterNumber: "wesdgw1231",
	// 	phoneNumber: "9956281448",
	// 	presentAddressStreet: "Yumang",
	// 	presentAddressSubdivision: "Pineda",
	// 	presentAddressBarangay: "City Heights",
	// 	presentAddressCity: "General Santos",
	// 	presentAddressProvince: "South Cotabato",
	// 	presentAddressPostalCode: "9500",
	// 	presentAddressDetails: "Black Gate",
	// 	mainAddressStreet: "Yumang",
	// 	mainAddressSubdivision: "Pineda",
	// 	mainAddressBarangay: "City Heights",
	// 	mainAddressCity: "General Santos",
	// 	mainAddressProvince: "South Cotabato",
	// 	mainAddressPostalCode: "9500",
	// 	mainAddressDetails: "Black Gate",
	// }

	// Object.keys(initialData).forEach(key => {
	// 	console.log(key);
	// 	document.querySelector(`input[name='${key}']`).value = initialData[key]
	// })

	setTimeout(() => {getElementById("section-type-container").classList.add("active")}, 500);

	const canvas = getElementById("client-form-image-template");
	const camera = getElementById("client-form-video");
	const webcam = new Webcam(camera, "user", canvas);
    
    //if webcam is allowed, renders the capture toggle, else renders an file image input
	webcam.info().then(data => {
		const numberOfWebCams = data.filter(value => value["kind"] === "videoinput" && value["label"] !== "screen-capture-recorder").length;
		showHideImageCapture(numberOfWebCams);
	});

	//loads clients profile picture when form is set to edit
	if (forEdit && clientData) {
        const image = new Image();
        const ctx = canvas.getContext('2d');
		const imagePath = await window.ipcRenderer.invoke("get-client-image-path", clientData.profilePicture)
        image.src = imagePath
        
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
        };

		formDataBuffer.image = {
			base64: null,
			fromInput: true,
			path: imagePath,
			size: null,
			type: null,
			format: clientData.profilePicture.split(".")[1],
		};
    } 

	// Handle form submission
	getElementById("client-register-submit-button").addEventListener("click", event => {
		event.preventDefault();
        formDataBuffer.formData = new FormData(getElementById("client-form"))
		if (forEdit && clientData !== null) {
			handleFormSubmit(formDataBuffer, forEdit, clientData.id);
		} else {
			handleFormSubmit(formDataBuffer);
		}
	});

	// Handle image capture
	getElementById("client-form-image-capture").addEventListener("click", event => {
		event.preventDefault();

		const { target } = event;
        const { classList } = target;

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
						getElementById("client-form-image").style.display = "block";
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
		duplicateAddress = event.target.checked;
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
    getElementById("client-form").addEventListener("keyup", ({ target }) => {
		if (duplicateAddress) {
			const targetName = target.getAttribute("name").replace("present", "main");
			querySelector(`input[name='${targetName}']`).value = target.value;
		}
	})
    
	getElementById("client-form-image").addEventListener("change", event => {

        const fileInput = document.getElementById("client-form-image");

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
		const registrationImage = getElementById("client-form-image");
		const imageCapture = getElementById("client-form-image-capture");

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
			errorField.innerHTML = `<li class="client-form-input-box__title__errors-item">${error}</li>`;
		}
	}

	function clearFieldErrors() {
		const fieldErrors = document.querySelectorAll(".client-form-input-box__title__errors-item");

		if (fieldErrors) {
			fieldErrors.forEach(field => (field.innerHTML = ""));
		}
	}

	function validateFormData(formDataBuffer) {

        clearFieldErrors();

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

        formDataBuffer.formData.forEach((dirtyValue, key) => {
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

	async function handleFormSubmit(formDataBuffer, forEdit = false, clientId = null) {

		const errors = validateFormData(formDataBuffer);

		if (errors === 0) {

			formDataBuffer.formData = Object.fromEntries(formDataBuffer.formData.entries())

			let response = null
			
			if (forEdit && clientId !== null) {
				const data = {
					formDataBuffer: formDataBuffer,
					clientId: clientId
				}

				response = await window.ipcRenderer.invoke("edit-client", data)
			} else {
				response = await window.ipcRenderer.invoke("add-client", formDataBuffer)
			}
			console.log(response);
			if (response.status === "success") {
				response.toast.forEach(toast => {
					makeToastNotification(toast);
				});
				transition(renderClientSection);
			} else {
				if (response.field_errors) {
					Object.keys(response.field_errors).forEach(key => {
						querySelector(`ul[data-error-key="${key}"]`).innerHTML = `<li class="client-form-input-box__title__errors-item">${response.field_errors[key]}</li>`;
					});
				}

				response.toast.forEach(toast => {
					makeToastNotification(toast);
				});
			}
		}
	}
}
