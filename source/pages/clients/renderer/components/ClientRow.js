// helpers
import { queryElements, getById, transition } from "../../../../assets/scripts/helper.js";
import { makeToastNotification } from "../../../../assets/scripts/toast.js";

// main
import renderClientBuilder from "../../../client-builder/renderer/main/client-builder.js";

// dialogs
import { ReconnectClientForm } from "./ReconnectClientForm.js";

// icons
import { icons } from "../../../../assets/scripts/icons.js";

export default class ClientRow {

    constructor(client, index) {

        this.client = client

        const { fullName, mainAddress, accountNumber, birthDate, connectionStatuses, meterNumber, id, phoneNumbers } = client

        const { fullAddress } = mainAddress

        this.clientId = id
                                            
        this.connectionStatus = connectionStatuses.length === 0 ? "Not Set" : connectionStatuses[0].status

        this.tableOptionsId = ["table-info__options", index].join('-')
        this.reconnectButtonId = ["reconnect", index].join('-')
        this.archiveButtonId = ["archive", index].join('-')
        this.exportButtonId = ["export", index].join('-')
        this.editButtonId = ["edit", index].join('-')
        this.rowMenuId = ["row-menu", index].join('-')

        this.template = `
            <div class="table-info" id="client-row-${id}">
                <div id="${ this.tableOptionsId }" class="table-info__options">
                    <p>Menu</p>
                    <div class="table-info__options-item-box">
                        ${ this.ReconnectButton() }
                        <div id="${ this.editButtonId }" class="table-info__options-item">
                            ${
                                icons.editIcon(null, "edit-table-icon")
                            }
                            <p>Edit</p>
                        </div>
                        <div id="${ this.exportButtonId }" class="table-info__options-item">
                            ${
                                icons.printIcon(null, "print-bill-icon")
                            }
                            <p>Export</p>
                        </div>
                        <div id="${ this.archiveButtonId }" class="table-info__options-item">
                            ${
                                icons.archiveIcon(null, "archive-table-icon")
                            }
                            <p>Archive</p>
                        </div>
                    </div>
                </div>
                <div class="table-info__item">
                    <p>${ accountNumber || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ fullName || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ fullAddress || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>+63${phoneNumbers[0]?.phoneNumber || "XXXXXXXXXX" }</p>
                </div>
                <div class="table-info__item">
                    <p>${ birthDate || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ meterNumber || '' }</p>
                </div>
                <div class="table-info__item">
                    <p>${ this.connectionStatus || '' }</p>
                </div>
                <div id="${ this.rowMenuId }" class="table-info__item row-menu">
                    <div class="icon-box">
                        ${
                            icons.menuIcon(null, "menu")
                        }
                    </div>
                </div>
            </div>
        `

        this.loadScripts()
    }

    toString() {
        return this.template
    }

    ReconnectButton() {
        return this.connectionStatus === window.connectionStatusTypes.Disconnected ? `
            <div id="${ this.reconnectButtonId }" class="table-info__options-item">
                ${
                    icons.printIcon(null, "print-bill-icon")
                }
                <p>Reconnect</p>
            </div>` : ''
    }    

    loadScripts() {
        setTimeout(() => {
            const reconnectButton = getById(this.reconnectButtonId)
            const archiveButton = getById(this.archiveButtonId)
            const exportButton = getById(this.exportButtonId)
            const tableOptions = getById(this.tableOptionsId)
            const editButton = getById(this.editButtonId)
            const rowMenu = getById(this.rowMenuId)

            editButton.onclick = async () => {
                transition(async () => await renderClientBuilder(true, this.client))
            }

            exportButton.onclick = async () => {
                const exportDateResult = await window.ipcRenderer.invoke("export-record", { id: this.clientId })
                makeToastNotification(exportDateResult.toast[0]) 
            }

            rowMenu.onclick = () => {
                if (tableOptions.classList.contains("active")) {
                    tableOptions.classList.remove("active")
                    return
                }

                queryElements(".row-menu").forEach(element => {
                    if (element.id !== rowMenu.id) {
                        tableOptions.classList.remove("active")
                        return
                    }
                    tableOptions.classList.add("active")
                })
            }

            if (reconnectButton) {
                reconnectButton.onclick = async () => {
                    const response = await window.ipcRenderer.invoke("get-client", { clientId: this.clientId })
                    if (response.status === "failed") return makeToastNotification(response.toast[0])           
                
                    const client = JSON.parse(response.data)
                    new ReconnectClientForm(client)
                }
            }

            archiveButton.onclick = () => console.log("archive clicked")

        }, 0);
    }
}
