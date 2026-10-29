'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('media', {
      fields: ['uploaded_by'],
      type: 'foreign key',
      name: 'fk_media_uploaded_by_users',
      references: { table: 'users', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('page_contents', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_page_contents_updated_by_users',
      references: { table: 'users', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('whatsapp_messages', {
      fields: ['tour_id'],
      type: 'foreign key',
      name: 'fk_whatsapp_messages_tour_id_tours',
      references: { table: 'tours', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('pricings', ['tour_id', 'is_active', 'valid_from', 'valid_to'], {
      name: 'idx_pricings_active_period',
    });
    await queryInterface.addIndex('whatsapp_messages', ['created_at'], {
      name: 'idx_whatsapp_messages_created_at',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('whatsapp_messages', 'idx_whatsapp_messages_created_at');
    await queryInterface.removeIndex('pricings', 'idx_pricings_active_period');
    await queryInterface.removeConstraint('whatsapp_messages', 'fk_whatsapp_messages_tour_id_tours');
    await queryInterface.removeConstraint('page_contents', 'fk_page_contents_updated_by_users');
    await queryInterface.removeConstraint('media', 'fk_media_uploaded_by_users');
  },
};
