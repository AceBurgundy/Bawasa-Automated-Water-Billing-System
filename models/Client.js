const { defaults, validations } = require("../model_helpers")
const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")

const Client = db.define(
    "Client",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        account_number: {
            type: DataTypes.STRING(7),
            defaultValue: defaults.generateNextAccountNumber
        },

        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First name is required"
                },
                notEmpty: {
                    msg: "First name cannot be left blank"
                },
                isAlpha: {
                    msg: "First name can only contain letters"
                }
            }
        },

        middle_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Middle name is required"
                },
                notEmpty: {
                    msg: "Middle name cannot be left blank"
                },
                isAlpha: {
                    msg: "Middle name can only contain letters"
                }
            }
        },

        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last name is required"
                },
                notEmpty: {
                    msg: "Last name cannot be left blank"
                },
                isAlpha: {
                    msg: "Last name can only contain letters"
                }
            }
        },

        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Birthdate cannot be left blank"
                },
                isDate: {
                    msg: "Only date input is allowed"
                }
            }
        },

        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Age cannot be left blank"
                },
                isNumeric: {
                    msg: "Age must be a number"
                }
            }
        },

        extension: {
            type: DataTypes.STRING(10),
        },

        relationship_status: {
            type: DataTypes.STRING(35),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Relationship status cannot be left blank"
                },
                notNull: {
                    msg: "Relationship status is required"
                },
                isIn: {
                    args: validations.relationshipOptions,
                    msg: "Invalid relationship status"
                }
            }
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Email is required"
                },
                isEmail: {
                    msg: "Must be a valid email address"
                },
                notEmpty: {
                    msg: "Email cannot be left blank"
                }
            }
        },

        profile_picture: {
            type: DataTypes.STRING(255),
            defaultValue: "user.webp"
        },

        house_picture: {
            type: DataTypes.STRING(255),
            defaultValue: "blank_image.webp"
        },

        occupation: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Occupation is required"
                },
                notEmpty: {
                    msg: "Occupation cannot be left blank"
                },
                isAlpha: {
                    msg: "Occupation can only contain letters"
                }
            }
        },

        meter_number: {
            type: DataTypes.STRING(25),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Meter number is required"
                },
                notEmpty: {
                    msg: "Meter number cannot be left blank"
                }
            }
        },
    }
)

Client.sync()

module.exports = Client
