import { app, BrowserWindow } from "electron";
import "./Pages/Authentication/view.js";
import { resolve, join } from "path";

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

        await AppDataSource.initialize();
        console.log('Database connection established.');
        
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

