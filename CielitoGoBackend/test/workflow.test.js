const test = require('node:test');
const assert = require('node:assert/strict');

const { quoteTransitions, reservationTransitions, assertTransition } = require('../src/utils/workflow');
const { validateDateRange, validateParty } = require('../src/utils/domainValidation');
const toSlug = require('../src/utils/slug');
const generateQuoteCode = require('../src/utils/quoteCode');

test('quote codes use a readable yearly public reference', () => {
  assert.match(generateQuoteCode(new Date('2026-11-12T12:00:00Z')), /^CG-2026-[A-Z2-9]{5}$/);
});

test('quote workflow allows only declared transitions', () => {
  assert.doesNotThrow(() => assertTransition(quoteTransitions, 'new', 'reviewing', 'la cotización'));
  assert.doesNotThrow(() => assertTransition(quoteTransitions, 'sent', 'accepted', 'la cotización'));
  assert.throws(
    () => assertTransition(quoteTransitions, 'new', 'accepted', 'la cotización'),
    (error) => error.status === 409 && error.code === 'INVALID_STATUS_TRANSITION'
  );
});

test('reservation workflow protects terminal states', () => {
  assert.doesNotThrow(() => assertTransition(reservationTransitions, 'request', 'pending', 'la reservación'));
  assert.doesNotThrow(() => assertTransition(reservationTransitions, 'confirmed', 'completed', 'la reservación'));
  assert.throws(
    () => assertTransition(reservationTransitions, 'cancelled', 'confirmed', 'la reservación'),
    (error) => error.status === 409 && error.code === 'INVALID_STATUS_TRANSITION'
  );
});

test('party totals and traveler types must remain consistent', () => {
  assert.doesNotThrow(() => validateParty(
    { travelers: 3, adults: 2, minors: 1 },
    [
      { travelerType: 'adult' },
      { travelerType: 'adult' },
      { travelerType: 'minor' },
    ]
  ));
  assert.throws(
    () => validateParty({ travelers: 4, adults: 2, minors: 1 }),
    (error) => error.status === 422 && error.code === 'INVALID_TRAVELER_TOTAL'
  );
});

test('date ranges reject an end date before the start date', () => {
  assert.doesNotThrow(() => validateDateRange('2027-01-01', '2027-01-05'));
  assert.throws(
    () => validateDateRange('2027-01-05', '2027-01-01'),
    (error) => error.status === 422 && error.code === 'INVALID_DATE_RANGE'
  );
});

test('slugs preserve readable accented words', () => {
  assert.equal(toSlug('México Mágico: Verano 2027'), 'mexico-magico-verano-2027');
});
