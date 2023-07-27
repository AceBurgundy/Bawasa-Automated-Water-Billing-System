const { db } = require('../sequelize_init')
const { DataTypes } = require('sequelize')
const User = require('./User')

const UserPhoneNumber = db.define(
    'User_Phone_Number',

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'User ID is required'
                }
            }
        },

        phoneNumber: {
            type: DataTypes.STRING(20),
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

UserPhoneNumber.belongsTo(User, {
    foreignKey: 'userId',
})
User.hasMany(UserPhoneNumber, {
    foreignKey: 'userId',
})

UserPhoneNumber.sync()
    .then(() => {
        console.log("User Phone Number model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for User Phone Number because of error:", error);
    })

module.exports = UserPhoneNumber
