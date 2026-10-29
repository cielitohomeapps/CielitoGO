'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      width: {
        type: Sequelize.INTEGER,
      },
      height: {
        type: Sequelize.INTEGER,
      },
      alt: {
        type: Sequelize.STRING(200),
        defaultValue: '',
      },
      category: {
        type: Sequelize.STRING(100),
        defaultValue: 'general',
      },
      uploaded_by: {
        type: Sequelize.UUID,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('page_contents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      page: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      section: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'json', 'boolean', 'number', 'link'),
        defaultValue: 'text',
      },
      metadata: {
        type: Sequelize.JSON,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      updated_by: {
        type: Sequelize.UUID,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('page_contents', ['page', 'section', 'key'], {
      unique: true,
      name: 'unique_page_section_key',
    });

    await queryInterface.createTable('whatsapp_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      wa_message_id: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      from: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      to: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'document', 'audio', 'video', 'template', 'location'),
        defaultValue: 'text',
      },
      media_url: {
        type: Sequelize.STRING(500),
      },
      direction: {
        type: Sequelize.ENUM('incoming', 'outgoing'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read', 'failed'),
        defaultValue: 'sent',
      },
      template_name: {
        type: Sequelize.STRING(100),
      },
      metadata: {
        type: Sequelize.JSON,
      },
      contact_name: {
        type: Sequelize.STRING(200),
      },
      tour_id: {
        type: Sequelize.UUID,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING(150),
        unique: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'json', 'boolean', 'number'),
        defaultValue: 'text',
      },
      group: {
        type: Sequelize.STRING(100),
        defaultValue: 'general',
      },
      description: {
        type: Sequelize.STRING(300),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('settings');
    await queryInterface.dropTable('whatsapp_messages');
    await queryInterface.dropTable('page_contents');
    await queryInterface.dropTable('media');
  },
};
