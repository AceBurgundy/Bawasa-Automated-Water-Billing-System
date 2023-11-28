
export const current_user = async () => await window.ipcRenderer.invoke("current_user")