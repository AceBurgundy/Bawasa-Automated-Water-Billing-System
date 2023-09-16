// @collapse

import { renderBillingSection } from "../../billing/static/billing.js"
import { renderClientSection } from "../../clients/static/clients.js"
import { getTemplate } from "../templates/clientBuilder.js"
import Webcam from "../../../assets/scripts/Webcam.js"
import "../../../utilities/constants.js"

import { 
	makeToastNotification, 
	transition,
	getById,
	queryElement,
	queryElements
} from "../../../assets/scripts/helper.js"

/**
 * Renders and manages a client registration or edit form.
 * @param {boolean} edit - Indicates whether the form is in edit mode.
 * @param {object} clientObject - The client data for pre-filling the form in edit mode.
 */
export async function renderClientBuilder(edit, clientObject) {

	let forEdit = null
	let clientData = null

	if (edit && clientObject) {
		clientData = clientObject[0]
		forEdit = edit
	}

    const formDataBuffer = {
		formData: null,
		image: null,
		files: null
	}

	getById("container").innerHTML += getTemplate(forEdit, clientData)

	setTimeout(() => {getById("section-type-container").classList.add("active")}, 500)

	const canvas = getById("client-form-image-template")
	const camera = getById("client-form-video")
	const webcam = new Webcam(camera, "user", canvas)
    
    //if webcam is allowed, renders the capture toggle, else renders an file image input
	webcam.info().then(data => {
		const numberOfWebCams = data.filter(value => value["kind"] === "videoinput" && value["label"] !== "screen-capture-recorder").length
		showHideImageCapture(numberOfWebCams)
	})

	//loads clients profile picture when form is set to edit
	if (forEdit && clientData) {
        const image = new Image()
        const ctx = canvas.getContext('2d')
		const imagePath = await window.ipcRenderer.invoke("get-client-image-path", clientData.profilePicture)
        image.src = imagePath
        
        image.onload = function () {
            canvas.width = image.width
            canvas.height = image.height
            ctx.drawImage(image, 0, 0)
        }

		formDataBuffer.image = {
			base64: null,
			fromInput: true,
			path: imagePath,
			size: null,
			type: null,
			format: clientData.profilePicture.split(".")[1],
		}
    } 

	const input = getById('client-files-input')
	const uploadedFiles = [];

	const updateInputFiles = (uploadedFiles, input, doNotDisplayThumbnails = false) => {
		const dataTransfer = new DataTransfer();
		uploadedFiles.forEach(uploadedFile => dataTransfer.items.add(uploadedFile));
		input.files = dataTransfer.files;
		
		if (doNotDisplayThumbnails) {
			return
		} else {
			displayThumbnail(input.files)
		}
	} 

	window.addEventListener('dragover', (event) => {
        event.preventDefault()
    })

	window.addEventListener('drop', event => {

		const droppedElement = event.target

		if (droppedElement.classList.contains("client-form-files__box")) {

			const files = event.dataTransfer.files

			const uploadedFilesNames = uploadedFiles.map(file => file.name)
			const fileNames = Array.from(files).map(file => file.name)

			fileNames.forEach((name, index) => {
				if (!uploadedFilesNames.includes(name)) {
					uploadedFiles.push(files[index])
				} else {
					makeToastNotification(`${name} already exists`)
				}
			})
			updateInputFiles(uploadedFiles, input)
		}

    })

	input.addEventListener('change', async () => {
		[...input.files].forEach(file => uploadedFiles.push(file))
		displayThumbnail(uploadedFiles)
    })

	window.onclick = event => {
		
		const { target } = event
		const elementId = target.id

		if (elementId === "billing") {
			transition(renderBillingSection)
		}

		if (elementId === "clients") {
			transition(renderClientSection)
		}

		if (target.classList.contains("client-form-files-box-preview__delete")) {

			event.preventDefault()

			const fileName = target.getAttribute("data-file-name")
		
			uploadedFiles.forEach((file, index) => {
				if (file.name === fileName) uploadedFiles.splice(index, 1)
			})

			if (uploadedFiles.length === 0) {
				getById("client-form-files-box-message").style.display = "flex"
			}
			
			updateInputFiles(uploadedFiles, input, true)

			target.parentElement.remove()

		}

	}

	// Handle form submission
	getById("client-register-submit-button").addEventListener("click", event => {
		event.preventDefault()
        formDataBuffer.formData = new FormData(getById("client-form"))
		if (forEdit && clientData !== null) {
			handleFormSubmit(formDataBuffer, forEdit, clientData.id)
		} else {
			handleFormSubmit(formDataBuffer)
		}
	})

	// Handle image capture
	getById("client-form-image-capture").addEventListener("click", event => {
		event.preventDefault()

		const { target } = event
        const { classList } = target

		const toggleCaptureClass = () => {
			const newClass = classList.contains("take-image") ? "capture" : "take-image"
			classList.replace("take-image", newClass)
			target.innerHTML = newClass === "capture" ? "Capture" : "Take Image"
			camera.style.zIndex = newClass === "capture" ? "2" : "1"
			canvas.style.zIndex = newClass === "capture" ? "1" : "2"
		}

		if (classList.contains("take-image")) {
			webcam.start()
				.then(() => makeToastNotification("Click capture to capture the image"))
				.catch(error => {
					if (error === "Camera access denied") {
						makeToastNotification(error)
						getById("client-form-image").style.display = "block"
						target.nextElementSibling.style.display = "none"
					}
				})
			toggleCaptureClass()
        }
        
        if (classList.contains("capture")) {
			webcam.snap(data => {
				formDataBuffer.image = { base64: data, fromInput: false }
				canvas.value = data
			})
			webcam.stop()
			toggleCaptureClass()
		}
	})

	// Handle merging addresses
	let duplicateAddress = false

    //clears all input if duplicate address was unchecked else refills their values
    getById("mergePresentAndMainPrompt").addEventListener("change", event => {
		duplicateAddress = event.target.checked
		const addressType = duplicateAddress ? "present" : "main"
        const inputFields = queryElements(`input[name^='${addressType}']`)

		inputFields.forEach(input => {
			const targetName = input.name.replace(addressType, "main")
			const targetInput = queryElement(`input[name='${targetName}']`)
			targetInput.value = duplicateAddress ? input.value : ""
		})
	})
      
    /*
        if duplicate address is checked,
        any values placed inside present address fields also duplicates to main address fields 
    */
    getById("client-form").addEventListener("keyup", ({ target }) => {
		if (duplicateAddress) {
			const targetName = target.getAttribute("name").replace("present", "main")
			queryElement(`input[name='${targetName}']`).value = target.value
		}
	})
    
	getById("client-form-image").addEventListener("change", event => {

        const fileInput = getById("client-form-image")

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
						format: file.name.split(".")[1],
					}
				}

				reader.readAsDataURL(file)
			} else {
				event.preventDefault()
				return "Please select an image file"
			}
		}
	})

	function showHideImageCapture(numWebcams) {
		const registrationImage = getById("client-form-image")
		const imageCapture = getById("client-form-image-capture")

		if (numWebcams > 0) {
			registrationImage.style.display = "none"
			imageCapture.style.display = "block"
		} else {
			registrationImage.style.display = "block"
			imageCapture.style.display = "none"
		}
	}

	function addFieldError(field, error) {
		const errorField = queryElement(`ul[data-error-key="${field}"]`)

		if (errorField) {
			errorField.innerHTML = `<li class="client-form-input-box__title__errors-item">${error}</li>`
		}
	}

	function clearFieldErrors() {
		const fieldErrors = queryElements(".client-form-input-box__title__errors-item")

		if (fieldErrors) {
			fieldErrors.forEach(field => (field.innerHTML = ""))
		}
	}

	function validateFormData(formDataBuffer) {

        clearFieldErrors()

		let errors = 0

		const longestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length > a.length ? b : a)).length
		const shortestRelationshipOption = Object.values(window.userRelationshipTypes).reduce((a, b) => (b.length < a.length ? b : a)).length

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
		}

        formDataBuffer.formData.forEach((dirtyValue, key) => {
			if (typeof dirtyValue !== "object") {
				const value = dirtyValue.trim()

				if (validationMethods.hasOwnProperty(key)) {
					validationMethods[key].forEach(([validationMethod, ...args]) => {
						const [validationErrors, validationMessage] = validationMethod(value, ...args)
						errors += validationErrors

						validationMessage.length > 0 && addFieldError(key, validationMessage)
					})
				}
			}
		})

        if (formDataBuffer.image === null) {
			makeToastNotification("Profile Picture is required when registering a new client")
			errors++
		}

		return errors
	}

	async function handleFormSubmit(formDataBuffer, forEdit = false, clientId = null) {

		clearFieldErrors()

		// DSGKHOS;D update to check proper validate
		// DSGJDS check for proper files.
		const result = validateFormData(formDataBuffer.formData)

		if (result.count > 0) {
			const { field, message } = result
			message.forEach(text => addFieldError(field, text))
			return
		}

		const inputFiles = getById('client-files-input');

		if (inputFiles) {
		  const filesData = [];
		  
		  for (const file of inputFiles.files) {
			filesData.push({
				name: file.name,
				size: file.size,
				path: file.path
			})
		  }
		
		  formDataBuffer.files = filesData;
		}

		//remove clientFiles from formData 
		formDataBuffer.formData.delete("clientFiles")
		formDataBuffer.formData = Object.fromEntries(formDataBuffer.formData.entries())

		let response = null
		
		if (forEdit && clientId !== null) {

			response = await window.ipcRenderer.invoke("edit-client", {
				formDataBuffer: formDataBuffer,
				clientId: clientId
			})

		} else {
			
			response = await window.ipcRenderer.invoke("add-client", formDataBuffer)

		}

		if (response.status === "success") {

			response.toast.forEach(toast => makeToastNotification(toast))
			transition(renderClientSection)

		} else {

			if (response.field_errors) {
				Object.keys(response.field_errors).forEach(key => {
					queryElement(`ul[data-error-key="${key}"]`).innerHTML = `
						<li class="client-form-input-box__title__errors-item">
							${response.field_errors[key]}
						</li>
					`
				})
			}

			response.toast.forEach(toast => {
				makeToastNotification(toast)
			})
		}
	}
}

/**
 * 
 * @param {String} fileType - the value of the key "type" from the File object 
 * @param {*} event - Event from the reader onload function
 * @returns String - path to the icon image file
 */
async function getFileIcon(fileType, event) {

    const imagePath = async (fileName) => await window.ipcRenderer.invoke("get-file-image-path", fileName)
    
	if (fileType.includes("image/")) {
        return event.target.result
    } 
	
	if (fileType.includes("application/pdf")) {
        return await imagePath("pdf-icon.PNG")
    }
	
	if (fileType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        return await imagePath("docx-icon.PNG")
    }
	
	if (fileType.includes("application/msword")) {
        return await imagePath("doc-icon.PNG")
    }
	
	if (fileType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
        fileType.includes("application/vnd.ms-excel") ||
        fileType.includes("text/csv")) {
        return await imagePath("sheet-icon.PNG")
    }

	return await imagePath("default-icon.png")

}

/**
 * Adds the thumbnails of the added images preview
 * @param {*} file - File object
 */
function displayThumbnail(files) {

	const addNewFileMessage = getById("client-form-files-box-message")
	const computedStyle = window.getComputedStyle(addNewFileMessage);
	const displayPropertyValue = computedStyle.getPropertyValue("display");

	if (displayPropertyValue === "flex") addNewFileMessage.style.display = "none"

	Array.from(files).forEach(file => {

		const previewExists = queryElement(`[data-preview-file-name="${file.name}"]`)
		if (previewExists) return

		const addNewFilePreview = (image, fileName) => {

			const div = document.createElement("div")
			div.className = "client-form-files-box-preview"
			div.setAttribute("data-preview-file-name", fileName)
			
			const deleteButton = document.createElement("div")
			deleteButton.className = "client-form-files-box-preview__delete"
			deleteButton.setAttribute("data-file-name", fileName)
			deleteButton.textContent = "Remove"
	
			const p = document.createElement("p")
			p.className = "client-form-files-box-preview__text"
			p.textContent = fileName
	
			div.appendChild(deleteButton)
			div.appendChild(image)
			div.appendChild(p)
			return div
		}
	
		const reader = new FileReader()
		reader.onload = async function(event) {
			const img = document.createElement('img')
			img.className = "client-form-files-box-preview__image"
			img.src = await getFileIcon(file.type, event)
			img.alt = file.name
			const imagePreview = addNewFilePreview(img, file.name)
			queryElement(".client-form-files__box").appendChild(imagePreview)
		}
		reader.readAsDataURL(file)

	})

}