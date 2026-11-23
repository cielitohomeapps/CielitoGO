'use strict';

const crypto = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quotes', 'code', {
      type: Sequelize.STRING(40),
      allowNull: true,
    });

    const [quotes] = await queryInterface.sequelize.query(
      'SELECT id, created_at FROM quotes ORDER BY created_at ASC',
    );
    const used = new Set();

    for (const quote of quotes) {
      const year = new Date(quote.created_at).getFullYear();
      let attempt = 0;
      let code;
      do {
        const suffix = crypto.createHash('sha256').update(`${quote.id}:${attempt}`).digest('hex').slice(0, 5).toUpperCase();
        code = `CG-${year}-${suffix}`;
        attempt += 1;
      } while (used.has(code));
      used.add(code);
      await queryInterface.bulkUpdate('quotes', { code }, { id: quote.id });
    }

    await queryInterface.changeColumn('quotes', 'code', {
      type: Sequelize.STRING(40),
      allowNull: false,
    });
    await queryInterface.addIndex('quotes', ['code'], {
      name: 'uq_quotes_code',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('quotes', 'uq_quotes_code');
    await queryInterface.removeColumn('quotes', 'code');
  },
};
