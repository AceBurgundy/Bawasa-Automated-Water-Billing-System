
import DocumentBoard from "../../../components/DocumentBoard.js"
import InputCapture from "../../../components/InputCapture.js"
import { renderClientSection } from "../../clients/static/clients.js"
import renderBillingSection from "../../billing/static/billing.js"
import { renderProfile } from "../../profile/static/profile.js"
import { getTemplate } from "../templates/clientBuilder.js"
import "../../../utilities/constants.js"

import { 
	makeToastNotification, 
	transition,
	getById,
	queryElement,
	queryElements,
	getFormData,
	camelToDashed,
	toSentenceCase
} from "../../../assets/scripts/helper.js"

/**
 * Renders and manages a client registration or edit form.
 * @param {boolean} edit - Indicates whether the form is in edit mode.
 * @param {object} clientObject - The client data for pre-filling the form in edit mode.
 */
export async function renderClientBuilder(edit, clientObject) {

	console.log("Called client builder");
	let forEdit = edit || null
	let clientData = clientObject || null

	getById("container").innerHTML += getTemplate(forEdit, clientData)

	setTimeout(() => getById("section-type-container").classList.add("active"), 500)
	
	document.onclick = event => {
		
        const targetId = event.target.getAttribute("id")

		switch (targetId) {
			case "billing":
				transition(renderBillingSection)
			break;
			
			case "clients":
				transition(renderClientSection)
			break

            case "profile":
                transition(renderProfile)
            break
		}
	}

	const capture = new InputCapture("clientProfile", forEdit, clientData?.profilePicture )
	queryElement(".content__form-box__group__left").parentElement.innerHTML += capture

	const clientId = forEdit && clientData ? clientData.id : null
	const fileCapture = new DocumentBoard("clientFiles", "Client Documents", forEdit, clientId)
	queryElement(".files").innerHTML = fileCapture

	// Handle form submission
	getById("client-register-submit-button").addEventListener("click", event => {
		event.preventDefault()
		if (forEdit && clientData !== null) {
			handleFormSubmit(forEdit, clientData.id)
		} else {
			handleFormSubmit()
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

	async function handleFormSubmit(forEdit = false, clientId = null) {

		const form = getById("client-form")
		const formData = getFormData(form)

		const invalidElements = queryElements(".invalid")

		if (invalidElements.length > 0) return makeToastNotification("Fix errors first")

		const imageData = capture.imageData
		const documentsArray = extractFileData(fileCapture.getFiles())
		
		let response = null
		
		if (forEdit && clientId) {

			response = await window.ipcRenderer.invoke("edit-client", {
				formDataBuffer: {
					formData: formData,
					profilePicture: imageData.image
				},
				clientId: clientId
			})

		} else {
			
			response = await window.ipcRenderer.invoke("add-client", {
				formData: formData,
				image: imageData.image,
				files: documentsArray
			})

		}

		if (response.status === "success") {

			response.toast.forEach(toast => makeToastNotification(toast))
			transition(renderClientSection)

		} else {

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
}

/**
 * Extracts file data from a FileList object.
 *
 * @param {FileList | null} inputFiles - The FileList object containing selected files, or null if no files were selected.
 * @returns {Array<Object>} An array of file data objects, each containing 'name', 'size', and 'path' properties.
 */
const extractFileData = (inputFiles) => {
    if (!inputFiles) return [];

    return Array.from(inputFiles).map((file) => ({
        name: file.name,
        size: file.size,
        path: file.path
    }));
};
