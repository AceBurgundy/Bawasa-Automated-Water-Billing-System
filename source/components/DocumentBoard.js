import { makeToastNotification, camelToDashed, getById, queryElement } from "../assets/scripts/helper.js"
import { FilePreview } from "./FilePreview.js"

export default class DocumentBoard {
    /**
     * Create an InputCapture instance.
     * @param {string} name - The name of the field.
     * @param {boolean} forEdit - Indicates whether the form is for editing.
     * @param {string|null} files - The profile picture to be displayed (if forEdit is true).
     */
    constructor(name, forEdit, files = [], title = "") {

        if (!name) {
            makeToastNotification("Name is missing")
            return
        }

        if (!title) {
            makeToastNotification("Title is missing")
            return
        }

        this.name = name
        this.title = title
        this.forEdit = forEdit
        this.files = files
        this.uploadedFiles = []
        this.dashedName = camelToDashed(name)

        this.documentUploadId = `${this.dashedName}-field`
        this.documentUploadLabel = `${this.dashedName}-form-field-info-label`
        this.documentUploadErrorId = `${this.dashedName}-form-field__info__error`
        this.documentUploadInputLabelId = `${this.dashedName}-field__drop`
        this.documentUploadInputId = `${this.dashedName}-field__drop__input`
        this.documentUploadDropMessageId = `${this.dashedName}-field__drop__message`

        this.template = `
            <div id="${ this.documentUploadId }" class="form-field">
                <div class="${ this.dashedName }-form-field__info">
                    <label 
                        id="${ this.documentUploadLabel }"
                        class="form-field__info__label">
                        ${ this.title }
                    </label>
                    <p 
                        id="${ this.documentUploadErrorId }"
                        class="form-field__info__error">
                    </p>
                </div>
                <label id="${ this.documentUploadInputLabelId }" class="form-field__drop">
                    <input
                        type="file" 
                        id="${ this.documentUploadInputId }"
                        hidden
                        name="${this.name}"
                        multiple>
                        
                    <div 
                        id="${ this.documentUploadDropMessageId }"
                        class="form-field__drop__message">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="upload"><path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V13a1,1,0,0,0-2,0v6a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12Z"></path></svg>
                        <p>Drag and drop or click here to upload documents</p>
                        <p>Upload any files from desktop</p>
                    </div>
                </label>
            </div>
        `

        this.loadScripts()
    }

    toString() {
        return this.template
    }

    /**
     * updates the uploadedFiles array from the input:type hidden element
     * 
     * @param {boolean} noThumbnails - Whether the icons must be updated or not
     * @returns {void}
     */
    updateInputFiles(noThumbnails = false) {

        const dataTransfer = new DataTransfer()
        
        this.uploadedFiles.forEach(uploadedFile => dataTransfer.items.add(uploadedFile))
        
        const input = getById(this.documentUploadInputId)
        input.files = dataTransfer.files
        
        if (noThumbnails) return

        const addNewFileMessage = getById(this.documentUploadDropMessageId)
        const dropElement = getById(this.documentUploadInputLabelId)
        this.displayThumbnail(addNewFileMessage, dropElement, dropElement)
        
    }

    // /**
    //  *
    //  * @param {String} fileType - the value of the key "type" from the File object
    //  * @param {*} event - Event from the reader onload function
    //  * @returns String - path to the icon image file
    //  */
    // async getFileIcon(fileType, event) {
    //     const imagePath = async fileName => await window.ipcRenderer.invoke("get-icon-path", fileName)

    //     if (fileType.includes("image/")) {
    //         return event.target.result
    //     }

    //     if (fileType.includes("application/pdf")) {
    //         return await imagePath("pdf-icon.PNG")
    //     }

    //     if (fileType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
    //         return await imagePath("docx-icon.PNG")
    //     }

    //     if (fileType.includes("application/msword")) {
    //         return await imagePath("doc-icon.PNG")
    //     }

    //     if (
    //         fileType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
    //         fileType.includes("application/vnd.ms-excel") ||
    //         fileType.includes("text/csv")
    //     ) {
    //         return await imagePath("sheet-icon.PNG")
    //     }

    //     return await imagePath("default-icon.png")
    // }

    // async addNewFilePreview(file, event) {
                
    //     const fileIcon = await this.getFileIcon(file.type, event)
    //     const removeId = generateUniqueId("form-field__drop__preview__delete")

    //     const previewElement = generateHTML(`
    //         <div class="form-field__drop__preview" data-preview-file-name="${ file.name }">
    //             <div id="${ removeId }" class="form-field__drop__preview__delete" data-file-name="${ file.name }">
    //                 Remove
    //             </div>
    //             <img class="form-field__drop__preview__image" src="${ fileIcon }" alt="${ file.name }">
    //             <p class="form-field__drop__preview__text">${ file.name }</p>
    //         </div>
    //     `)

    //     setTimeout(() => {
    //         const deleteButton = previewElement.querySelector(`#${removeId}`)

            
    //         deleteButton.onclick = event => {

    //             event.preventDefault()

    //             const fileName = deleteButton.getAttribute("data-file-name")

    //             this.uploadedFiles.forEach((uploadFile, index) => {
    //                 if (uploadFile.name === fileName) this.uploadedFiles.splice(index, 1)
    //             })

    //             this.updateInputFiles()
    //             previewElement.remove()

    //         }

    //     }, 0)

    //     return previewElement
    // }

    displayThumbnail(addNewFileMessage, dropElement) {
        
        if (this.uploadedFiles.length > 0) {
            addNewFileMessage.style.display = "none"
        } else {
            addNewFileMessage.style.display = "flex"
        }

        Array.from(this.uploadedFiles).forEach(file => {
            const previewExists = queryElement(`[data-preview-file-name="${file.name}"]`)
            if (previewExists) return

            const reader = new FileReader()
            reader.onload = event => {
                dropElement.innerHTML += new FilePreview(file, event)
                // dropElement.appendChild(await this.addNewFilePreview(addNewFileMessage, file, event));
            }
            reader.readAsDataURL(file)
        })
    }

    deletePreview() {
        
    }

    /**
     * Initialize the webcam and handle image capture.
     */
    loadScripts() {

        setTimeout(async () => {
        
            const input = getById(this.documentUploadInputId)
            const dropElement = getById(this.documentUploadInputLabelId)
            const addNewFileMessage = getById(this.documentUploadDropMessageId)

            window.ondragover = event => event.preventDefault()

            window.onclick = event => {
                event.preventDefault()

                // delete button was clicked on an element
                if (event.target.classList.contains("form-field__drop__preview__delete")) {
                    const fileName = event.target.getAttribute("data-file-name")

                    this.uploadedFiles.forEach((uploadFile, index) => {
                        if (uploadFile.name === fileName) {
                            this.uploadedFiles.splice(index, 1)
                            event.target.parentElement.remove()
                            //IMPLEMENT FILE DELETE ON PREVIEW REMOVE IF EDIT IS TRUE AND CLIENT ID
                        }
                    })
    
                    this.updateInputFiles()
                }
            }

            dropElement.addEventListener("drop", event => {
                const files = event.dataTransfer.files

                const uploadedFilesNames = this.uploadedFiles.map(file => file.name)
                const fileNames = Array.from(files).map(file => file.name)

                fileNames.forEach((name, index) => {
                    if (!uploadedFilesNames.includes(name)) {
                        this.uploadedFiles.push(files[index])
                    } else {
                        makeToastNotification(`${name} already exists`)
                    }
                })
                this.updateInputFiles()
            })

            input.addEventListener("change", async () => {
                [...input.files].forEach(file => this.uploadedFiles.push(file))
                this.displayThumbnail(addNewFileMessage, dropElement)
            })

        }, 0)
    }
}
