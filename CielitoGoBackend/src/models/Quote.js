const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Quote = sequelize.define('Quote', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerId: { type: DataTypes.UUID },
  customerName: { type: DataTypes.STRING(200), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
  destination: { type: DataTypes.STRING(200), allowNull: false },
  departureDate: { type: DataTypes.DATEONLY },
  returnDate: { type: DataTypes.DATEONLY },
  travelers: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  adults: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  minors: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  budget: { type: DataTypes.DECIMAL(12, 2), validate: { min: 0 } },
  comments: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('new', 'reviewing', 'contacted', 'sent', 'accepted', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'new',
  },
}, {
  tableName: 'quotes',
});

module.exports = Quote;
