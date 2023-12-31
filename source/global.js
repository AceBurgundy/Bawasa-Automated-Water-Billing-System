import makeToastNotification from './assets/scripts/toast.js';

window.ipcRenderer.on('toast', (event, message) => {
  makeToastNotification(message);
});

window.ipcRenderer.on('console', (event, message) => {
  console.log(`Message from server:\n\n${message}`);
});
