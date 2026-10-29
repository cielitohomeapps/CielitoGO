const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tourId: { type: DataTypes.UUID },
  title: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(250), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  destination: { type: DataTypes.STRING(200) },
  promotionalPrice: { type: DataTypes.DECIMAL(10, 2), validate: { min: 0 } },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  restrictions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  conditions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  imageUrl: { type: DataTypes.STRING(500) },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'promotions',
});

module.exports = Promotion;
