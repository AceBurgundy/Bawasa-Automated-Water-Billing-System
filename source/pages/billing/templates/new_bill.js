export function addNewBill(formData) {
    
    const template = `
        <dialog id="new-bill-box">
            <form id="new-bill-form">
                <p id="new-bill-form-title">New Reading for Mr/Mrs ${formData?.fullName}</p>
                <div id="new-bill-form__input-box">
                ${
                    formData.Client_Bills.length === 0 ? '<p id="new-bill-form__input-box__warning">No bill will be created as this will be the clients very first consumption record</p>' 
                    : `<p id="new-bill-form__input-box__warning">Mr/Mrs ${formData?.lastName}'s previous reading is ${formData?.Client_Bills[0].firstReading}</p>`
                }
                    <div id="new-bill-form-input-box-header">
                        <label>Reading</label>
                        <p id="new-bill-form-input-box-header-error"> </p>
                    </div>
                    <input 
                        id="new-bill-form-input-box-input" 
                        type="number" 
                        name="reading" 
                        value="12"
                        required>

                </div>
                <div id="new-bill-form-buttons">
                    <button class="button-primary" id="new-bill-form-close">Cancel</button>
                    <button class="button-primary" id="new-bill-form-submit" data-client-id="${formData?.id}" data-bill-id="${formData?.Client_Bills[0]?.id !== undefined ? formData?.Client_Bills[0]?.id : ''}">Add</button>
                </div>
            </form>
        </dialog>
    `

    return template
}
