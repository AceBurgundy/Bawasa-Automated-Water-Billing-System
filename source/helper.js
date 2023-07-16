export function transition(callback) {

    const box = document.getElementById("container")

    callback()

    setTimeout(() => {
        box.lastElementChild.style.zIndex = "3"
        box.lastElementChild.classList.add("active")
    }, 1000);

    setTimeout(() => {
        box.firstElementChild.remove()
        box.lastElementChild.style.zIndex = "2"
    }, 2000);
}

/**
 * Creates a toast notification element and appends it to the flashes container.
 * @param {string} message - The message content of the notification.
 */
export function makeToastNotification(message) {
    
    const flashes = document.getElementById("flashes");

    if (!flashes) {
        const flashes = document.createElement("div");
        flashes.id = "flashes";

        if (document.body.firstChild) {
            document.body.insertBefore(flashes, document.body.firstChild);
        } else {
            document.body.appendChild(flashes);
        }
    }

    if (message === "") return;

    const newToast = document.createElement("li");
    newToast.classList.add("message");
    newToast.textContent = message;
    flashes.append(newToast);
    newToast.classList.toggle("active");

    setTimeout(() => {
        newToast.classList.remove("active");
        setTimeout(() => {
            newToast.remove();
        }, 500);
    }, 2000);
}

/**
 * Appends a string to the head of the dom as an element.
 * @param {string} elementString - The string version of an element that needs to be added.
 */
export function appendToHead(elementString) {

    const linkElements = document.head.querySelectorAll('link');
    console.log(linkElements.forEach(pom => console.log(pom)));
    let elementsPresent = []

    linkElements.forEach(child => {
        if (child.outerHTML === elementString) {
            elementsPresent.push(child)
        }
    })

    console.log(elementsPresent);
    if (elementsPresent.length <= 0) {
        document.head.innerHTML += elementString
    }

}