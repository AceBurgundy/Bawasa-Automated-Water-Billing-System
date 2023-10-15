
const { RELATIONSHIP_OPTIONS } = require("../source/utilities/constants")
const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require("sequelize")

const CLIENT_ADDRESS = require("./ClientAddress")

const CLIENT = DB.define(
    "Client",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        accountNumber: {
            type: DATA_TYPES.STRING(7),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(10),
        },

        fullName: {
            type: DATA_TYPES.VIRTUAL,
            get() {
                return `${this.firstName} ${this.middleName
                    .charAt(0)
                    .toUpperCase()}. ${this.lastName}`
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!")
            },
        },

        relationshipStatus: {
            type: DATA_TYPES.STRING(35),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Relationship status cannot be left blank",
                },
                notNull: {
                    msg: "Relationship status is required",
                },
                isIn: {
                    args: RELATIONSHIP_OPTIONS,
                    msg: "Invalid relationship status",
                },
            },
        },

        birthDate: {
            type: DATA_TYPES.DATEONLY,
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
            type: DATA_TYPES.INTEGER,
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(100),
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
            type: DATA_TYPES.STRING(255),
            defaultValue: "user.webp",
        },

        housePicture: {
            type: DATA_TYPES.STRING(255),
            defaultValue: "blank_image.webp",
        },

        meterNumber: {
            type: DATA_TYPES.STRING(25),
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
)

CLIENT.hasOne(CLIENT_ADDRESS, { 
    foreignKey: "mainAddressId", 
    as: "mainAddress",
    onDelete: 'CASCADE'
})

CLIENT.hasOne(CLIENT_ADDRESS, { 
    foreignKey: "presentAddressId", 
    as: "presentAddress",
    onDelete: 'CASCADE'
})

CLIENT_ADDRESS.belongsTo(CLIENT, {
	foreignKey: "mainAddressId",
	as: "mainAddress",
})

CLIENT_ADDRESS.belongsTo(CLIENT, {
	foreignKey: "presentAddressId",
	as: "presentAddress",
})

CLIENT.sync()
    .then(() => {
        console.log("Client model successfully created or synchronized")
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client because of error:", error)
    })

module.exports = CLIENT
