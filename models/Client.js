const Client_Address = require("./Client_Address")
const { validations } = require("../constants")
const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize");
const Client_File = require("./Client_File");

const Client = db.define(
    "Client",

    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        accountNumber: {
            type: DataTypes.STRING(7),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Account Number must be provided"
                },
                notEmpty: {
                    msg: "Account Number cannot be left blank"
                }
            }
        },

        firstName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First name is required",
                },
                notEmpty: {
                    msg: "First name cannot be left blank",
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "First name can only contain letters and spaces",
                }
            },
        },

        middleName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Middle name is required",
                },
                notEmpty: {
                    msg: "Middle name cannot be left blank",
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Middle name can only contain letters",
                },
            },
        },

        lastName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last name is required",
                },
                notEmpty: {
                    msg: "Last name cannot be left blank",
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Last name can only contain letters",
                },
            },
        },

        extension: {
            type: DataTypes.STRING(10),
        },

        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.middleName
                    .charAt(0)
                    .toUpperCase()}. ${this.lastName}`;
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!");
            },
        },

        relationshipStatus: {
            type: DataTypes.STRING(35),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Relationship status cannot be left blank",
                },
                notNull: {
                    msg: "Relationship status is required",
                },
                isIn: {
                    args: validations.relationshipOptions,
                    msg: "Invalid relationship status",
                },
            },
        },

        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Birthdate cannot be left blank",
                },
                isDate: {
                    msg: "Only date input is allowed",
                },
            },
        },

        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Age cannot be left blank",
                },
                isNumeric: {
                    msg: "Age must be a number",
                },
            },
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Email is required",
                },
                isEmail: {
                    msg: "Must be a valid email address",
                },
                notEmpty: {
                    msg: "Email cannot be left blank",
                },
            },
        },

        occupation: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Occupation is required",
                },
                notEmpty: {
                    msg: "Occupation cannot be left blank",
                }
            },
        },
        
        profilePicture: {
            type: DataTypes.STRING(255),
            defaultValue: "user.webp",
        },

        housePicture: {
            type: DataTypes.STRING(255),
            defaultValue: "blank_image.webp",
        },

        meterNumber: {
            type: DataTypes.STRING(25),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Meter number is required",
                },
                notEmpty: {
                    msg: "Meter number cannot be left blank",
                }
            }
        }
    }
);

Client.hasOne(Client_Address, { 
    foreignKey: "mainAddressId", 
    as: "mainAddress"
})

Client.hasOne(Client_Address, { 
    foreignKey: "presentAddressId", 
    as: "presentAddress"
})

Client_Address.belongsTo(Client, {
	foreignKey: "mainAddressId",
	as: "clientMainAddress",
});

Client_Address.belongsTo(Client, {
	foreignKey: "presentAddressId",
	as: "clientPresentAddress",
});

Client.sync()
    .then(() => {
        console.log("Client model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client because of error:", error);
    })

module.exports = Client
