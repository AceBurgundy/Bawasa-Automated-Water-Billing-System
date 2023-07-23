const { DataTypes } = require('sequelize')
const { db } = require('../sequelize_init')
const User = require('./User')

const UserPhoneNumber = db.define(
    'User_Phone_Number',

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'User ID is required'
                }
            }
        },

        phone_number: {
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
    foreignKey: 'user_id',
})
User.hasMany(UserPhoneNumber, {
    foreignKey: 'user_id',
})

UserPhoneNumber.sync()

module.exports = UserPhoneNumber
