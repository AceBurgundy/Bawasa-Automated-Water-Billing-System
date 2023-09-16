const { db } = require("../source/utilities/sequelize")
const { DataTypes } = require("sequelize")

const ClientBill = require("./ClientBill")

const PartialPayment = db.define(
    "PartialPayment", 
    
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

PartialPayment.belongsTo(ClientBill, { foreignKey: "clientBillId" })
ClientBill.hasMany(PartialPayment, { foreignKey: "clientBillId" })

PartialPayment.sync()
    .then(() => {
        console.log("Partial Payment model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Partial Payment because of error:", error);
    })

module.exports = PartialPayment
