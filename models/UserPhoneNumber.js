const { DB } = require('../source/utilities/sequelize')
const { DATA_TYPES } = require('sequelize')
const USER = require('./User')

const USER_PHONE_NUMBER = DB.define(
    'UserPhoneNumber',
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DATA_TYPES.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'User ID is required'
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

USER_PHONE_NUMBER.belongsTo(USER, {
    foreignKey: 'userId',
    as: "phoneNumbers"
})

USER.hasMany(USER_PHONE_NUMBER, {
    foreignKey: 'userId',
    as: "phoneNumbers"
})

USER_PHONE_NUMBER.sync()
    .then(() => {
        console.log("User Phone Number model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for User Phone Number because of error:", error);
    })

module.exports = USER_PHONE_NUMBER
