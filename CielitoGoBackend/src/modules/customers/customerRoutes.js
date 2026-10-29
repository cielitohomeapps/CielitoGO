const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('./customerController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');

const router = Router();
router.use(authenticate);

router.get('/', [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('active').optional().isBoolean(),
  query('search').optional().trim().isLength({ max: 200 }),
  validate,
], controller.getAll);
router.get('/:id/quotes', [param('id').isUUID(), validate], controller.getQuotes);
router.get('/:id/reservations', [param('id').isUUID(), validate], controller.getReservations);
router.get('/:id', [param('id').isUUID(), validate], controller.getById);

const customerValidators = [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional({ nullable: true }).trim().isLength({ max: 150 }),
  body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 7, max: 50 }),
  body('isActive').optional().isBoolean().toBoolean(),
];

router.post('/', authorize('admin', 'editor'), [
  body('firstName').trim().isLength({ min: 1, max: 100 }),
  body('phone').trim().isLength({ min: 7, max: 50 }),
  ...customerValidators,
  validate,
], controller.create);
router.put('/:id', authorize('admin', 'editor'), [
  param('id').isUUID(),
  ...customerValidators,
  validate,
], controller.update);
router.delete('/:id', authorize('admin'), [param('id').isUUID(), validate], controller.deactivate);

module.exports = router;
