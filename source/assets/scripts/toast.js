import {getById} from './helper.js';

/**
 * Creates a toast notification element and appends it to the flashes container.
 * @function
 * @param {String|Array<string>} message - The message or list of messages which will be rendered.
 */
export default function makeToastNotification(message) {
  const messageIsArray = Array.isArray(message);

  if (messageIsArray) {
    message.forEach(messageItem => {
      return makeToastNotification(messageItem);
    });
    return;
  }

  if (message && message.toString().trim().length <= 0) {
    console.error('Toast notification requires a non-empty message');
    return;
  }

  let toastBox = getById('flashes');

  if (!toastBox) {
    const newBox = document.createElement('div');
    newBox.id = 'flashes';
    document.body.insertBefore(newBox, document.body.firstChild || null);
    toastBox = newBox;
  }

  const toast = document.createElement('dialog');
  toast.classList.add('message');
  toast.textContent = message;

  toastBox.append(toast);
  toast.show();

  setTimeout(() => {
    toast.classList.add('close');
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}
