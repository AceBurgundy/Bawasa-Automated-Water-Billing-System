const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');

const ClientBill = require('./ClientBill');

const PartialPayment = db.define(
    'PartialPayment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      clientBillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Client Bill id is required'
          }
        }
      },

      paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },

      amountPaid: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Amount Paid is required'
          },
          isDecimal: {
            msg: 'Must be a decimal number ex: (100.00)'
          }
        }
      }
    }
);

PartialPayment.belongsTo(ClientBill, {
  foreignKey: 'clientBillId',
  onDelete: 'CASCADE',
  as: 'partialPayments'
});

ClientBill.hasMany(PartialPayment, {
  foreignKey: 'clientBillId',
  as: 'partialPayments'
});

PartialPayment.sync()
    .then(() => {
      console.log('Partial Payment model successfully created or synchronized');
    })
    .catch(error => {
      const message = '\n\nError creating/synchronizing table for Partial Payment. Error:';
      console.error(message, error);
    });

module.exports = PartialPayment;
