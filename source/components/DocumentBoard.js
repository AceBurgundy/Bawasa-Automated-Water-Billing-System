// helpers
import {camelToDashed, getById, queryElement } from "../assets/scripts/helper.js"
import makeToastNotification from "../assets/scripts/toast.js"

// components
import { FilePreview } from "./FilePreview.js"

/**
 * Represents a document board for handling file uploads.
 *
 * @class
 * @public
 */
export default class DocumentBoard {
    
    /**
     * Creates a file drop element.
     *
     * @constructor
     * @param {string} name - The name of the field input field.
     * @param {boolean|null} forEdit - Indicates whether the form is for editing.
     * @param {string|null} clientId - The id of the client (forEdit must be true).
     * @param {string} title - The title of the document board.
     */
    constructor(name, forEdit, clientId, title) {

        if (forEdit && !clientId) {
            console.error("Client id must not be null when document board will be used for editing")
            return
        }

        if (!forEdit && clientId) {
            console.error("For edit must be true when clientId is present as this implies that the document board will be used for editing")
            return
        }

        if (!name) {
            console.error("Name is missing")
            return
        }

        if (!title) {
            console.error("Title is missing")
            return
        }

        this.name = name
        this.title = title
        this.forEdit = forEdit
        this.clientId = clientId

        this.uploadedFiles = []
        this.dashedName = camelToDashed(name)

        this.documentBoardId = `${this.dashedName}-field`
        this.documentBoardLabel = `${this.dashedName}-form-field-info-label`
        this.documentBoardErrorId = `${this.dashedName}-form-field__info__error`
        this.documentBoardInputLabelId = `${this.dashedName}-field__drop`
        this.documentBoardInputId = `${this.dashedName}-field__drop__input`
        this.documentBoardDropMessageId = `${this.dashedName}-field__drop__message`

        this.template = `
            <div id="${ this.documentBoardId }" class="form-field">
                <div class="${ this.dashedName }-form-field__info">
                    <label 
                        id="${ this.documentBoardLabel }"
                        class="form-field__info__label">
                        ${ this.title }
                    </label>
                    <p 
                        id="${ this.documentBoardErrorId }"
                        class="form-field__info__error">
                    </p>
                </div>
                <div id="${ this.documentBoardInputLabelId }" class="form-field__drop">
                    <input
                        type="file" 
                        id="${ this.documentBoardInputId }"
                        hidden
                        name="${this.name}"
                        multiple>
                        
                    <div 
                        id="${ this.documentBoardDropMessageId }"
                        class="form-field__drop__message">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="upload"><path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V13a1,1,0,0,0-2,0v6a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12Z"></path></svg>
                        <p>Drop files or click here to upload documents</p>
                        <p>Upload any files from desktop</p>
                    </div>
                </div>
            </div>
        `

        this.loadScripts()
    }

    toString() {
        return this.template
    }

    /**
     * Updates the uploadedFiles array from the input:type hidden element.
     *
     * @param {boolean} noThumbnails - Whether the icons must be updated or not.
     * @returns {void}
     */
    updateInputFiles(noThumbnails = false) {

        const dataTransfer = new DataTransfer()
        
        this.uploadedFiles.forEach(uploadedFile => dataTransfer.items.add(uploadedFile))
        
        const input = getById(this.documentBoardInputId)
        input.files = dataTransfer.files
        
        console.log(dataTransfer.files);

        if (noThumbnails) return

        const addNewFileMessage = getById(this.documentBoardDropMessageId)
        const dropElement = getById(this.documentBoardInputLabelId)
        this.displayThumbnail(addNewFileMessage, dropElement, dropElement)
        
    }

    /**
     * Displays thumbnails for uploaded files.
     *
     * @param {HTMLDivElement} addNewFileMessage - The element displaying the "Drop files or click here to upload documents" message.
     * @param {HTMLLabelElement} dropElement - The drop zone element.
     * @returns {void}
     */
    displayThumbnail(addNewFileMessage, dropElement) {
        
        const didUpload = this.uploadedFiles.length > 0
        addNewFileMessage.style.display = didUpload ? "none" : "flex"

        Array.from(this.uploadedFiles).forEach((file, index) => {

            const filePreviewProperties = {
                deletePreview : this.deletePreview.bind(this),
                index: index, 
                file : file
            }

            const previewExists = queryElement(`[data-preview-file-name="${file.name}"]`)
            if (!previewExists) dropElement.innerHTML += new FilePreview(filePreviewProperties)
        })
    }

    /**
     * Gets the uploaded files.
     *
     * @returns {Array<File>} An array of File objects representing the uploaded files.
     */
    getFiles() {
        return this.uploadedFiles
    }

    /**
     * Deletes a file preview.
     *
     * @async
     * @function
     * @param {string} fileName - The name of the file to be deleted.
     * @returns {boolean} Returns true if the file is successfully deleted, false otherwise.
     */
    async deletePreview(fileName) {
        const fileIndex = this.uploadedFiles.findIndex(uploadFile => uploadFile.name === fileName);

        if (fileIndex !== -1) {

            try {
                this.uploadedFiles.splice(fileIndex, 1);
                this.updateInputFiles();
                
                if (this.forEdit && this.clientId) {
                    const fileDeleted = await window.ipcRenderer.invoke("delete-file", fileName)
                    makeToastNotification(fileDeleted.toast[0])
                    return fileDeleted.status === "success"
                }

                return true;

            } catch (error) {
                console.error(error)
                return false
            }

        }

        // when a user deleted a file but its not in the input list
        return false;
    }

    /**
     * Loads scripts for the document board.
     *
     * @function
     * @private
     */
    loadScripts() {

        setTimeout(() => {
        
            const addNewFileMessage = getById(this.documentBoardDropMessageId)
            const dropElement = getById(this.documentBoardInputLabelId)
            const input = getById(this.documentBoardInputId)

            window.ondragover = event => event.preventDefault()

            dropElement.onclick = () => input.click()

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

            input.addEventListener("change", () => {
                [...input.files].forEach(file => this.uploadedFiles.push(file))
                this.displayThumbnail(addNewFileMessage, dropElement)
            })

        }, 0)
    }
}
