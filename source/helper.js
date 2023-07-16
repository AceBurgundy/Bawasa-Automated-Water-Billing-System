export function transition(callback) {
    const cover = document.createElement("div");
    cover.id = "cover";

    const body = document.body;
    const child = body.firstChild;

    if (child) {
        body.insertBefore(cover, child);

        setTimeout(() => {
            cover.classList.add("up");
        }, 250);

        setTimeout(() => {
            callback();
        }, 800);

        setTimeout(() => {
            cover.classList.remove("up");
            cover.classList.add("down");
        }, 1000);
    } else {
        body.appendChild(cover);
    }
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
