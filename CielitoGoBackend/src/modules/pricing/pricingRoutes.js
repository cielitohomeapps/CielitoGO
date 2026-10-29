const { Router } = require('express');
const { body, param, query } = require('express-validator');
const pricingController = require('./pricingController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');

const router = Router();

router.get('/active/:tourId', [param('tourId').isUUID(), validate], pricingController.getActivePrice);
router.get('/', authenticate, [
  query('tourId').optional().isUUID(),
  query('season').optional().isIn(['low', 'mid', 'high', 'peak', 'custom']),
  query('active').optional().isBoolean(),
  validate,
], pricingController.getAll);
router.get('/:id', authenticate, [param('id').isUUID(), validate], pricingController.getById);

router.post('/', authenticate, authorize('admin', 'editor'), [
  body('tourId').isUUID().withMessage('Tour requerido'),
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Nombre requerido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser un número no negativo'),
  body('discountPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('validFrom').optional({ nullable: true }).isISO8601({ strict: true }),
  body('validTo').optional({ nullable: true }).isISO8601({ strict: true }),
  body('minPeople').optional().isInt({ min: 1 }),
  body('maxPeople').optional({ nullable: true }).isInt({ min: 1 }),
  validate,
], pricingController.create);

router.put('/:id', authenticate, authorize('admin', 'editor'), [
  param('id').isUUID(),
  body('tourId').optional().isUUID(),
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('price').optional().isFloat({ min: 0 }),
  body('discountPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('validFrom').optional({ nullable: true }).isISO8601({ strict: true }),
  body('validTo').optional({ nullable: true }).isISO8601({ strict: true }),
  body('minPeople').optional().isInt({ min: 1 }),
  body('maxPeople').optional({ nullable: true }).isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  validate,
], pricingController.update);
router.delete('/:id', authenticate, authorize('admin'), [param('id').isUUID(), validate], pricingController.delete);

module.exports = router;
