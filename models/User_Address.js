const { DataTypes } = require('sequelize')
const { db } = require("../sequelize_init")
const User = require("./User")

const User_Address = db.define(
    "User_Address",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User ID is required"
                },
                isNumeric: {
                    msg: "User ID must be an integer"
                }
            }
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "City is required"
                },
                notEmpty: {
                    msg: "Cannot be left blank"
                }
            }
        },

        barangay: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Barangay is required"
                },
                notEmpty: {
                    msg: "Barangay cannot be left blank"
                }
            }
        },

        postal_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Postal Code is required"
                },
                isNumeric: {
                    msg: "Must only contain numbers"
                },
                notEmpty: {
                    msg: "Postal code cannot be left blank"
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
                    msg: "Datails cannot be left blank"
                }
            }
        }
    }
)

User_Address.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(User_Address, { foreignKey: "user_id" })

User_Address.sync()

module.exports = User_Address
