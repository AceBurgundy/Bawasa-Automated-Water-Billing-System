/* eslint-disable new-cap */
const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');

const Client = require('./Client');

const ClientPhoneNumber = db.define(
    'ClientPhoneNumber',
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
            msg: 'Client id is required'
          }
        }
      },

      phoneNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Phone Number is required'
          },
          isNumeric: {
            msg: 'Must only contain numbers'
          },
          notEmpty: {
            msg: 'Phone number cannot be left blank'
          }
        }
      }
    }
);

ClientPhoneNumber.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'phoneNumbers',
  onDelete: 'CASCADE'
});

Client.hasMany(ClientPhoneNumber, {
  foreignKey: 'clientId',
  as: 'phoneNumbers'
});

ClientPhoneNumber.sync()
    .then(() => {
      console.log('Client Phone Number model successfully created or synchronized');
    })
    .catch(error => {
      const message = '\n\nError creating/synchronizing table for Client Phone Number. Error:';
      console.error(message, error);
    });

module.exports = ClientPhoneNumber;
