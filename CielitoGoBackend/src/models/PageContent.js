const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  page: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'home, about, contact, tours, etc.',
  },
  section: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'hero, banner, about, testimonials, etc.',
  },
  key: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'title, subtitle, description, image_url, cta_text, cta_url',
  },
  value: {
    type: DataTypes.TEXT,
    comment: 'Text content or JSON for complex values',
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'json', 'boolean', 'number', 'link'),
    defaultValue: 'text',
  },
  metadata: {
    type: DataTypes.JSON,
    comment: 'Additional metadata like dimensions, formats, etc.',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  updatedBy: {
    type: DataTypes.UUID,
  },
}, {
  tableName: 'page_contents',
  indexes: [
    {
      unique: true,
      fields: ['page', 'section', 'key'],
    },
  ],
});

module.exports = PageContent;
