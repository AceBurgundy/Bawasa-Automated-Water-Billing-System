export function transition(callback) {
	const box = document.getElementById("container");

	callback();

	setTimeout(() => {
		box.lastElementChild.style.zIndex = "3";
		box.lastElementChild.classList.add("active");
        // removeAllEventListeners()
	}, 200);

	setTimeout(() => {
		box.firstElementChild.remove();
		box.lastElementChild.style.zIndex = "2";
	}, 800);
}

/**
 * Creates a toast notification element and appends it to the flashes container.
 * @param {string} message - The message content of the notification.
 */
export function makeToastNotification(message) {
	let flashes = document.getElementById("flashes");

	if (!flashes) {
		const newFlashes = document.createElement("div");
		newFlashes.setAttribute("id", "flashes");

		if (document.body.firstChild) {
			document.body.insertBefore(newFlashes, document.body.firstChild);
		} else {
			document.body.appendChild(newFlashes);
		}

		flashes = newFlashes;
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
	const linkElements = document.head.querySelectorAll("link");
	let elementsPresent = [];

	linkElements.forEach(child => {
		if (child.outerHTML === elementString) {
			elementsPresent.push(child);
		}
	});

	if (elementsPresent.length <= 0) {
		document.head.innerHTML += elementString;
	}
}

/**
 * Clears DOM Head to give way for new ones.
 */
export function clearDOMHead(linkExemptions = [], scriptExemptions = []) {
	const linkElements = document.head.querySelectorAll("link");
	const scriptElements = document.head.querySelectorAll("script");

	linkElements.forEach(link => {
		if (link.outerHTML !== '<link rel="stylesheet" href="assets/styles/root.css">') {
			if (!linkExemptions.includes(link.outerHTML)) {
				link.remove();
			}
		}
	});

	scriptElements.forEach(script => {
		if (!scriptExemptions.includes(script.outerHTML)) {
			script.remove();
		}
	});
}
