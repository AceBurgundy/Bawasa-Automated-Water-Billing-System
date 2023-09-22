import { makeToastNotification, camelToDashed, getById, queryElement, generateHTML } from "../helper.js"

export default class DocumentBoard {

    /**
     * Create an InputCapture instance.
     * @param {string} name - The name of the field.
     * @param {boolean} forEdit - Indicates whether the form is for editing.
     * @param {string|null} files - The profile picture to be displayed (if forEdit is true).
     */
    constructor(name, title = '', forEdit, files = []) {

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
        this.dashedName = camelToDashed(name)

        this.template = `
            <div id="${this.dashedName}-field" class="form-field">
                <div class="${this.dashedName}-form-field__info">
                    <label 
                        id="${this.dashedName}-form-field__info__label"
                        class="form-field__info__label">
                        ${this.title}
                    </label>
                    <p 
                        id="${this.dashedName}-form-field__info__error"
                        class="form-field__info__error">
                    </p>
                </div>
                <label id="${this.dashedName}-field__drop" class="form-field__drop">
                    <input
                        type="file" 
                        id="${this.dashedName}-field__drop__input"
                        hidden
                        name="${this.name}"
                        multiple>
                        
                    <div id="${this.dashedName}-field__drop__message"
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

    /**
     * 
     * @returns {String} - The div html template string of drop element
     */
    toString() {
        return this.template
    }

    /**
     * 
     * @returns {Files[]} - The value of the input.files
     */
    getFiles() {
        const input = getById(`${this.dashedName}-field__drop__input`)
        return input.files
    }

    /**
     * Initialize the webcam and handle image capture.
     */
    loadScripts() {

        setTimeout(async () => {

            const input = getById(`${this.dashedName}-field__drop__input`)
            const dropElement = getById(`${this.dashedName}-field__drop`)
            const addNewFileMessage = getById(`${this.dashedName}-field__drop__message`)

            const uploadedFiles = []
        
            const updateInputFiles = (uploadedFiles, input, doNotDisplayThumbnails = false) => {
                const dataTransfer = new DataTransfer()
                uploadedFiles.forEach(uploadedFile => dataTransfer.items.add(uploadedFile))
                input.files = dataTransfer.files
                
                if (doNotDisplayThumbnails) {
                    return
                } else {
                    displayThumbnail(input.files)
                }
            } 
        
            window.addEventListener('dragover', event => {
                event.preventDefault()
            })
        
            dropElement.addEventListener('drop', event => {

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

            })
        
            input.addEventListener('change', async () => {
                [...input.files].forEach(file => uploadedFiles.push(file))
                displayThumbnail(uploadedFiles)
            })

            /**
             * 
             * @param {String} fileType - the value of the key "type" from the File object 
             * @param {*} event - Event from the reader onload function
             * @returns String - path to the icon image file
             */
            async function getFileIcon(fileType, event) {

                const imagePath = async (fileName) => await window.ipcRenderer.invoke("get-file-profile-path", fileName)
                
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
            const displayThumbnail = files => {

                const computedStyle = window.getComputedStyle(addNewFileMessage)
                const displayPropertyValue = computedStyle.getPropertyValue("display")

                if (displayPropertyValue === "flex") addNewFileMessage.style.display = "none"

                Array.from(files).forEach(file => {

                    const previewExists = queryElement(`[data-preview-file-name="${file.name}"]`)
                    if (previewExists) return
                
                    const addNewFilePreview = async (fileName, event) => {

                        const previewElement = generateHTML(`
                            <div class="form-field__drop__preview" data-preview-file-name="${fileName}">
                                <div class="form-field__drop__preview__delete" data-file-name="${fileName}">
                                    Remove
                                </div>
                                <img class="form-field__drop__preview__image" src="${await getFileIcon(file.type, event)}" alt="${fileName}">
                                <p class="form-field__drop__preview__text">${fileName}</p>
                            </div>
                        `)
                
                        const deleteButton = previewElement.querySelector(".form-field__drop__preview__delete")

                        deleteButton.addEventListener("click", function(event) {
                            
                            event.preventDefault()
                
                            const fileName = this.getAttribute("data-file-name")
                
                            uploadedFiles.forEach((file, index) => {
                                if (file.name === fileName) uploadedFiles.splice(index, 1)
                            })
                
                            if (uploadedFiles.length === 0) {
                                addNewFileMessage.style.display = "flex"
                            }
                
                            updateInputFiles(uploadedFiles, input, true)
                
                            previewElement.remove()
                        })
                
                        return previewElement
                    }
                
                    const reader = new FileReader()
                    reader.onload = async function(event) {
                        dropElement.appendChild(await addNewFilePreview(file.name, event))
                    }
                    reader.readAsDataURL(file)
                })                

            }


        }, 0)    
    }
}
