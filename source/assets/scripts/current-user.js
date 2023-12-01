/**
 * Retrieves information about the current user.
 *
 * @async
 * @function currentUser
 * @return {Promise<Object>} resolves with the current logged in user information.
 */
export default async function() {
  return await window.ipcRenderer.invoke('current_user');
};
