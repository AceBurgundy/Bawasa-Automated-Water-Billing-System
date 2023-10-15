const { db } = require("../source/utilities/sequelize")
const { DataTypes } = require("sequelize")

const Client = require("./Client")

const ClientBill = db.define(
    "ClientBill",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        billNumber: {
            type: DataTypes.STRING(7),
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

        total: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Bill amount must be a decimal number ex: (100.00)"
                }
            }
        },

        status: {
            type: DataTypes.STRING(50),
            defaultValue: "unpaid",
            validate: {
                isIn: {
                    args: [["unpaid", "paid", "underpaid", "overpaid"]],
                    msg: `Payment status must be "unpaid", "paid", "underpaid", "overpaid"`
                }
            }
        },

        amountPaid: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Payment amount must be a decimal number ex: (100.00)"
                }
            }
        },

        balance: {
            type: DataTypes.DECIMAL(10,2),
            validate: {
                isDecimal: {
                    msg: "Remaining balance must be a decimal number ex: (100.00)"
                }
            }
        },

        excess: {
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
        },

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

ClientBill.belongsTo(Client, { 
    foreignKey: "clientId", 
    as: "bills",
    onDelete: 'CASCADE'
})

Client.hasMany(ClientBill, { 
    foreignKey: "clientId", 
    as: "bills"
})

ClientBill.sync()
    .then(() => {
        console.log("Client Bill model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table Client Bill because of error:", error);
    });

module.exports = ClientBill
