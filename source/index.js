const { app, BrowserWindow } = require("electron");
require("./Pages/Authentication/view.js");
const { resolve, join } = require("path");
const { db } = require("../sequelize_init")

const Client = require("../models/Client");
const Client_Address = require("../models/Client_Address");
const Client_Bill = require("../models/Client_Bill");
const Client_Connection_Status = require("../models/Client_Connection_Status");
const Monthly_Reading = require("../models/Monthly_Reading");
const Partial_Payment = require("../models/Partial_Payment");
const User_Address = require("../models/User_Address");
const User_Phone_Number = require("../models/User_Phone_Number");
const User = require("../models/User");

async function initializeDatabase() {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    // Sync all the models to create the tables in the database
    await db.sync({ force: true });
    console.log("All models were synchronized successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

initializeDatabase();

if (require("electron-squirrel-startup")) {
    app.quit();
}

let icon;

switch (process.platform) {
    case "win32":
        icon = resolve(__dirname, "assets/images", "Logo.ico");
        break;
    case "darwin":
        icon = resolve(__dirname, "assets/images", "Logo.icns");
        break;
    case "linux":
        icon = resolve(__dirname, "assets/images", "Logo.png");
        break;
}

const createWindow = async () => {

    try {

        const mainWindow = new BrowserWindow({
            minHeight: 720,
            minWidth: 1280,
            height: 720,
            width: 1280,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                preload: join(__dirname, "preload.js"),
            },
            icon,
        });

        mainWindow.loadFile(join(__dirname, "index.html"));
    
        
        // const { QueryTypes } = require('sequelize');
        // const users = await sequelize.query("SELECT * FROM `User`", { type: QueryTypes.SELECT });
        // console.log(users);

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }

};


app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

