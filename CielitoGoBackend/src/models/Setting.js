const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'json', 'boolean', 'number'),
    defaultValue: 'text',
  },
  group: {
    type: DataTypes.STRING(100),
    defaultValue: 'general',
    comment: 'general, contact, social, seo, whatsapp',
  },
  description: {
    type: DataTypes.STRING(300),
  },
}, {
  tableName: 'settings',
});

module.exports = Setting;
