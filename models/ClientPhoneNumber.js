const { DB } = require('../source/utilities/sequelize')
const { DATA_TYPES } = require('sequelize')

const CLIENT = require('./Client')

const CLIENT_PHONE_NUMBER = DB.define(
    'ClientPhoneNumber',
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
                    msg: 'Client id is required'
                }
            }
        },

        phoneNumber: {
            type: DATA_TYPES.STRING(10),
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

CLIENT_PHONE_NUMBER.belongsTo(CLIENT, {
    foreignKey: 'clientId',
    as: "phoneNumbers",
    onDelete: 'CASCADE'
})

CLIENT.hasMany(CLIENT_PHONE_NUMBER, {
    foreignKey: 'clientId',
    as: "phoneNumbers"
})

CLIENT_PHONE_NUMBER.sync()
    .then(() => {
        console.log("Client Phone Number model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Client Phone Number because of error:", error);
    });

module.exports = CLIENT_PHONE_NUMBER
