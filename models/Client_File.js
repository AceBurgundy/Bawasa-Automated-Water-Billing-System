const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")
const Client = require("./Client")

const Client_File = db.define(
    "Client_File",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Client ID is required'
                }
            }
        },
        
        name: {
            allowNull: false,
            type: DataTypes.STRING(255),
            validate: {
                notNull: {
                    msg: 'Client ID is required'
                }
            }
        }

    }
)

Client_File.belongsTo(Client, {
    foreignKey: 'clientId',
})

Client.hasMany(Client_File, {
    foreignKey: 'clientId',
})

Client_File.sync()
    .then(() => {
        console.log("Client File model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client File because of error:", error);
    });

module.exports = Client_File
