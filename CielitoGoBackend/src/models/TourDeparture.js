const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const TourDeparture = sequelize.define('TourDeparture', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tourId: { type: DataTypes.UUID, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  availableSpots: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  priceOverride: { type: DataTypes.DECIMAL(10, 2), validate: { min: 0 } },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
  status: { type: DataTypes.ENUM('available', 'sold_out', 'cancelled'), allowNull: false, defaultValue: 'available' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'tour_departures',
});

module.exports = TourDeparture;
