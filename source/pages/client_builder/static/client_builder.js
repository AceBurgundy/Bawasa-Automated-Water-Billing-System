import { renderBillingSection } from "../../billing/static/billing.js"
import { transition } from "../../../helper.js"
import "../../../../model_helpers.js"
import Webcam from '../../../assets/scripts/Webcam.js';

export async function renderClientBuilder() {
    
    navigator.mediaDevices.getUserMedia({
            video: {
                width: { exact: 360 },
                height: { exact: 360 },
            },
        })
        .then(stream => console.log('Camera access successful!'))   
        .catch(err => console.error('Camera access error:', err));

    const radioInputs = Object.values(window.userRelationshipTypes).map((value) => {
        
        const radio = document.createElement("input")
        radio.type = "radio"
        radio.value = value
        radio.name="relationshipStatus"
        radio.checked = value === "Single"

        return radio

    })
    
    const template = `

        <section id="section-type-container" 
        lass="page client-builder">

            <nav>
                <div id="nav-items">
                    <div id="clients" class="nav-item">Clients</div>
                    <div id="billing" class="nav-item">Billing</div>
                    <div id="logout" class="nav-item">Logout</div>
                </div>
            </nav>

            <section>

                <div id="client-builder" class="section-child">

                    <div class="section-child__top">
                        <div>
                            <img src="assets/images/Logo.png" alt="">
                            <p class="section-child__top-title">BAWASA Automated Billing System</p>
                        </div>
                        <img src="assets/images/Logo.png" alt="">
                    </div>

                    <form class="section-child__center" id="client-registration-form">

                        <p id="new-client-form-title">Client Registration Form</p>

                        <div class="section-child__center-box">

                            <div class="section-child__center-box__section-group">

                                <div class="section-child__center-box__section-group__left">

                                    <div class="section-child__center-box__section">

                                        <div class="section-child__center-box__section__input-box">

                                            <p>Full Name</p>

                                            <div class="section-child__center__child__child">

                                                    <div class="registration-input-box">
                                                        <label>First Name</label>
                                                        <input 
                                                            type="text"
                                                            name="firstName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Middle Name</label>
                                                        <input 
                                                            type="text"
                                                            name="middleName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Last Name</label>
                                                        <input 
                                                            type="text"
                                                            name="lastName">

                                                    </div>
                                                    <div class="registration-input-box">
                                                        <label>Extension</label>
                                                        <input 
                                                            type="text"
                                                            name="extension">

                                                    </div>

                                            </div>

                                        </div>
                                        
                                    </div>
                                    
                                    <div class="section-child__center-box__section">                            

                                        <div class="section-child__center-box__section__input-box no-title">

                                            <div class="section-child__center__child__child">

                                                <div class="registration-input-box radio">

                                                    <label>Relationship status</label>

                                                    <div id="radio-inputs">
                                                        ${radioInputs.map(input => {
                                                            return (`
                                                                <div class="radio-box">
                                                                    ${input.outerHTML}
                                                                    <label>${input.value}</label>
                                                                </div>
                                                            `)
                                                        }).join("")}
                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    
                                    </div>
                                    
                                    <div class="section-child__center-box__section">                            
                                        
                                        <div class="section-child__center-box__section__input-box no-title">

                                            <div class="section-child__center__child__child">

                                                <div class="registration-input-box radio">
                                                    <label>Age</label>
                                                    <input 
                                                        type="date"
                                                        required name="birthDate">

                                                </div>

                                                <div class="registration-input-box radio">
                                                    <label>Age</label>
                                                    <input 
                                                        type="number"
                                                        required 
                                                        name="age" 
                                                        max="70" 
                                                        min="15">

                                                </div>

                                                <div class="registration-input-box radio">
                                                    <label>Email</label>
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        required 
                                                        maxLength="255" 
                                                        minlength="5">

                                                </div>

                                                <div class="registration-input-box radio">
                                                    <label>Occupation</label>
                                                    <input 
                                                        type="text"
                                                        name="occupation" 
                                                        required 
                                                        maxLength="100" 
                                                        minLength="5">

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                </div>

                                <div id="client-register-client-image-box">
                                    <video id="client-register-client-video" autoplay playsinline></video>
                                    <canvas id="client-register-client-image-template"></canvas>
                                    <button id="client-register-client-image-capture" class="button-primary take-image">
                                        Take Image
                                    </button>
                                </div>

                            </div>

                            <div class="section-child__center-box__section">                            
                                
                                <div class="section-child__center-box__section__input-box">

                                    <p>Present Address</p>

                                    <div class="section-child__center__child__child">

                                            <div class="registration-input-box">
                                                <label>Street</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Subdivision</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Barangay</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>City</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Province</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Postal Code</label>
                                                <input 
                                                    type="number"
                                                    name="presentAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Details</label>
                                                <input 
                                                    type="text"
                                                    name="presentAddressDetails" 
                                                    required 
                                                    maxLength="255" 
                                                    minLength="20">

                                            </div>

                                    </div>

                                </div>
                            
                            </div>

                            <div class="section-child__center-box__section">                            
                                    
                                <div class="section-child__center-box__section__input-box">

                                    <p>Main Address</p>

                                    <div class="section-child__center__child__child">

                                            <div class="registration-input-box">
                                                <label>Street</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressStreet" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Subdivision</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressSubdivision" 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Barangay</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressBarangay" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>City</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressCity" 
                                                    required 
                                                    maxLength="100" 
                                                    minLength="5">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Province</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressProvince" 
                                                    required 
                                                    maxLength="50" 
                                                    minLength="10">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Postal Code</label>
                                                <input 
                                                    type="number"
                                                    name="mainAddressPostalCode" 
                                                    required 
                                                    maxLength="4" 
                                                    minLength="4">

                                            </div>
                                            <div class="registration-input-box">
                                                <label>Details</label>
                                                <input 
                                                    type="text"
                                                    name="mainAddressDetails" 
                                                    required 
                                                    maxLength="255" 
                                                    minLength="20">

                                            </div>

                                    </div>

                                </div>
                            
                            </div>

                            <input type="file" id="client-registarion-image" class="hidden">

                            <div class="section-child__center-box__section last">                            
                                <button class="button-primary" id="client-register-submit-button">Create</button>
                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </section>

    </section>
`

    const inputData = {
        firstName: "John",
        lastName: "Doe",
        middleName: "Christopher",
        birthDate: "1990-01-01",
        age: 33,
        email: "john.doe@example.com",
        occupation: "Software Engineer",
        presentAddressStreet: "123 Main St",
        presentAddressSubdivision: "Subdivision Name",
        presentAddressBarangay: "Barangay Name",
        presentAddressCity: "City Name",
        presentAddressProvince: "Province Name",
        presentAddressPostalCode: "1234",
        presentAddressDetails: "Some details about present address",
        mainAddressStreet: "456 Secondary St",
        mainAddressSubdivision: "Other Subdivision",
        mainAddressBarangay: "Other Barangay",
        mainAddressCity: "Other City",
        mainAddressProvince: "Other Province",
        mainAddressPostalCode: "5678",
        mainAddressDetails: "Some details about main address",
    };

    function loadDataToInputs(inputData) {
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
            const name = input.getAttribute("name");
            if (inputData.hasOwnProperty(name)) {
                input.value = inputData[name];
            }
        });
    }
    
    document.getElementById("container").innerHTML += template
    loadDataToInputs(inputData);

    setTimeout(() => {
        document.getElementById("section-type-container").classList.add("active");
    }, 500);

    const canvas = document.getElementById("client-register-client-image-template")
    const camera = document.getElementById("client-register-client-video")

    const webcam = new Webcam(
        camera, 
        "user", 
        canvas
    )
      
    window.onclick = event => {
        
        const elementId = event.target.getAttribute("id")

        //handles form submission
        if (elementId === "client-register-submit-button") {

            event.preventDefault()

            const formData = new FormData(document.getElementById("client-registration-form"))

            //currently logs all data in the form
            for (const [key, value] of formData) {
                console.log(`${key}: ${value}`);
            }

        }

        // prevents multiple radio buttons to be clicked
        if (event.target.type === "radio" && event.target.name === "relationshipStatus") {

            radioInputs.forEach((radio) => {

                if (radio !== event.target) {
                    radio.checked = false;
                }

                radio.checked = true
                
            });
            
        }

        if (elementId === "client-register-client-image-capture") {

            event.preventDefault()

            if (event.target.classList.contains("take-image")) {
                event.target.classList.remove("take-image")
                event.target.classList.add("capture")
                event.target.innerHTML = "Capture"
                camera.style.zIndex = "2"
                canvas.style.zIndex = "1"
                webcam.start()
                    .then(() => {
                    console.log("webcam started");
                    })
                    .catch(err => {
                        console.log(err);
                    });       
                return
                }

            if (event.target.classList.contains("capture")) {
                event.target.classList.remove("capture")
                event.target.classList.add("take-image")
                event.target.innerHTML = "Take Image"
                webcam.snap(data => {
                    const blob = base64ToBlob(data);
                    const file = new File([blob], 'example.png', { type: 'image/png' });
                    setFileInputValue(document.getElementById("client-registarion-image"), file);
                    console.log(document.getElementById("client-registarion-image").value);
                    canvas.value = data
                })
                webcam.stop()
                camera.style.zIndex = "1"
                canvas.style.zIndex = "2"
                return
            }
        }
    }

}

function base64ToBlob(base64Data) {
    const byteString = atob(base64Data.split(",")[1]);
    const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Function to set the file input value
function setFileInputValue(fileInput, file) {
    const fileList = new DataTransfer();
    fileList.items.add(file);
    fileInput.files = fileList.files;
}

