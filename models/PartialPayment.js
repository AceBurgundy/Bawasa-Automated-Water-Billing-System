const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require("sequelize")

const CLIENT_BILL = require("./CLIENT_BILL")

const PARTIAL_PAYMENT = DB.define(
    "PartialPayment",    
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        clientBillId: {
            type: DATA_TYPES.INTEGER,
            allowNull: false,
            validate: {
                notNull: { 
                    msg: "Client Bill id is required" 
                }
            }
        },

        paymentDate: {
            type: DATA_TYPES.DATE,
            defaultValue: DATA_TYPES.NOW
        },

        amountPaid: {
            type: DATA_TYPES.DECIMAL,
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

PARTIAL_PAYMENT.belongsTo(CLIENT_BILL, { 
    foreignKey: "clientBillId",
    onDelete: 'CASCADE',
    as: "partialPayments"
})

CLIENT_BILL.hasMany(PARTIAL_PAYMENT, { 
    foreignKey: "clientBillId",
    as: "partialPayments"
})

PARTIAL_PAYMENT.sync()
    .then(() => {
        console.log("Partial Payment model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Partial Payment because of error:", error);
    })

module.exports = PARTIAL_PAYMENT
