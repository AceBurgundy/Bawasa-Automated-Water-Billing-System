import { renderCLIENTBuilder } from "../../../CLIENTBuilder/static/CLIENTBuilder.js";
import { ReconnectCLIENTForm } from "../ReconnectCLIENTForm.js";

import { 
    getById,
    makeToastNotification,
    queryElements,
    showData,
    transition 
} from "../../../../assets/scripts/helper.js";

export default class CLIENTRow {

    constructor(Client) {

        this.Client = Client

        const { fullName, accountNumber, birthDate, connectionStatuses, meterNumber, id, phoneNumbers } = Client

        this.CLIENTId = id
                                            
        this.connectionStatus = connectionStatuses.length === 0 ? "Not Set" : connectionStatuses[0].status

        this.editButtonId = ["edit-", id].join('')
        this.exportButtonId = ["export-", id].join('')
        this.reconnectButtonId = ["reconnect-", id].join('')
        this.archiveButtonId = ["archive-", id].join('')
        this.rowMenuId = ["row-menu", id].join('')

        this.template = `
            <div class="table-info" id="Client-row-${id}">
                <div class="table-info__options" data-Client-id="${id}">
                    <p>Menu</p>
                    <div class="table-info__options-item-box" data-Client-id="${id}">
                        ${ this.ReconnectButton() }
                        <div id="${ this.editButtonId }" class="table-info__options-item">
                            <svg class="edit-table-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,18H9.24a1,1,0,0,0,.71-.29l6.92-6.93h0L19.71,8a1,1,0,0,0,0-1.42L15.47,2.29a1,1,0,0,0-1.42,0L11.23,5.12h0L4.29,12.05a1,1,0,0,0-.29.71V17A1,1,0,0,0,5,18ZM14.76,4.41l2.83,2.83L16.17,8.66,13.34,5.83ZM6,13.17l5.93-5.93,2.83,2.83L8.83,16H6ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>
                            <p>Edit</p>
                        </div>
                        <div id="${ this.exportButtonId }" class="table-info__options-item">
                            <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                            <p>Export</p>
                        </div>
                        <div id="${ this.archiveButtonId }" class="table-info__options-item">
                            <svg class="archive-table-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,13h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2ZM19,3H5A3,3,0,0,0,4,8.82V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V8.82A3,3,0,0,0,19,3ZM18,18a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V9H18ZM19,7H5A1,1,0,0,1,5,5H19a1,1,0,0,1,0,2Z"/></svg>
                            <p>Archive</p>
                        </div>
                    </div>
                </div>
                <div class="table-info__item">
                    <p>${ showData(fullName) }</p>
                </div>
                <div class="table-info__item">
                    <p>
                        ${ showData(address.fullAddress) }
                    </p>
                </div>
                <div class="table-info__item">
                    <p>+63${showData(phoneNumbers[0]?.phoneNumber, "XXXXXXXXXX")}</p>
                </div>
                <div class="table-info__item">
                    <p>${showData(birthDate)}</p>
                </div>
                <div class="table-info__item">
                    <p>${ showData(meterNumber) }</p>
                </div>
                <div class="table-info__item">
                    <p>${ showData(connectionStatus) }</p>
                </div>
                <div id="${ this.rowMenuId }" class="table-info__item row-menu" data-Client-id="${id}">
                    <div class="icon-box">
                        <svg class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12,7a2,2,0,1,0-2-2A2,2,0,0,0,12,7Zm0,10a2,2,0,1,0,2,2A2,2,0,0,0,12,17Zm0-7a2,2,0,1,0,2,2A2,2,0,0,0,12,10Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        `
    }

    ReconnectButton() {
        return this.connectionStatus === window.CONNECTION_STATUS_TYPES.Disconnected ? `
            <div id="${ this.reconnectButtonId }" class="table-info__options-item">
                <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                <p>Reconnect</p>
            </div>` : ''
    }    

    loadScripts() {
        setTimeout(() => {
            const rowMenu = getById(this.rowMenuId)
            const editButton = getById(this.editButtonId)
            const exportButton = getById(this.exportButtonId)
            const reconnectButton = getById(this.reconnectButtonId)
            const archiveButton = getById(this.archiveButtonId)

            editButton.onclick = async () => {
                const CLIENTData = Object.values(CLIENTs).filter(Client => Client.id === parseInt(this.CLIENTId))
                transition(() => { renderCLIENTBuilder(true, CLIENTData) })
            }

            exportButton.onclick = async () => {
                const exportDateResult = await window.ipcRenderer.invoke("export-record", { id: this.CLIENTId })
                makeToastNotification(exportDateResult.toast[0]) 
            }

            rowMenu.onclick = () => {
                queryElements(".row-menu").forEach(element => {
                    if (element.id === this.rowMenuId) {
                        element.classList.add("active")
                    } else {
                        element.classList.remove("active")
                    }
                })
            }

            if (reconnectButton) {
                reconnectButton.onclick = async () => {
                    const response = await window.ipcRenderer.invoke("get-Client", { CLIENTId: this.CLIENTId })
                    if (response.status === "failed") return makeToastNotification(response.toast[0])           
                
                    const Client = JSON.parse(response.data)
                    new ReconnectCLIENTForm(Client)
                }
            }

            archiveButton.onclick = () => {
                console.log("archive clicked");
            }

        }, 0);
    }
}
