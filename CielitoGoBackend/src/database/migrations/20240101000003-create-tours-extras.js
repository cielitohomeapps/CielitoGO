'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tour_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tour_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tours', key: 'id' },
        onDelete: 'CASCADE',
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      alt: {
        type: Sequelize.STRING(200),
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_primary: {
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

    await queryInterface.createTable('pricings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      tour_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tours', key: 'id' },
        onDelete: 'CASCADE',
      },
      season: {
        type: Sequelize.ENUM('low', 'mid', 'high', 'peak', 'custom'),
        defaultValue: 'mid',
      },
      season_name: {
        type: Sequelize.STRING(100),
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
      },
      valid_from: {
        type: Sequelize.DATEONLY,
      },
      valid_to: {
        type: Sequelize.DATEONLY,
      },
      min_people: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      max_people: {
        type: Sequelize.INTEGER,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('pricings');
    await queryInterface.dropTable('tour_images');
  },
};
