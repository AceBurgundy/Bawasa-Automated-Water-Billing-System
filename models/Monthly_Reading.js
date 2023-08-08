const { db } = require("../sequelize_init")
const { DataTypes } = require("sequelize")
const Client = require("./Client")
const User = require("./User")

const Monthly_Reading = db.define(
    "Monthly_Reading",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        reading: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Reading is required",
                },
                isDecimal: {
                    msg: "Must be a decimal number ex: (100.00)"
                }
            }
        }
    }
)

Monthly_Reading.sync()
    .then(() => {
        console.log("Monthly Reading model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Monthly Reading because of error:", error);
    })

module.exports = Monthly_Reading
