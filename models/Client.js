const { validations } = require("../model_helpers")
const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")

const generateNextAccountNumber = async function () {

    const lastClient = await Client.findOne({
        order: [["createdAt", "DESC"]],
    });

    if (!lastClient) {
        return "0000-AA";
    }

    let nextNumber = "0000";
    let nextLetter = "AA";

    const lastAccountNumber = lastClient.account_number;
    const lastNumberPart = parseInt(lastAccountNumber.slice(0, 4), 10);
    const lastLetterPart = lastAccountNumber.slice(5);

    if (lastNumberPart === 9999) {
        nextNumber = "0000";

        const lastLetterCharCode = lastLetterPart.charCodeAt(1);

        lastLetterCharCode === 90
            ? (nextLetter = "AA")
            : (nextLetter =
                  "A" + String.fromCharCode(lastLetterCharCode + 1));
    } else {
        nextNumber = String("0000" + (lastNumberPart + 1)).slice(-4);
        nextLetter = lastLetterPart;
    }

    return `${nextNumber}-${nextLetter}`;
}

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
            defaultValue: generateNextAccountNumber,
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
                isAlpha: {
                    msg: "First name can only contain letters",
                },
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
                isAlpha: {
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
                isAlpha: {
                    msg: "Last name can only contain letters",
                },
            },
        },

        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.middleName.charAt(0).toUpperCase()}. ${this.lastName}`;
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!");
            }
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

        extension: {
            type: DataTypes.STRING(10),
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

        profilePicture: {
            type: DataTypes.STRING(255),
            defaultValue: "user.webp",
        },

        housePicture: {
            type: DataTypes.STRING(255),
            defaultValue: "blank_image.webp",
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
                },
                isAlpha: {
                    msg: "Occupation can only contain letters",
                },
            },
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
                },
            },
        },

        mainAddressId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Main Address ID cannot be left blank"
                }
            }
        },

        presentAddressId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Present Address ID cannot be left blank"
                }
            }
        },

    }
);

Client.sync()
    .then(() => {
        console.log("Client model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client because of error:", error);
    })

module.exports = Client
