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

        clientId: {
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

        firstReading: {
            type: DataTypes.DECIMAL(10,2),
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
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Must be a decimal number ex: (100.00)"
                }
            }
        },
        
        consumption: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isInt: {
                    msg: "Consumption must be an integer"
                }
            }
        },

        billAmount: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Bill amount must be a decimal number ex: (100.00)"
                }
            }
        },

        paymentStatus: {
            type: DataTypes.STRING(50),
            defaultValue: "unpaid",
            validate: {
                isIn: {
                    args: [["unpaid", "paid", "underpaid", "overpaid"]],
                    msg: `Payment status must be "unpaid", "paid", "underpaid", "overpaid"`
                }
            }
        },

        paymentAmount: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Payment amount must be a decimal number ex: (100.00)"
                }
            }
        },

        remainingBalance: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Remaining balance must be a decimal number ex: (100.00)"
                }
            }
        },

        paymentExcess: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Payment excess must be a decimal number ex: (100.00)"
                }
            }
        },

        paymentDate: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: "Payment date must be a valid date"
                }
            }
        },

        penalty: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Penalty amount must be a decimal number ex: (100.00)"
                }
            }
        }

        dueDate: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: "Due date must be a valid date"
                }
            }
        },

        disconnectionDate: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: "Disconnection date must be a valid date"
                }
            }
        }
        
    }
)

Client_Bill.belongsTo(Client, { foreignKey: "clientId" })
Client.hasMany(Client_Bill, { foreignKey: "clientId" })

Client_Bill.sync()
    .then(() => {
        console.log("Client Bill model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table Client Bill because of error:", error);
    });

module.exports = Client_Bill
