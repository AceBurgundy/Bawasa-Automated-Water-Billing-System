const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require('sequelize');
const USER = require('./User')

const RECOVERY_CODE = DB.define(
    "RecoveryCode",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    
        code: {
            type: DATA_TYPES.STRING(8),
            allowNull: false,
        }

    }

)

RECOVERY_CODE.belongsTo(USER, {
    foreignKey: 'userId',
    as: "recoveryCodes"
})
USER.hasMany(RECOVERY_CODE, {
    foreignKey: 'userId',
    as: "recoveryCodes"
})

RECOVERY_CODE.sync()
    .then(() => {
        console.log("Recovery Code model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for Recovery Code because of error:", error);
    })

module.exports = RECOVERY_CODE