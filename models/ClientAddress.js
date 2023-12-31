/* eslint-disable new-cap */
const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');
const Client = require('./Client');

const ClientAddress = db.define(
    'ClientAddress',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      street: {
        type: DataTypes.STRING(50),
        validate: {
          is: {
            args: /^[A-Za-z\s0-9.]+$/,
            msg: 'Street can only contain letters numbers and spaces'
          }
        }
      },

      barangay: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          is: {
            args: /^[A-Za-z\s0-9.]+$/,
            msg: 'Barangay can only contain letters numbers and spaces'
          },
          notNull: {
            msg: 'Barangay is required'
          },
          notEmpty: {
            msg: 'Barangay cannot be left blank'
          }
        }
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          is: {
            args: /^[A-Za-z\s0-9.]+$/,
            msg: 'City can only contain letters numbers and spaces'
          },
          notNull: {
            msg: 'City is required'
          },
          notEmpty: {
            msg: 'City cannot be left blank'
          }
        }
      },

      postalCode: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          isAlphanumeric: {
            msg: 'Postal Code can only contain letters and numbers'
          },
          notNull: {
            msg: 'Postal Code is required'
          },
          notEmpty: {
            msg: 'Postal Code cannot be left blank'
          }
        }
      },

      region: {
        type: DataTypes.STRING(255)
      },

      details: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Details is required'
          },
          notEmpty: {
            msg: 'Address details cannot be left blank'
          }
        }
      },

      fullAddress: {
        type: DataTypes.VIRTUAL,
        get() {
          return [
            this.details,
            this.street ?? '',
            this.barangay,
            this.city,
            this.postalCode
          ].join(' ');
        },
        set(value) {
          throw new Error('Do not try to set the `fullName` value!');
        }
      }
    }
);

Client.hasOne(ClientAddress, {
  foreignKey: 'mainAddressId',
  as: 'mainAddress',
  onDelete: 'CASCADE'
});

Client.hasOne(ClientAddress, {
  foreignKey: 'presentAddressId',
  as: 'presentAddress',
  onDelete: 'CASCADE'
});

ClientAddress.belongsTo(Client, {
  foreignKey: 'mainAddressId',
  as: 'mainAddress'
});

ClientAddress.belongsTo(Client, {
  foreignKey: 'presentAddressId',
  as: 'presentAddress'
});

ClientAddress.sync()
    .then(() => {
      console.log('Client Address model successfully created or synchronized');
    })
    .catch(error => {
      console.error('\n\nError creating/synchronizing table for Client Address. Error:', error);
    });

module.exports = ClientAddress;
