const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Reservation = sequelize.define('Reservation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  quoteId: { type: DataTypes.UUID, unique: true },
  customerId: { type: DataTypes.UUID },
  tourId: { type: DataTypes.UUID },
  promotionId: { type: DataTypes.UUID },
  departureId: { type: DataTypes.UUID },
  customerName: { type: DataTypes.STRING(200), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  travelers: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  adults: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  minors: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  status: {
    type: DataTypes.ENUM('request', 'pending', 'confirmed', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'request',
  },
  notes: { type: DataTypes.TEXT },
  cancelledAt: { type: DataTypes.DATE },
  cancellationReason: { type: DataTypes.TEXT },
}, {
  tableName: 'reservations',
});

module.exports = Reservation;
