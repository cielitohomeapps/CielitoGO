const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('./departureController');
const { authenticate, optionalAuthenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');

const router = Router({ mergeParams: true });

router.get('/', optionalAuthenticate, [
  param('id').isUUID(),
  query('status').optional().isIn(['available', 'sold_out', 'cancelled']),
  validate,
], controller.getAll);
router.post('/', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  body('startDate').isISO8601({ strict: true }),
  body('endDate').isISO8601({ strict: true }),
  body('capacity').isInt({ min: 1 }).toInt(),
  body('availableSpots').optional().isInt({ min: 0 }).toInt(),
  body('priceOverride').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional().isAlpha().isLength({ min: 3, max: 3 }).toUpperCase(),
  body('status').optional().isIn(['available', 'sold_out', 'cancelled']),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  validate,
], controller.create);
router.put('/:departureId', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  param('departureId').isUUID(),
  body('startDate').optional().isISO8601({ strict: true }),
  body('endDate').optional().isISO8601({ strict: true }),
  body('capacity').optional().isInt({ min: 1 }).toInt(),
  body('availableSpots').optional().isInt({ min: 0 }).toInt(),
  body('priceOverride').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional().isAlpha().isLength({ min: 3, max: 3 }).toUpperCase(),
  body('status').optional().isIn(['available', 'sold_out', 'cancelled']),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  validate,
], controller.update);
router.delete('/:departureId', authenticate, authorize('admin'), [
  param('id').isUUID(),
  param('departureId').isUUID(),
  validate,
], controller.cancel);

module.exports = router;
