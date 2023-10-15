const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require("sequelize")

const CLIENT = require("./Client")

const CLIENT_FILE = DB.define(
    "ClientFile",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        clientId: {
            type: DATA_TYPES.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Clients ID is required'
                }
            }
        },
        
        name: {
            allowNull: false,
            type: DATA_TYPES.STRING(255),
            validate: {
                notNull: {
                    msg: 'Clients ID is required'
                }
            }
        }

    }
)

CLIENT_FILE.belongsTo(CLIENT, {
    foreignKey: 'clientId',
    as: "files",
    onDelete: 'CASCADE'
})

CLIENT.hasMany(CLIENT_FILE, {
    foreignKey: 'clientId',
    as: "files"
})

CLIENT_FILE.sync()
    .then(() => {
        console.log("Client file model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for client file because of error:", error);
    });

module.exports = CLIENT_FILE
