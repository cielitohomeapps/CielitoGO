const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const ReservationStatusHistory = sequelize.define('ReservationStatusHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reservationId: { type: DataTypes.UUID, allowNull: false },
  fromStatus: { type: DataTypes.STRING(30) },
  toStatus: { type: DataTypes.STRING(30), allowNull: false },
  note: { type: DataTypes.TEXT },
  changedBy: { type: DataTypes.UUID },
}, {
  tableName: 'reservation_status_history',
  updatedAt: false,
});

module.exports = ReservationStatusHistory;
