module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('tours', ['slug'], { unique: true });
    await queryInterface.addIndex('tours', ['is_active']);
    await queryInterface.addIndex('tours', ['sort_order']);
    await queryInterface.addIndex('tour_images', ['tour_id']);
    await queryInterface.addIndex('pricings', ['tour_id']);
    await queryInterface.addIndex('pricings', ['season']);
    await queryInterface.addIndex('media', ['category']);
    await queryInterface.addIndex('whatsapp_messages', ['from']);
    await queryInterface.addIndex('whatsapp_messages', ['direction']);
    await queryInterface.addIndex('whatsapp_messages', ['is_read']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('whatsapp_messages', 'whatsapp_messages_from');
    await queryInterface.removeIndex('whatsapp_messages', 'whatsapp_messages_direction');
    await queryInterface.removeIndex('whatsapp_messages', 'whatsapp_messages_is_read');
    await queryInterface.removeIndex('media', 'media_category');
    await queryInterface.removeIndex('pricings', 'pricings_tour_id');
    await queryInterface.removeIndex('pricings', 'pricings_season');
    await queryInterface.removeIndex('tour_images', 'tour_images_tour_id');
    await queryInterface.removeIndex('tours', 'tours_slug');
    await queryInterface.removeIndex('tours', 'tours_is_active');
    await queryInterface.removeIndex('tours', 'tours_sort_order');
  },
};
