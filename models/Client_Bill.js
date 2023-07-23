const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")
const Client = require("./Client")

const Client_Bill = db.define(
    "Client_Bill",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Client ID is required"
                },
                isInt: {
                    msg: "Client ID must be an integer"
                }
            }
        },

        previous_reading: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Previous reading is required"
                },
                isInt: {
                    msg: "Previous reading must be an integer"
                }
            }
        },

        current_reading: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Current reading is required"
                },
                isInt: {
                    msg: "Current reading must be an integer"
                }
            }
        },

        consumption: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Consumption is required"
                },
                isInt: {
                    msg: "Consumption must be an integer"
                }
            }
        },

        bill_amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Bill amount is required"
                },
                isDecimal: {
                    msg: "Bill amount must be a decimal number ex: (100.00)"
                }
            }
        },

        payment_status: {
            type: DataTypes.STRING(50),
            defaultValue: "unpaid",
            validate: {
                isIn: {
                    args: [["unpaid", "paid", "underpaid", "overpaid"]],
                    msg: `Payment status must be "unpaid", "paid", "underpaid", "overpaid"`
                }
            }
        },

        payment_amount: {
            type: DataTypes.DECIMAL,
            validate: {
                isDecimal: {
                    msg: "Payment amount must be a decimal number ex: (100.00)"
                }
            }
        },

        remaining_balance: {
            type: DataTypes.DECIMAL,
            validate: {
                isDecimal: {
                    msg: "Remaining balance must be a decimal number ex: (100.00)"
                }
            }
        },

        payment_excess: {
            type: DataTypes.DECIMAL,
            validate: {
                isDecimal: {
                    msg: "Payment excess must be a decimal number ex: (100.00)"
                }
            }
        },

        payment_date: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: "Payment date must be a valid date"
                }
            }
        },

        disconnection_date: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: "Disconnection date must be a valid date"
                }
            }
        }
    }
)

Client_Bill.belongsTo(Client, { foreignKey: "client_id" })
Client.hasMany(Client_Bill, { foreignKey: "client_id" })

Client_Bill.sync()

module.exports = Client_Bill
