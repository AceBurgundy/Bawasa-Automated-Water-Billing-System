const validations = require("../constants")
const { db } = require("../sequelize_init")
const { DataTypes } = require('sequelize')
const Client = require("./Client")

const Client_Connection_Status = db.define(
    "Client_Connection_Status",

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

        connectionStatus: {
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
                    args: [validations.connectionStatusTypes],
                    msg: "Invalid connection status"
                }
            }
        }
    }
)

Client_Connection_Status.belongsTo(Client, { foreignKey: "clientId" })
Client.hasMany(Client_Connection_Status, { foreignKey: "clientId" })

Client_Connection_Status.sync()
    .then(() => {
        console.log("Client Connection Status model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Connection Status because of error:", error);
    });

module.exports = Client_Connection_Status
