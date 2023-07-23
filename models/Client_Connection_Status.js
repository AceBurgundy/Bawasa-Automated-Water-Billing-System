const validations = require("../model_helpers")
const { DataTypes } = require('sequelize')
const { db } = require("../sequelize_init")
const Client = require("./Client")

const Client_Connection_Status = db.define(
    "Client_Connection_Status",

    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Clients ID is required"
                },
                notEmpty: {
                    msg: "Clients ID cannot be left blank"
                },
                isInt: {
                    msg: "Clients ID Record must be a number"
                }
            }
        },

        connection_status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Connection status is required"
                },
                notEmpty: {
                    msg: "Connection status cannot be left blank"
                },
                isIn: {
                    args: [validations.inConnectionStatus],
                    msg: "Invalid connection status"
                }
            }
        }
    }
)

Client_Connection_Status.belongsTo(Client, { foreignKey: "client_id" })
Client.hasMany(Client_Connection_Status, { foreignKey: "client_id" })

Client_Connection_Status.sync()

module.exports = Client_Connection_Status
