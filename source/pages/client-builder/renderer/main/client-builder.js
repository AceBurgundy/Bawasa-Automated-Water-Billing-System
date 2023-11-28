// helpers
import { toSentenceCase, queryElements, camelToDashed, queryElement, getFormData, transition, getById } from "../../../../assets/scripts/helper.js"
import { makeToastNotification } from "../../../../assets/scripts/toast.js"

// main
import renderBillingSection from "../../../billing/renderer/main/billing.js"
import renderClientSection from "../../../clients/renderer/main/clients.js"
import renderProfile from "../../../profile/renderer/main/profile.js"

// components
import DocumentBoard from "../../../../components/DocumentBoard.js"
import InputCapture from "../../../../components/InputCapture.js"

// templates
import getTemplate from "../templates/client-builder.js"

// constants
import "../../../../utilities/constants.js"

/**
 * Renders and manages a client registration or edit form.
 * @param {boolean} edit - Indicates whether the form is in edit mode.
 * @param {object} clientObject - The client data for pre-filling the form in edit mode.
 */
export default async function renderClientBuilder(edit, clientObject) {

	let forEdit = edit || null
	let clientData = clientObject || null

	getById("container").innerHTML += getTemplate(forEdit, clientData)
	setTimeout(() => getById("section-type-container").classList.add("active"), 500)
	
	document.onclick = event => {
		
        const targetId = event.target.getAttribute("id")

		switch (targetId) {
			case "billing":
				transition(renderBillingSection)
				break
			
			case "clients":
				transition(renderClientSection)
				break

            case "profile":
                transition(renderProfile)
            	break
		}
	}
	
	const clientId = forEdit && clientData ? clientData.id : null

	const imageCaptureBox = queryElement(".content__form-box__group__left")
	const fileUploadBox = queryElement(".files")

	const filesClipBoardComponent = new DocumentBoard("clientFiles", forEdit, clientId, "Client Documents")
	const captureProfileComponent = new InputCapture("clientProfile", forEdit, clientData?.profilePicture )
	
	imageCaptureBox.parentElement.innerHTML += captureProfileComponent
	fileUploadBox.innerHTML = filesClipBoardComponent

	const mergePresentAndMainAddressToggle = getById("mergePresentAndMainPrompt")
	const submitButton = getById("client-register-submit-button")
	const clientBuilderForm = getById("client-form")

	// Handle form submission
	submitButton.onclick = event => {
		const forEditingClient = forEdit && clientData !== null
		const submitArguments = forEditingClient ? [...forEdit, clientData.id] : []
		handleFormSubmit(submitArguments)
		event.preventDefault()
	}

	// Handle merging addresses
	let duplicateAddress = false

    //clears all input if duplicate address was unchecked else refills their values
    mergePresentAndMainAddressToggle.onchange = event => {

		duplicateAddress = event.target.checked
	
		const addressType = duplicateAddress ? "present" : "main"
        const inputFields = queryElements(`input[name^='${addressType}']`)

		inputFields.forEach(input => {
			const targetName = input.name.replace(addressType, "main")
			const targetInput = queryElement(`input[name='${targetName}']`)
			targetInput.value = duplicateAddress ? input.value : ""
		})
	}
      
    /*
        if duplicate address is checked,
        any values placed inside present address fields also duplicates to main address fields 
    */
    clientBuilderForm.onkeyup = ({ target }) => {
		if (duplicateAddress) {
			const targetName = target.getAttribute("name").replace("present", "main")
			queryElement(`input[name='${targetName}']`).value = target.value
		}
	}

	async function handleFormSubmit(forEdit = false, clientId = null) {

		const form = clientBuilderForm
		const formData = getFormData(form)

		const invalidElements = queryElements(".invalid")

		if (invalidElements.length > 0) {
			makeToastNotification("Fix errors first")
			return
		}

		const submittedFilesList = extractFileData(filesClipBoardComponent.getFiles())
		const capturedPhoto = captureProfileComponent.imageData
		
		let response = null
		
		if (forEdit && clientId) {

			response = await window.ipcRenderer.invoke("edit-client", {
				formDataBuffer: {
					formData: formData,
					profilePicture: capturedPhoto.image
				},
				clientId: clientId
			})

		} else {
			
			response = await window.ipcRenderer.invoke("add-client", {
				formData: formData,
				image: capturedPhoto.image,
				files: submittedFilesList
			})

		}

		if (response.status === "success") {
			response.toast.forEach(toast => makeToastNotification(toast))
			transition(renderClientSection)
			return
		}
		
		if (response.fieldErrors) {
			Object.entries(response.fieldErrors).forEach(([name, error]) => {
				const dashedName = camelToDashed(name)
				const cleanName = dashedName.includes("-") ? dashedName.split("-").join(" ") : dashedName
				const cleanErrorMessage = toSentenceCase([cleanName, error[0]].join(" "))
				getById(`${dashedName}-field__info__error`).textContent = error[0]
				makeToastNotification(cleanErrorMessage)
			})
		}

		response.toast.forEach(toast => makeToastNotification(toast))
		
	}
}

/**
 * Extracts file data from a FileList object.
 *
 * @param {FileList | null} inputFiles - The FileList object containing selected files, or null if no files were selected.
 * @returns {Array<Object>} An array of file data objects, each containing 'name', 'size', and 'path' properties.
 */
const extractFileData = (inputFiles) => {
    if (!inputFiles) return []

    return Array.from(inputFiles).map((file) => ({
        name: file.name,
        size: file.size,
        path: file.path
    }))
}
