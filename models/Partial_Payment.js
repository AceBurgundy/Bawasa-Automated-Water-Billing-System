const Client_Bill = require("./Client_Bill")
const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")

const Partial_Payment = db.define(
    "Partial_Payment", 
    
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        clientBillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { 
                    msg: "Client Bill ID is required" 
                }
            }
        },

        paymentDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        amountPaid: {
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

Partial_Payment.belongsTo(Client_Bill, { foreignKey: "clientBillId" })
Client_Bill.hasMany(Partial_Payment, { foreignKey: "clientBillId" })

Partial_Payment.sync()
    .then(() => {
        console.log("Partial Payment model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Partial Payment because of error:", error);
    })

module.exports = Partial_Payment
