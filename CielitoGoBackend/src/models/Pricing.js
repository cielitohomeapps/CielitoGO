const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Pricing = sequelize.define('Pricing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  tourId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  season: {
    type: DataTypes.ENUM('low', 'mid', 'high', 'peak', 'custom'),
    defaultValue: 'mid',
  },
  seasonName: {
    type: DataTypes.STRING(100),
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  validFrom: {
    type: DataTypes.DATEONLY,
  },
  validTo: {
    type: DataTypes.DATEONLY,
  },
  minPeople: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  maxPeople: {
    type: DataTypes.INTEGER,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'pricings',
});

module.exports = Pricing;
