const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  waMessageId: {
    type: DataTypes.STRING(100),
    unique: true,
  },
  from: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'document', 'audio', 'video', 'template', 'location'),
    defaultValue: 'text',
  },
  mediaUrl: {
    type: DataTypes.STRING(500),
  },
  direction: {
    type: DataTypes.ENUM('incoming', 'outgoing'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  templateName: {
    type: DataTypes.STRING(100),
  },
  metadata: {
    type: DataTypes.JSON,
  },
  contactName: {
    type: DataTypes.STRING(200),
  },
  tourId: {
    type: DataTypes.UUID,
    comment: 'Related tour if this is a booking inquiry',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'whatsapp_messages',
});

module.exports = WhatsAppMessage;
