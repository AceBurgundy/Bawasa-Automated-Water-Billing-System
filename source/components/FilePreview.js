import { getById } from "../assets/scripts/helper.js"

const fileTypeIcons = {
    "application/pdf" : "pdf-icon.PNG",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "docx-icon.PNG",
    "application/msword" : "doc-icon.PNG",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "sheet-icon.PNG",
    "application/vnd.ms-excel" : "sheet-icon.PNG",
    "text/csv": "sheet-icon.PNG"
}

const getFileIcon = fileType => Object.keys(fileTypeIcons).find(type => fileType.includes(type)) || "default-icon.png";

export class FilePreview {

    /**
     *  The constructor function creates a preview element for a file.
     *  Used in conjuction with DocumentBoard as DocumentBoard calls this class
     *  to generate its preview elements
     * 
     *  @param {Object} props - An object containing the following properties:
     *  @param {method} props.deletePreview - The method to delete the preview (From DocumentBoard).
     *  @param {number} props.index - The index will be used to uniquely identify each instance of FilePreview
     *  @param {File} props.file - The file for which the preview is created.
     */
    constructor(props) {

        this.deletePreview = props.deletePreview
        this.index = props.index
        this.file = props.file

        this.deleteButtonId = ["form-field-drop-preview-delete", this.index].join('-')
        this.imageId = ["form-field-drop-preview-image", this.index].join('-')
        this.previewId = ["form-field-drop-preview", this.index].join('-')

        this.template = `
            <div id="${ this.previewId }" class="form-field__drop__preview" data-preview-file-name="${ this.file.name }">
                <div id="${ this.deleteButtonId }" class="form-field__drop__preview__delete">
                    Remove
                </div>
                <img id="${ this.imageId }" class="form-field__drop__preview__image" src="" alt="${ this.file.name }">
                <p class="form-field__drop__preview__text">${ this.file.name }</p>
            </div>
        `

        this.loadScript()
    }

    toString = () => this.template
       
    async getFileIcon() {
        const fileIsImage = this.file.type.includes("image/")
        const iconFileName = getFileIcon(this.file.type)

        const getIconFilePath = async iconFileName => await window.ipcRenderer.invoke("get-icon-path", iconFileName)

        // if image, return the files path as the src for the image else, use an icon
        return fileIsImage ? this.file.path : await getIconFilePath(iconFileName)
    }

    loadScript() {
        setTimeout(async () => {

            const deleteButton = getById(this.deleteButtonId)
            const preview = getById(this.previewId)
            const image = getById(this.imageId)

            if (image) image.src = await this.getFileIcon()

            deleteButton.onclick = event => {
                event.stopPropagation()

                // hide preview temporarily
                preview.style.display = "none"

                const deleted = this.deletePreview(this.file.name)

                if (deleted) {
                    preview.remove()
                } else {
                    preview.style.display = "block"
                }
            }

        }, 0)
    }
}
