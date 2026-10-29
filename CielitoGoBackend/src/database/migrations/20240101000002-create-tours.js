'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tours', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(250),
        unique: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      short_description: {
        type: Sequelize.STRING(500),
      },
      duration: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD',
      },
      capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'moderate', 'hard', 'extreme'),
        defaultValue: 'moderate',
      },
      location: {
        type: Sequelize.STRING(200),
      },
      highlights: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      includes: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      itinerary: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      image_url: {
        type: Sequelize.STRING(500),
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      meta_title: {
        type: Sequelize.STRING(200),
      },
      meta_description: {
        type: Sequelize.STRING(500),
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
    await queryInterface.dropTable('tours');
  },
};
