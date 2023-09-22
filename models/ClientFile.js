const { db } = require("../source/utilities/sequelize")
const { DataTypes } = require("sequelize")

const Client = require("./Client")

const ClientFile = db.define(
    "ClientFile",

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

ClientFile.belongsTo(Client, {
    foreignKey: 'clientId',
    as: "clientFiles",
    onDelete: 'CASCADE'
})

Client.hasMany(ClientFile, {
    foreignKey: 'clientId',
    as: "clientFiles"
})

ClientFile.sync()
    .then(() => {
        console.log("Client File model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client File because of error:", error);
    });

module.exports = ClientFile
