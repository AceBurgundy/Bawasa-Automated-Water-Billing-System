import { ipcMain } from "electron";

ipcMain.handle("login", async (event, formData) => {

    const data = {
        status: "success",
        message: []
    };

    const fields = [
        { name: 'email', maxLength: 255, errorMessage: "Email cannot be empty" },
        { name: 'password', maxLength: 255, errorMessage: "Password cannot be empty" }
    ];

    let errors = 0;

    for (const field of fields) {

        const value = formData[field.name].trim();

        if (value === "") {
            data.message.push(field.errorMessage);
            errors++;
        } else if (field.name === 'email' && !value.includes("@")) {
            data.message.push("Missing '@'");
            errors++;
        } else if (value.length > field.maxLength) {
            data.message.push(`${field.name} cannot be greater than ${field.maxLength}`);
            errors++;
        }
    }

    if (errors === 2) {
        data.status = "error";
        data.message = ["Missing email and password"];
    } else if (errors > 0) {
        data.status = "error";
    } else {
        data.message = ["Welcome"];
    }

    return data;
});


ipcMain.handle("register", async (event, formData) => {

    const data = {
        status: "success",
        message: []
    };

    const fields = [
        { name: 'firstname', maxLength: 255, errorMessage: "First name cannot be empty" },
        { name: 'lastname', maxLength: 255, errorMessage: "Last name cannot be empty" },
        { name: 'email', maxLength: 255, errorMessage: "Email cannot be empty" },
        { name: 'password', maxLength: 255, errorMessage: "Password cannot be empty" }
    ];

    let errors = 0;

    for (const field of fields) {

        const value = formData[field.name].trim();

        if (value === "") {
            data.message.push(field.errorMessage);
            errors++;
        } else if (value.length > field.maxLength) {
            data.message.push(`Cannot be greater than ${field.maxLength}`);
            errors++;
        }

    }

    if (formData.email.trim().length > 0 && !formData.email.trim().includes("@")) {
        data.message.push("Missing '@'");
        errors++;
    }

    if (errors > 0) {
        data.status = "error";
    } else {
        data.message = "Welcome";
    }

    return data;
});

