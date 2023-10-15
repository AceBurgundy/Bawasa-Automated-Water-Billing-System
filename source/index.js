const { connectionStatusTypes } = require("./utilities/constants.js")
const { app, BrowserWindow, screen, ipcMain } = require("electron")
const { tryCatchWrapper } = require("./utilities/helpers.js")
const { db } = require("./utilities/sequelize.js")
const session = require("./utilities/session.js")
const { resolve, join } = require("path")

// views
require("./pages/clientBuilder/views.js")
require("./pages/authentication/view.js")
require("./pages/clients/views.js")
require("./pages/billing/views.js")
require("./pages/profile/view.js")
require("./utilities/export.js")

const ClientConnectionStatus = require("../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../models/ClientPhoneNumber.js")
const UserPhoneNumber = require("../models/UserPhoneNumber")
const PartialPayment = require("../models/PartialPayment")
const RecoveryCode = require("../models/RecoveryCode.js")
const ClientAddress = require("../models/ClientAddress")
const UserAddress = require("../models/UserAddress")
const ClientFile = require("../models/ClientFile")
const ClientBill = require("../models/ClientBill")
const Client = require("../models/Client")
const User = require("../models/User")

async function initializeDatabase() {
	try {
		await db.authenticate()
		console.log("Connection has been established successfully.")

		await db.sync({ force: true })
		console.log("All models were synchronized successfully.")
	} catch (error) {
		console.error("Unable to connect to the database:", error)
	}
}

// initializeDatabase()

if (require("electron-squirrel-startup")) {
    app.quit()
}

let icon

switch (process.platform) {
    case "win32":
        icon = resolve(__dirname, "assets/images", "Logo.ico")
        break
    case "darwin":
        icon = resolve(__dirname, "assets/images", "Logo.icns")
        break
    case "linux":
        icon = resolve(__dirname, "assets/images", "Logo.png")
        break
}

const createWindow = async () => {

    try {

        const displays = screen.getAllDisplays()
        const availableScreen = displays.length > 1 ? displays[0] : displays[0]

        const mainWindow = new BrowserWindow({
            x: availableScreen.bounds.x,
            y: availableScreen.bounds.y,
            minHeight: 720,
            minWidth: 1280,
            height: 720,
            width: 1280,
            fullscreen: true,
            // autoHideMenuBar: true,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                preload: join(__dirname, "preload.js"),
            },
            icon,
        })

        mainWindow.loadFile(join(__dirname, "index.html"))
        mainWindow.webContents.openDevTools()

        session.logout()

	    const clients = await tryCatchWrapper(async () => {
            return await Client.findAll({
                include: [
                    {
                        model: ClientBill,
                        as: 'Bills',
                        attributes: ['id', 'penalty', 'total', 'status', 'dueDate', 'disconnectionDate', 'createdAt'],
                        required: false,
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1,
                      },
                      {
                        model: ClientConnectionStatus,
                        as: 'connectionStatuses',
                        attributes: ['status', 'createdAt'],
                        required: false,
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1,
                      }
                ]
            })
	})

    if (clients && clients.length > 0) {

        const { Connected, DueForDisconnection, Disconnected } = connectionStatusTypes
                
        for (let client of clients) {

            const latestBill = client.bills && client.bills.length > 0 ? client.bills[0] : null;
            const connectionStatus = client.connectionStatuses && client.connectionStatuses.length > 0 ? client.connectionStatuses[0].status : null;
            
            if (!latestBill) continue;
            if (!connectionStatus) continue;
            if (!latestBill.dueDate) continue

            if (latestBill.status === "paid") continue

            const billDueDate = new Date(latestBill.dueDate);
            const billDisconnectionDate = new Date(latestBill.disconnectionDate);
        
            const current = {
                day: new Date().getDate(),
                month: new Date().getMonth()
            }

            const due = {
                day: billDueDate.getDate(),
                month: billDueDate.getMonth()
            }

            const disconnection = {
                day: billDisconnectionDate.getDate(),
                month: billDisconnectionDate.getMonth()
            }

            if (current.day >= due.day && current.month >= due.month && connectionStatus === Connected) {

                tryCatchWrapper(async () => {
                    await ClientConnectionStatus.create({
                        clientId: client.id,
                        status: DueForDisconnection,
                    });
                })

                // Adds penalty to current bill
                const penalty = 5;

                tryCatchWrapper(async () => {
                    await latestBill.update({
                        penalty: penalty,
                        total: latestBill.total + penalty,
                    });
                })

            }
        
            if (current.day >= disconnection.day && current.month >= disconnection.month && connectionStatus === DueForDisconnection) {

                tryCatchWrapper(async () => {
                    await ClientConnectionStatus.create({
                        clientId: client.id,
                        status: Disconnected,
                    });
                })
            }
        }        

    }

    } catch (error) {
        console.error('Error connecting to the database:', error)
    }

}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

ipcMain.handle("current_user", async event => {
    return await session.current_user()
})

app.on("before-quit", () => {
    session.logout()
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

