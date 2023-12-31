/* eslint-disable new-cap */

const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');
const User = require('./User');

const UserAddress = db.define(
    'UserAddress',
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
      }
    }
);

User.hasOne(UserAddress, {
  foreignKey: 'mainAddressId',
  as: 'mainAddress',
  onDelete: 'CASCADE'
});

User.hasOne(UserAddress, {
  foreignKey: 'presentAddressId',
  as: 'presentAddress',
  onDelete: 'CASCADE'
});

UserAddress.belongsTo(User, {
  foreignKey: 'mainAddressId',
  as: 'mainAddress'
});

UserAddress.belongsTo(User, {
  foreignKey: 'presentAddressId',
  as: 'presentAddress'
});

UserAddress.sync()
    .then(() => {
      console.log('User Address model successfully created or synchronized');
    })
    .catch(error => {
      const message = '\n\nError creating/synchronizing table for User Address because of error:';
      console.error(message, error);
    });

module.exports = UserAddress;
