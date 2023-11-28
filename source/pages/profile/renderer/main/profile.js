// helpers
import { transition, getById, queryElement, queryElements, getFormData, camelToDashed, toSentenceCase } from "../../../../assets/scripts/helper.js"
import makeToastNotification from "../../../../assets/scripts/toast.js"

// user
import { current_user } from "../../../../assets/scripts/user.js"

// main
import client from "../../../clients/renderer/main/clients.js"
import billing from "../../../billing/renderer/main/billing.js"

// templates
import profileTemplate from "../templates/profile.js"

// constants
import "../../../../utilities/constants.js"

/**
 * Renders and manages a user registration or edit form.
 * 
 * @async
 * @function profile
 * @param {boolean} edit - Indicates whether the form is in edit mode.
*/
export default async function (forEdit = false) {

    const userData = await current_user()

	getById("container").innerHTML += profileTemplate(forEdit, userData)
	setTimeout(() => getById("section-type-container").classList.add("active"), 500)

	window.onclick = event => {
		
		const { target } = event
		const targetText = target.textContent.trim()
		const elementId = target.id

		switch (elementId) {
			case "billing":
				transition(billing)
				break;
			
			case "clients":
				transition(client)
				break

			case "user-register-submit-button":
				event.preventDefault()

				if (targetText === "Edit") {
					transition(async () => await profile(true))
				} else {
					handleFormSubmit(userData.id)
				}
				break
		}

        if ((target.tagName === "INPUT" || target.tagName === "SELECT") && !forEdit) {
            makeToastNotification(`Click "Edit" at the bottom to change values`);
        }
	}

	// Handle merging addresses
	let duplicateAddress = false

    //clears all input if duplicate address was unchecked else refills their values
    if (document.body.contains(getById("merge-addresses-checkbox"))) {
        getById("merge-addresses-checkbox").onchange = event => {
            duplicateAddress = event.target.checked
            const addressType = duplicateAddress ? "present" : "main"
            const inputFields = queryElements(`input[name^='${addressType}']`)
    
            inputFields.forEach(input => {
                const targetName = input.name.replace(addressType, "main")
                const targetInput = queryElement(`input[name='${targetName}']`)
                targetInput.value = duplicateAddress ? input.value : ""
            })
        }    
    }
      
    /*
        if duplicate address is checked,
        any values placed inside present address fields also duplicates to main address fields 
    */
    getById("user-form").onkeyup = ({ target }) => {
		if (duplicateAddress) {
			const targetName = target.getAttribute("name").replace("present", "main")
			queryElement(`input[name='${targetName}']`).value = target.value
		}
	}

	async function handleFormSubmit(userData) {

        const userId = userData.id

		const form = getById("user-form")
		const formData = getFormData(form)

		const invalidElements = queryElements(".invalid")
		if (invalidElements.length > 0) return makeToastNotification("Fix errors first")

		const imageData = capture.imageData
		
		let response = null
		
        response = await window.ipcRenderer.invoke("edit-user", {
            formDataBuffer: {
                formData: formData,
                profilePicture: imageData.image
            },
            userId: userId
        })

		if (response.status === "success") {

			response.toast.forEach(toast => makeToastNotification(toast))
			transition(renderuserSection)

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
