const { app, BrowserWindow, screen, ipcMain } = require("electron")
const {connectionStatusTypes} = require("../constants.js")
require("./pages/client_builder/views.js")
require("./pages/authentication/view.js")
const { resolve, join } = require("path")
const session = require("../session.js")
require("./pages/clients/views.js")
require("./pages/billing/views.js")

const { db } = require("../sequelize_init")

const Client_Connection_Status = require("../models/Client_Connection_Status")
const Client_Phone_Number = require("../models/Client_Phone_Number.js")
const User_Phone_Number = require("../models/User_Phone_Number")
const Partial_Payment = require("../models/Partial_Payment")
const Client_Address = require("../models/Client_Address")
const User_Address = require("../models/User_Address")
const Client_File = require("../models/Client_File")
const Client_Bill = require("../models/Client_Bill")
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
        const secondScreen = displays[1]

        const mainWindow = new BrowserWindow({
            x: secondScreen.bounds.x,
            y: secondScreen.bounds.y,
            minHeight: 720,
            minWidth: 1280,
            height: 720,
            width: 1280,
            // fullscreen: true,
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
                        model: Client_Bill,
                        as: 'bills',
                        attributes: ['id', 'penalty', 'billAmount', 'paymentStatus', 'dueDate', 'disconnectionDate', 'createdAt'],
                        required: false,
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1,
                      },
                      {
                        model: Client_Connection_Status,
                        as: 'connection',
                        attributes: ['connectionStatus', 'createdAt'],
                        required: false,
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1,
                      }
                ]
            })
	})

    // if (clients.length > 0) {
        
    //     const currentDate = new Date()

    //     for (let client of clients) {
            
    //         const latestBill = client.bills && client.bills.length > 0 ? client.bills[0] : null
    //         const connectionStatus = client.connection && client.connection.length > 0 ? client.connection[0] : null

    //         if (!latestBill) continue
    //         if (!connectionStatus) continue

    //         if (new Date(latestBill.dueDate) === currentDate && connectionStatus === connectionStatusTypes.Connected) {
                
    //             //updates status to due for disconnection
    //             await Client_Connection_Status.create({
    //                 clientId: client.id,
    //                 connectionStatus: connectionStatusTypes.DueForDisconnection,
    //             })
    
    //             // adds penaly to current bill
    //             const penalty = 0
    //             await latestBill.update({
    //                 penalty: penalty,
    //                 billAmount: latestBill.billAmount + penalty,
    //             })
    //         } 

    //         if (new Date(latestBill.disconnectionDate) === currentDate && connectionStatus === connectionStatusTypes.DueForDisconnection) {
    //             //updates status to as disconnected
    //             await Client_Connection_Status.create({
    //                 clientId: client.id,
    //                 connectionStatus: connectionStatusTypes.Disconnected,
    //             })
    //         }
    //     }

    // }

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

app.on("before-quit", () => {
    session.logout()
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

