const { db } = require('../sequelize_init')
const { DataTypes } = require('sequelize')
const Client = require('./Client')

const ClientPhoneNumber = db.define(
    'Client_Phone_Number',

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
                    msg: 'Client ID is required'
                }
            }
        },

        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Phone Number is required'
                },
                isNumeric: {
                    msg: "Must only contain numbers"
                },
                notEmpty: {
                    msg: "Phone number cannot be left blank"
                }
            }
        }
    }
)

ClientPhoneNumber.belongsTo(Client, {
    foreignKey: 'clientId',
})
Client.hasMany(ClientPhoneNumber, {
    foreignKey: 'clientId',
})

ClientPhoneNumber.sync()
    .then(() => {
        console.log("Client Phone Number model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Phone Number because of error:", error);
    });

module.exports = ClientPhoneNumber
