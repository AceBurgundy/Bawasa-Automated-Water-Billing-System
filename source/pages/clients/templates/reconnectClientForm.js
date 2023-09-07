export const reconnectClientForm = client => {

    const show = (data, placeholder = "") => data !== null || data !== undefined ? data : placeholder
    const billAmount = show(client.Client_Bills[0].billAmount)

    return `
        <form id="reconnect-form">
            <p id="reconnect-form-title">Reconnection for Mr/Mrs ${show(client.fullName)}</p>
            <div id="reconnect-form__input-box">
                <p id="reconnect-form-input-box-header-error"></p>
                <p id="reconnect-form__input-box__warning">A total amount of ${billAmount} must be paid first to complete reconnection</p>
                <input 
                    id="reconnect-form-input-box-input" 
                    type="number"
                    name="reconnectAmount"
                    data-total="${billAmount}"
                    value=""
                    required>
            </div>
            <div id="reconnect-form-buttons">
                <button class="button-primary" id="reconnect-form-close">Cancel</button>
                <button class="button-primary" id="reconnect-form-submit" data-client-id="${show(client.id)}">Reconnect</button>
            </div>
        </form>
    `
}