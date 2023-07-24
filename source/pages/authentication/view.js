const { userRelationshipTypes, userTypes } = require("../../../model_helpers");
const User = require("../../../models/User");
const session = require("../../../session");
const { ipcMain } = require("electron");

ipcMain.handle("login", async (event, formData) => {
    const data = {
        status: "error",
        message: [],
    };

    const fields = [
        {
            name: "email",
            maxLength: 255,
            errorMessage: "Email cannot be empty",
        },
        {
            name: "password",
            maxLength: 255,
            errorMessage: "Password cannot be empty",
        },
    ];

    let errors = 0;

    for (const field of fields) {
        const value = formData[field.name].trim();

        if (value === "") {
            data.message.push(field.errorMessage);
            errors++;
        } else if (field.name === "email" && !value.includes("@")) {
            data.message.push("Missing '@'");
            errors++;
        } else if (value.length > field.maxLength) {
            data.message.push(
                `${field.name} cannot be greater than ${field.maxLength}`
            );
            errors++;
        }
    }

    let user = null;

    try {
        user = User.findOne({
            where: {
                email: formData.email,
            },
        });
    } catch (error) {
        console.log(error.message);
    }

    if (!user) {
        data.message.push(`User with email ${formData.email} not found`);
        errors++;
    } else {
        if (user.password !== formData.password) {
            data.message.push("Password does not match");
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
        session.login(user.id);
    }

    return data;
});

ipcMain.handle("register", async (event, formData) => {
    const data = {
        status: "success",
        message: [],
    };

    const fields = [
        {
            name: "firstname",
            maxLength: 255,
            errorMessage: "First name cannot be empty",
        },
        {
            name: "lastname",
            maxLength: 255,
            errorMessage: "Last name cannot be empty",
        },
        {
            name: "email",
            maxLength: 255,
            errorMessage: "Email cannot be empty",
        },
        {
            name: "password",
            maxLength: 255,
            errorMessage: "Password cannot be empty",
        },
        {
            name: "relationshipStatus",
            maxLength: 255,
            errorMessage: "Relationship status cannot be empty",
        },
        { name: "birthdate", errorMessage: "Birthdate cannot be empty" },
        { name: "age", errorMessage: "Age cannot be empty" },
        {
            name: "userType",
            maxLength: 255,
            errorMessage: "User type cannot be empty",
        },
    ];

    let errors = 0;

    for (const field of fields) {
        const value = formData[field.name].trim();

        if (value === "") {
            data.message.push(field.errorMessage);
            errors++;
        }

        if (field.hasOwnProperty(maxLength)) {
            if (value.length > field.maxLength) {
                data.message.push(`Cannot be greater than ${field.maxLength}`);
                errors++;
            }
        }
    }

    if (
        formData.email.trim().length > 0 &&
        !formData.email.trim().includes("@")
    ) {
        data.message.push("Missing '@'");
        errors++;
    }

    if (!userRelationshipTypes.includes(formData.relationshipStatus.value.trim())) {
        data.message.push("Relationship status not among the choices");
        errors++;
    }

    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2]\d|3[0-1])\/\d{4}$/;
    if (!formData.birthdate.trim().match(dateRegex)) {
        data.message.push("Invalid date format. Please use mm/dd/yyyy");
        errors++;
    }

    const enteredDate = new Date(formData.trim().birthdate);
    if (isNaN(enteredDate.getTime())) {
        data.message.push("Please enter a valid date");
        errors++;
    }

    if (formData.age.value.trim() < 15 && formData.age.value.trim() > 70) {
        data.message.push("Age limit is 70");
        errors++;
    }

    if (!userTypes.includes(value)) {
        data.message.push("User type not among the choices");
        errors++;
    }

    let user = null;

    try {
        user = User.findOne({
            where: {
                email: formData.email,
            },
        });
    } catch (error) {
        console.log(error.message);
    }

    if (user && user.password === formData.password) {
        data.message.push(`User is already registered`);
        errors++;
    }

    if (errors > 0) {
        data.status = "error";
    } else {
        data.message = "Welcome";
    }

    return data;
});

ipcMain.handle("current_user", async event => {
    return session.current_user()
})