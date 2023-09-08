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
 * 
 * @param {String} data - The data from the sequelize object the needed to be shown 
 * @param {*} placeholder - A placeholder that replaces the data if the data is null or undefined. Default: ""
 * @returns string
 */
export function showData(data, placeholder = "") {
	
	if (data !== null && data !== undefined) {
		return data
	} else {
		return placeholder
	}
}

export const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    
export const formatDate = date => date ? new Date(date).toLocaleDateString("en-US", dateOptions) : "";

/**
 * Wraps a callback function in a try-catch block for error handling.
 * @function
 * @param {Function} callback - The callback function to wrap.
 */
export async function tryCatchWrapper(callback) {
	try {
		return await callback()
	} catch (error) {
		console.log(error)
		console.log(`\n${error.name}\n`)
		console.log(`${error.message}`)
	}
}