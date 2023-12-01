/* eslint-disable new-cap */
const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');

const Client = require('./Client');

const ClientFile = db.define(
    'ClientFile',
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
            msg: 'Clients ID is required'
          }
        }
      },

      name: {
        allowNull: false,
        type: DataTypes.STRING(255),
        validate: {
          notNull: {
            msg: 'Clients ID is required'
          }
        }
      }

    }
);

ClientFile.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'files',
  onDelete: 'CASCADE'
});

Client.hasMany(ClientFile, {
  foreignKey: 'clientId',
  as: 'files'
});

ClientFile.sync()
    .then(() => {
      console.log('Client file model successfully created or synchronized');
    })
    .catch(error => {
      const message = '\n\nError creating/synchronizing table for client file because of error:';
      console.error(message, error);
    });

module.exports = ClientFile;
