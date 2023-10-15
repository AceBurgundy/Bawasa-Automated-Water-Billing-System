
const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require('sequelize')

const USER_ADDRESS = DB.define(
    "UserAddress",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        street: {
            type: DATA_TYPES.STRING(50),
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Street can only contain letters numbers and spaces"
                }
            }
        },

        subdivision: {
            type: DATA_TYPES.STRING(50),
            validate: {
                is: {
                    args: /^[A-Za-z\s0-9.]+$/,
                    msg: "Subdivision can only contain letters numbers and spaces"
                }
            }
        },

        barangay: {
            type: DATA_TYPES.STRING(50),
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
            type: DATA_TYPES.STRING(100),
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
            type: DATA_TYPES.STRING(50),
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
            type: DATA_TYPES.STRING(4),
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
            type: DATA_TYPES.STRING(255),
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

USER_ADDRESS.sync()
    .then(() => {
        console.log("User Address model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for User Address because of error:", error);
    })

module.exports = USER_ADDRESS
