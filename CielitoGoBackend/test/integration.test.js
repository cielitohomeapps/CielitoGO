const test = require('node:test');
const assert = require('node:assert/strict');

const databaseUrl = process.env.DB_TEST_URL;

if (!databaseUrl) {
  test('integration tests require DB_TEST_URL', { skip: true }, () => {});
} else {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-with-at-least-32-chars';

  const {
    sequelize,
    Tour,
    TourDeparture,
    Reservation,
    ReservationStatusHistory,
  } = require('../src/models');
  const {
    createReservation,
    transitionReservation,
  } = require('../src/modules/reservations/reservationService');

  const assertTestDatabase = () => {
    const parsed = new URL(databaseUrl);
    const databaseName = parsed.pathname.replace(/^\//, '');
    assert.match(databaseName, /test/i, 'DB_TEST_URL debe apuntar a una base cuyo nombre contenga "test"');
  };

  test.before(async () => {
    assertTestDatabase();
    await sequelize.authenticate();
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  });

  test.after(async () => {
    await sequelize.close();
  });

  test('migrations expose persistent media metadata', async () => {
    const [columns] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'media' AND column_name = 'public_id'
    `);
    assert.equal(columns.length, 1);
  });

  test('concurrent confirmations cannot oversell a departure', async () => {
    const tour = await Tour.create({
      name: 'Tour de concurrencia',
      slug: `tour-concurrencia-${Date.now()}`,
      description: 'Fixture de integración',
      duration: '1 día',
      price: 100,
      currency: 'MXN',
      capacity: 5,
    });
    const departure = await TourDeparture.create({
      tourId: tour.id,
      startDate: '2027-06-01',
      endDate: '2027-06-02',
      capacity: 5,
      availableSpots: 5,
      currency: 'MXN',
      status: 'available',
    });

    const makeReservation = (suffix) => sequelize.transaction((transaction) => createReservation({
      tourId: tour.id,
      departureId: departure.id,
      customerName: `Cliente ${suffix}`,
      phone: `+52000000000${suffix}`,
      email: `cliente${suffix}@example.test`,
      startDate: departure.startDate,
      endDate: departure.endDate,
      travelers: 4,
      adults: 4,
      minors: 0,
    }, { transaction }));

    const [first, second] = await Promise.all([makeReservation('1'), makeReservation('2')]);
    const results = await Promise.allSettled([
      transitionReservation(sequelize, first.id, 'confirmed', null, null),
      transitionReservation(sequelize, second.id, 'confirmed', null, null),
    ]);

    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = results.find((result) => result.status === 'rejected');
    assert.equal(rejected.reason.code, 'INSUFFICIENT_AVAILABILITY');

    await departure.reload();
    assert.equal(departure.availableSpots, 1);
    assert.equal(await Reservation.count({ where: { departureId: departure.id, status: 'confirmed' } }), 1);
    assert.equal(await ReservationStatusHistory.count(), 3);
  });
}
