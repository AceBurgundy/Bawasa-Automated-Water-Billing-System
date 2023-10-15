const { CONNECTION_STATUS_OPTIONS } = require("../source/utilities/constants")
const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require('sequelize')

const CLIENT = require("./Client")

const CLIENT_CONNECTION_STATUS = DB.define(
    "ClientConnectionStatus",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        clientId: {
            type: DATA_TYPES.INTEGER,
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
            type: DATA_TYPES.STRING(30),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Connection status is required"
                },
                notEmpty: {
                    msg: "Connection status cannot be left blank"
                },
                isIn: {
                    args: CONNECTION_STATUS_OPTIONS,
                    msg: "Invalid connection status"
                }
            }
        }
    }
)

CLIENT_CONNECTION_STATUS.belongsTo(CLIENT, { 
    foreignKey: "clientId", 
    as: "connectionStatuses",
    onDelete: 'CASCADE'
})

CLIENT.hasMany(CLIENT_CONNECTION_STATUS, { 
    foreignKey: "clientId", 
    as: "connectionStatuses" 
})

CLIENT_CONNECTION_STATUS.sync()
    .then(() => {
        console.log("Client Connection Status model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Connection Status because of error:", error);
    });

module.exports = CLIENT_CONNECTION_STATUS
