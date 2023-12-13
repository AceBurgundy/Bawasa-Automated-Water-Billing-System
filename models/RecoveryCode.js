/* eslint-disable new-cap */
const {db} = require('../source/utilities/sequelize');
const {DataTypes} = require('sequelize');
const User = require('./User');

const RecoveryCode = db.define(
    'RecoveryCode',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      code: {
        type: DataTypes.STRING(8),
        allowNull: false
      }

    }

);

RecoveryCode.belongsTo(User, {
  foreignKey: 'userId',
  as: 'recoveryCodes'
});

User.hasMany(RecoveryCode, {
  foreignKey: 'userId',
  as: 'recoveryCodes'
});

RecoveryCode.sync()
    .then(() => {
      console.log('Recovery Code model successfully created or synchronized');
    })
    .catch(error => {
      const message = '\n\nError creating/synchronizing table for Recovery Code because of error:';
      console.error(message, error);
    });

module.exports = RecoveryCode;
