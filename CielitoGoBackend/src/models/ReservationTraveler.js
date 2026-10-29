const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const ReservationTraveler = sequelize.define('ReservationTraveler', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reservationId: { type: DataTypes.UUID, allowNull: false },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(150) },
  travelerType: { type: DataTypes.ENUM('adult', 'minor'), allowNull: false },
  birthDate: { type: DataTypes.DATEONLY },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'reservation_travelers',
});

module.exports = ReservationTraveler;
