import { generateUniqueId, getById } from "../assets/scripts/helper.js"

const fileTypeIcons = {
    "application/pdf" : "pdf-icon.PNG",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "docx-icon.PNG",
    "application/msword" : "doc-icon.PNG",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "sheet-icon.PNG",
    "application/vnd.ms-excel" : "sheet-icon.PNG",
    "text/csv": "sheet-icon.PNG"
}

const getFileIcon = filetype => {
    for (let type in Object.keys(fileTypeIcons)) {
        if (filetype.includes(type)) {
            return fileTypeIcons[type]
        }
    }
    return "default-icon.png"
}

export class FilePreview {
    constructor(file, event, deletePreview, forEdit = false, clientId = false, ) {

        this.deleteButtonId = generateUniqueId("form-field-drop-preview-delete")
        this.imageId = generateUniqueId("form-field-drop-preview-image")
        this.fileName = file.name
        this.clientId = clientId
        this.forEdit = forEdit
        this.event = event
        this.file = file

        this.previewId = this.id

        this.template = `
            <div id="${ this.previewId }" class="form-field__drop__preview" data-preview-file-name="${file.name}">
                <div id="${this.deleteButtonId}" class="form-field__drop__preview__delete" data-file-name="${file.name}">
                    Remove
                </div>
                <img id="${ this.imageId }" class="form-field__drop__preview__image" src="" alt="${file.name}">
                <p class="form-field__drop__preview__text">${file.name}</p>
            </div>
        `

        this.loadScript()
    }

    toString() {
        return this.template
    }
            
    /**
     * 
     * @param {String} fileType - the value of the key "type" from the File object 
     * @returns String - path to the icon image file
     */
    async getFileIcon() {

        const fileType = this.file.type
        const fileTypeIsImage = fileType.includes("image/")
        const targetResult = getFileIcon(fileType)

        const imagePath = async fileName => await window.ipcRenderer.invoke("get-icon-path", fileName)

        return fileTypeIsImage ? targetResult : imagePath(getFileIcon(fileType))

    }

    loadScript() {
        setTimeout(async () => {

            const image = getById(this.imageId)
            const preview = getById(this.previewId)

            if (image) image.src = await this.getFileIcon()

            preview.onclick = event => {

            }

        }, 0)
    }
}
