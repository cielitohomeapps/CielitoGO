'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE public."SequelizeMeta" ENABLE ROW LEVEL SECURITY',
    );
    await queryInterface.sequelize.query(
      'REVOKE ALL PRIVILEGES ON TABLE public."SequelizeMeta" FROM anon, authenticated',
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE public."SequelizeMeta" DISABLE ROW LEVEL SECURITY',
    );
  },
};
