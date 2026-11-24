require('dotenv').config();

const { Op } = require('sequelize');
const {
  sequelize,
  Customer,
  Quote,
  Reservation,
  ReservationTraveler,
  WhatsAppMessage,
} = require('../src/models');

const days = Number.parseInt(process.env.DATA_RETENTION_DAYS || '730', 10);
const execute = process.argv.includes('--execute');
if (!Number.isInteger(days) || days < 30) throw new Error('DATA_RETENTION_DAYS debe ser un entero de al menos 30');

const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const quoteWhere = { status: { [Op.in]: ['rejected', 'cancelled'] }, updatedAt: { [Op.lt]: cutoff } };
const reservationWhere = { status: { [Op.in]: ['completed', 'cancelled'] }, updatedAt: { [Op.lt]: cutoff } };
const messageWhere = { createdAt: { [Op.lt]: cutoff } };

async function main() {
  const reservations = await Reservation.findAll({
    attributes: ['id'],
    where: reservationWhere,
    raw: true,
  });
  const reservationIds = reservations.map(({ id }) => id);
  const [customers] = await sequelize.query(`
    SELECT c.id
    FROM customers c
    WHERE c.updated_at < :cutoff
      AND NOT EXISTS (
        SELECT 1 FROM quotes q
        WHERE q.customer_id = c.id
          AND NOT (q.status IN ('rejected', 'cancelled') AND q.updated_at < :cutoff)
      )
      AND NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.customer_id = c.id
          AND NOT (r.status IN ('completed', 'cancelled') AND r.updated_at < :cutoff)
      )
  `, { replacements: { cutoff } });
  const customerIds = customers.map(({ id }) => id);
  const counts = {
    customers: customerIds.length,
    quotes: await Quote.count({ where: quoteWhere }),
    reservations: reservationIds.length,
    reservationTravelers: reservationIds.length
      ? await ReservationTraveler.count({ where: { reservationId: { [Op.in]: reservationIds } } })
      : 0,
    whatsappMessages: await WhatsAppMessage.count({ where: messageWhere }),
  };

  if (!execute) {
    console.log(JSON.stringify({ mode: 'dry-run', cutoff, counts }, null, 2));
    return;
  }

  await sequelize.transaction(async (transaction) => {
    if (customerIds.length) {
      await Customer.update({
        firstName: 'Datos eliminados', lastName: null, email: null,
        phone: '[eliminado]', isActive: false,
      }, { where: { id: { [Op.in]: customerIds } }, transaction });
    }
    await Quote.update({
      customerName: 'Datos eliminados', phone: '[eliminado]', email: 'eliminado@example.invalid',
      destination: 'Datos eliminados', comments: null, budget: null,
    }, { where: quoteWhere, transaction });
    await Reservation.update({
      customerName: 'Datos eliminados', phone: '[eliminado]', email: 'eliminado@example.invalid',
      notes: null, cancellationReason: null,
    }, { where: reservationWhere, transaction });
    if (reservationIds.length) {
      await ReservationTraveler.update({
        firstName: 'Datos eliminados', lastName: null, birthDate: null, notes: null,
      }, { where: { reservationId: { [Op.in]: reservationIds } }, transaction });
    }
    await WhatsAppMessage.update({
      from: '[eliminado]', to: '[eliminado]', body: null, mediaUrl: null,
      contactName: null, metadata: null,
    }, { where: messageWhere, transaction });
  });
  console.log(JSON.stringify({ mode: 'execute', cutoff, counts }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
