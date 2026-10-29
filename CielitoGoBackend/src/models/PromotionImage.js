const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const PromotionImage = sequelize.define('PromotionImage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  promotionId: { type: DataTypes.UUID, allowNull: false },
  imageUrl: { type: DataTypes.STRING(500), allowNull: false },
  alt: { type: DataTypes.STRING(200) },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'promotion_images',
});

module.exports = PromotionImage;
