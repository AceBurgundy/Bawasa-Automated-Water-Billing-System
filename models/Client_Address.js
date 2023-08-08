const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")
const Client = require("./Client")

const Client_Address = db.define(
    "Client_Address",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        street: {
            type: DataTypes.STRING(50),
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Street can only contain letters numbers and spaces"
                }
            }
        },

        subdivision: {
            type: DataTypes.STRING(50),
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Subdivision can only contain letters numbers and spaces"
                }
            }
        },

        barangay: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Barangay can only contain letters numbers and spaces"
                },
                notNull: {
                    msg: "Barangay is required"
                },
                notEmpty: {
                    msg: "Barangay cannot be left blank"
                }
            }
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "City can only contain letters numbers and spaces"
                },
                notNull: {
                    msg: "City is required"
                },
                notEmpty: {
                    msg: "City cannot be left blank"
                }
            }
        },

        province: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Province can only contain letters numbers and spaces"
                },
                notNull: {
                    msg: "Province is required"
                },
                notEmpty: {
                    msg: "Province cannot be left blank"
                }
            }
        },

        postalCode: {
            type: DataTypes.STRING(4),
            allowNull: false,
            validate: {
                isAlphanumeric: {
                    msg: "Postal Code can only contain letters and numbers"
                },
                notNull: {
                    msg: "Postal Code is required"
                },
                notEmpty: {
                    msg: "Postal Code cannot be left blank"
                }
            }
        },

        details: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Details is required"
                },
                notEmpty: {
                    msg: "Address details cannot be left blank"
                }
            }
        }
    }
)

Client_Address.sync()
    .then(() => {
        console.log("Client Address model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Address because of error:", error);
    });

module.exports = Client_Address
