const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require("sequelize")

const CLIENT = require("./Client")

const CLIENT_BILL = DB.define(
    "ClientBill",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        billNumber: {
            type: DATA_TYPES.STRING(7),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Account Number must be provided"
                },
                notEmpty: {
                    msg: "Account Number cannot be left blank"
                }
            }
        },

        clientId: {
            type: DATA_TYPES.INTEGER,
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

        firstReading: {
            type: DATA_TYPES.DECIMAL(10,2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First reading is required",
                },
                isDecimal: {
                    msg: "Must be a decimal number ex: (100.00)"
                }
            }
        },

        secondReading: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Must be a decimal number ex: (100.00)"
                }
            }
        },
        
        consumption: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isInt: {
                    msg: "Consumption must be an integer"
                }
            }
        },

        total: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Bill amount must be a decimal number ex: (100.00)"
                }
            }
        },

        status: {
            type: DATA_TYPES.STRING(50),
            defaultValue: "unpaid",
            validate: {
                isIn: {
                    args: [["unpaid", "paid", "underpaid", "overpaid"]],
                    msg: `Payment status must be "unpaid", "paid", "underpaid", "overpaid"`
                }
            }
        },

        amountPaid: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Payment amount must be a decimal number ex: (100.00)"
                }
            }
        },

        balance: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Remaining balance must be a decimal number ex: (100.00)"
                }
            }
        },

        excess: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Payment excess must be a decimal number ex: (100.00)"
                }
            }
        },

        paymentDate: {
            type: DATA_TYPES.DATE,
            validate: {
                isDate: {
                    msg: "Payment date must be a valid date"
                }
            }
        },

        penalty: {
            type: DATA_TYPES.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Penalty amount must be a decimal number ex: (100.00)"
                }
            }
        },

        dueDate: {
            type: DATA_TYPES.DATE,
            validate: {
                isDate: {
                    msg: "Due date must be a valid date"
                }
            }
        },

        disconnectionDate: {
            type: DATA_TYPES.DATE,
            validate: {
                isDate: {
                    msg: "Disconnection date must be a valid date"
                }
            }
        }
        
    }
)

CLIENT_BILL.belongsTo(CLIENT, { 
    foreignKey: "clientId", 
    as: "bills",
    onDelete: 'CASCADE'
})

CLIENT.hasMany(CLIENT_BILL, { 
    foreignKey: "clientId", 
    as: "bills"
})

CLIENT_BILL.sync()
    .then(() => {
        console.log("Client Bill model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table Client Bill because of error:", error);
    });

module.exports = CLIENT_BILL
