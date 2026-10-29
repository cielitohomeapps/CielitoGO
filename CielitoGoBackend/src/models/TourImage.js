const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const TourImage = sequelize.define('TourImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tourId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  alt: {
    type: DataTypes.STRING(200),
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'tour_images',
});

module.exports = TourImage;
