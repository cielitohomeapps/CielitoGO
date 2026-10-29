const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  width: {
    type: DataTypes.INTEGER,
  },
  height: {
    type: DataTypes.INTEGER,
  },
  alt: {
    type: DataTypes.STRING(200),
    defaultValue: '',
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'general',
  },
  uploadedBy: {
    type: DataTypes.UUID,
  },
}, {
  tableName: 'media',
});

module.exports = Media;
