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

        // hashed name of file
        name: {
            type: DataTypes.STRING(255)
        },

        // other certifications or legal documents "birth certificate", "marriage contract"
        filePurpose: {
            type: DataTypes.STRING(255)
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
