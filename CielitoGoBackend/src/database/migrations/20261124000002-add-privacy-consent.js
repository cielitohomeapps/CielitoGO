'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of ['quotes', 'reservations']) {
      await queryInterface.addColumn(table, 'consent_accepted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      await queryInterface.addColumn(table, 'privacy_notice_version', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
      await queryInterface.sequelize.query(
        `UPDATE public.${table} SET consent_accepted_at = created_at, privacy_notice_version = 'legacy-import' WHERE consent_accepted_at IS NULL`,
      );
      await queryInterface.changeColumn(table, 'consent_accepted_at', {
        type: Sequelize.DATE,
        allowNull: false,
      });
      await queryInterface.changeColumn(table, 'privacy_notice_version', {
        type: Sequelize.STRING(50),
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    for (const table of ['reservations', 'quotes']) {
      await queryInterface.removeColumn(table, 'privacy_notice_version');
      await queryInterface.removeColumn(table, 'consent_accepted_at');
    }
  },
};
