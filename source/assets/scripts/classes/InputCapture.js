import { camelToDashed, getById, makeToastNotification } from "../helper.js"
import Webcam from "../Webcam.js"

export default class InputCapture {

    /**
     * Create an InputCapture instance.
     * @param {string} name - The name of the field.
     * @param {boolean} forEdit - Indicates whether the form is for editing.
     * @param {string|null} profilePicture - The profile picture to be displayed (if forEdit is true).
     */
    constructor(name, forEdit, profilePicture) {
        
        this.name = name
        this.forEdit = forEdit
        this.profilePicture = profilePicture
        this.imageData = {}
        this.dashedName = camelToDashed(name)

        this.template = `
            <div id="${this.dashedName}-field" class="form-field image-capture">     
                <video  id="${this.dashedName}-form-field__video" class="form-field__video"  autoplay  playsinline width="360"  height="360"></video>
                <canvas  id="${this.dashedName}-form-field__canvas" class="form-field__canvas"></canvas>
                <div class="form-field__options">
                    <input name="${this.dashedName}" id="${this.dashedName}-form-field__options__input" class="form-field__options__input" type="file" accept="image/*">
                    <button id="${this.dashedName}-form-field__options__capture" class="form-field__options__capture button-primary take-image">
                        Take Image
                    </button>
                </div>
            </div>
        `
        
        this.initializeWebcam()

    }

    toString() {
        return this.template
    }

    /**
     * Show or hide the image capture field based on the number of available webcams.
     * @param {string} dashedName - The dashed name of the field element.
     * @param {number} numWebcams - The number of available webcams.
     */
    showHideImageCapture(numWebcams) {
        const input = getById(`${this.dashedName}-form-field__options__input`)
        const imageCapture = getById(`${this.dashedName}-form-field__options__capture`)

        if (numWebcams > 0) {
            input.style.display = "none"
            imageCapture.style.display = "block"
        } else {
            input.style.display = "block"
            imageCapture.style.display = "none"
        }
    }

    /**
     * Set the original image on a canvas.
     * @param {HTMLCanvasElement} canvas - The canvas element where the original image will be displayed.
     * @returns {void}
     */
    async setOriginalImage(canvas) {

        const image = new Image()
        const context = canvas.getContext('2d')
        const imagePath = await window.ipcRenderer.invoke("get-client-profile-path", this.profilePicture)
        image.src = imagePath

        image.onload = function () {
            canvas.width = image.width
            canvas.height = image.height
            context.drawImage(image, 0, 0)
        }

        this.imageData = {
            base64: null,
            fromInput: true,
            path: imagePath,
            size: null,
            type: null,
            format: this.profilePicture.split(".")[1],
        }

    }

    /**
     * Initialize the webcam and handle image capture.
     */
    initializeWebcam() {

        setTimeout(async () => {

            const canvas = getById(`${this.dashedName}-form-field__canvas`)
            const camera = getById(`${this.dashedName}-form-field__video`)
            const webcam = new Webcam(camera, "user", canvas)

            const inputElement = getById(`${this.dashedName}-form-field__options__input`)
            const captureElement = getById(`${this.dashedName}-form-field__options__capture`)

            await webcam.info().then(data => {
                const numberOfWebCams = data.filter(value => value["kind"] === "videoinput" && value["label"] !== "screen-capture-recorder" ).length
                this.showHideImageCapture(numberOfWebCams)
            })
        
            // Load the client's profile picture when form is set to edit
            if (this.forEdit) await this.setOriginalImage(canvas)
        
            // Handle image capture
            captureElement.onclick = function (event) {

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
        
                // handles turning camera on
                if (classList.contains("take-image")) {
                    webcam.start()
                        .then(() => makeToastNotification("Click capture to capture the image"))
                        .catch(error => {
                            if (error === "Camera access denied") {
                                makeToastNotification(error)
                                inputElement.style.display = "block"
                                target.nextElementSibling.style.display = "none"
                            }
                        })
                    toggleCaptureClass()
                }
        
                // handles capture button click
                if (classList.contains("capture")) {
                    webcam.snap(data => {
                        this.imageData["image"] = { base64: data, fromInput: false }
                        canvas.value = data
                    })
                    webcam.stop()
                    toggleCaptureClass()
                }

            }.bind(this)
        
            inputElement.onchange = function (event) {

                const context = canvas.getContext("2d")
        
                if (inputElement.files && inputElement.files[0]) {

                    const file = inputElement.files[0]

                    if (file.type.startsWith("image/")) {
                        
                        const reader = new FileReader()
        
                        reader.onload = event => {
                            const image = new Image()
        
                            image.onload = () => {
                                canvas.width = image.width
                                canvas.height = image.height
                                context.drawImage(image, 0, 0)
                            }
        
                            image.src = event.target.result
        
                            this.imageData["image"] = {
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
                        makeToastNotification("Please select an image file")
                    }
                }

            }.bind(this)

        }, 0)    
    }
}
