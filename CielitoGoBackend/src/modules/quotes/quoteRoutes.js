const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('./quoteController');
const { authenticate, authorize } = require('../../middleware/auth');
const { publicFormLimiter } = require('../../middleware/rateLimit');
const { validate } = require('../../utils/validators');

const router = Router();
const statuses = ['new', 'reviewing', 'contacted', 'sent', 'accepted', 'rejected', 'cancelled'];
const validTravelerList = (travelers) => travelers.every((traveler) => (
  traveler
  && typeof traveler.firstName === 'string'
  && traveler.firstName.trim().length > 0
  && ['adult', 'minor'].includes(traveler.travelerType)
));

const editableValidators = [
  body('customerId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('customerName').optional().trim().isLength({ min: 2, max: 200 }),
  body('phone').optional().trim().isLength({ min: 7, max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('destination').optional().trim().isLength({ min: 2, max: 200 }),
  body('departureDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('returnDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('travelers').optional().isInt({ min: 1, max: 100 }).toInt(),
  body('adults').optional().isInt({ min: 1, max: 100 }).toInt(),
  body('minors').optional().isInt({ min: 0, max: 100 }).toInt(),
  body('budget').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('comments').optional({ nullable: true }).isString().isLength({ max: 5000 }),
];

router.post('/', publicFormLimiter, [
  body('customerName').trim().isLength({ min: 2, max: 200 }),
  body('phone').trim().isLength({ min: 7, max: 50 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('destination').trim().isLength({ min: 2, max: 200 }),
  body('travelers').isInt({ min: 1, max: 100 }).toInt(),
  body('adults').isInt({ min: 1, max: 100 }).toInt(),
  body('minors').optional().isInt({ min: 0, max: 100 }).toInt(),
  ...editableValidators,
  validate,
], controller.create);

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(statuses),
  query('customerId').optional().isUUID(),
  query('search').optional().trim().isLength({ max: 200 }),
  validate,
], controller.getAll);
router.get('/:id/history', authenticate, [param('id').isUUID(), validate], controller.getHistory);
router.get('/:id', authenticate, [param('id').isUUID(), validate], controller.getById);
router.patch('/:id', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  ...editableValidators,
  validate,
], controller.update);
router.patch('/:id/status', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  body('status').isIn(statuses),
  body('note').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  validate,
], controller.updateStatus);
router.post('/:id/convert-to-reservation', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  body('tourId').isUUID(),
  body('promotionId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('departureId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('travelersList').optional().isArray({ max: 100 }).custom(validTravelerList).withMessage('Cada viajero requiere nombre y tipo válido'),
  body('travelersList.*.firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('travelersList.*.lastName').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('travelersList.*.travelerType').optional().isIn(['adult', 'minor']),
  body('travelersList.*.birthDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  validate,
], controller.convertToReservation);

module.exports = router;
