const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(150) },
  email: { type: DataTypes.STRING(150), validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(50), allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'customers',
});

module.exports = Customer;
