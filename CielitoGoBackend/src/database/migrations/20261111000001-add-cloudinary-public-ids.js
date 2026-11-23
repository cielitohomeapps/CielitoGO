'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tours', 'image_public_id', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('tour_images', 'public_id', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('promotions', 'image_public_id', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('promotion_images', 'public_id', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('promotion_images', 'public_id');
    await queryInterface.removeColumn('promotions', 'image_public_id');
    await queryInterface.removeColumn('tour_images', 'public_id');
    await queryInterface.removeColumn('tours', 'image_public_id');
  },
};
