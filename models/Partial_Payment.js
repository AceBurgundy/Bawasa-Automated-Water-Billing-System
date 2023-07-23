const Client_Bill = require("./Client_Bill")
const { DataTypes } = require("sequelize")
const { db } = require("../sequelize_init")

const Partial_Payment = db.define(
    "Partial_Payment", 
    
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        client_bill_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { 
                    msg: "Client Bill ID is required" 
                }
            }
        },

        payment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        amount_paid: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                notNull: { 
                    msg: "Amount Paid is required"
                },
                isDecimal: {
                    msg: "Must be a decimal number ex: (100.00)"
                }
            }
        }
    }
)

Partial_Payment.belongsTo(Client_Bill, { foreignKey: "client_bill_id" })
Client_Bill.hasMany(Partial_Payment, { foreignKey: "client_bill_id" })

Partial_Payment.sync()

module.exports = Partial_Payment
