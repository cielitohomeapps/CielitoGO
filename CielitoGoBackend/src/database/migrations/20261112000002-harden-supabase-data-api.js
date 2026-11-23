'use strict';

const applicationTables = [
  'users',
  'tours',
  'tour_images',
  'tour_departures',
  'promotions',
  'promotion_images',
  'pricings',
  'settings',
  'page_contents',
  'media',
  'whatsapp_messages',
  'customers',
  'quotes',
  'quote_status_history',
  'reservations',
  'reservation_travelers',
  'reservation_status_history',
];

const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const table of applicationTables) {
        const qualifiedTable = `public.${quoteIdentifier(table)}`;
        await queryInterface.sequelize.query(
          `ALTER TABLE ${qualifiedTable} ENABLE ROW LEVEL SECURITY`,
          { transaction },
        );
        await queryInterface.sequelize.query(
          `REVOKE ALL PRIVILEGES ON TABLE ${qualifiedTable} FROM anon, authenticated`,
          { transaction },
        );
      }

      await queryInterface.sequelize.query(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated',
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const table of applicationTables) {
        const qualifiedTable = `public.${quoteIdentifier(table)}`;
        await queryInterface.sequelize.query(
          `ALTER TABLE ${qualifiedTable} DISABLE ROW LEVEL SECURITY`,
          { transaction },
        );
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
