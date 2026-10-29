const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(250),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.STRING(500),
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'hard', 'extreme'),
    defaultValue: 'moderate',
  },
  location: {
    type: DataTypes.STRING(200),
  },
  highlights: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  includes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  excludes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  restrictions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  conditions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  itinerary: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  imageUrl: {
    type: DataTypes.STRING(500),
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metaTitle: {
    type: DataTypes.STRING(200),
  },
  metaDescription: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'tours',
});

module.exports = Tour;
