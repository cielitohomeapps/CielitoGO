const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const QuoteStatusHistory = sequelize.define('QuoteStatusHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quoteId: { type: DataTypes.UUID, allowNull: false },
  fromStatus: { type: DataTypes.STRING(30) },
  toStatus: { type: DataTypes.STRING(30), allowNull: false },
  note: { type: DataTypes.TEXT },
  changedBy: { type: DataTypes.UUID },
}, {
  tableName: 'quote_status_history',
  updatedAt: false,
});

module.exports = QuoteStatusHistory;
