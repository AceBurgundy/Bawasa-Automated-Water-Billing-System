import makeToastNotification from './assets/scripts/toast.js';

window.ipcRenderer.on('toast', (event, message) => {
  makeToastNotification(message);
});
