const validations = require("../constants")
const { db } = require("../sequelize_init")
const { DataTypes } = require('sequelize')
const Client = require("./Client")

const ClientConnectionStatus = db.define(
    "ClientConnectionStatus",

    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        clientId: {
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

        status: {
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
                    args: validations.connectionStatusOptions,
                    msg: "Invalid connection status"
                }
            }
        }
    }
)

ClientConnectionStatus.belongsTo(Client, { foreignKey: "clientId" })
Client.hasMany(ClientConnectionStatus, { foreignKey: "clientId" })

ClientConnectionStatus.sync()
    .then(() => {
        console.log("Client Connection Status model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Connection Status because of error:", error);
    });

module.exports = ClientConnectionStatus