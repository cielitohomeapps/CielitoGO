const { Router } = require('express');
const { body, param, query } = require('express-validator');
const tourController = require('./tourController');
const { authenticate, optionalAuthenticate, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { validate } = require('../../utils/validators');
const { parseJsonFields } = require('../../middleware/normalizeMultipart');
const departureRoutes = require('../departures/departureRoutes');

const router = Router();

router.use('/:id/departures', departureRoutes);

router.get('/', optionalAuthenticate, [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('active').optional().isBoolean(),
  query('search').optional().isString().isLength({ max: 200 }),
  validate,
], tourController.getAll);
router.get('/:id', optionalAuthenticate, [param('id').isUUID(), validate], tourController.getById);

router.put('/reorder', authenticate, authorize('admin'), [
  body('items').isArray({ min: 1, max: 500 }),
  body('items.*.id').isUUID(),
  body('items.*.sortOrder').isInt({ min: 0 }),
  validate,
], tourController.reorder);

router.post('/', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, parseJsonFields('highlights', 'includes', 'excludes', 'restrictions', 'conditions', 'itinerary'), [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Nombre requerido'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descripción requerida'),
  body('duration').trim().isLength({ min: 1, max: 100 }).withMessage('Duración requerida'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser un número no negativo'),
  body('capacity').optional().isInt({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }).isAlpha(),
  body('highlights').optional().isArray({ max: 100 }),
  body('includes').optional().isArray({ max: 100 }),
  body('excludes').optional().isArray({ max: 100 }),
  body('restrictions').optional().isArray({ max: 100 }),
  body('conditions').optional().isArray({ max: 100 }),
  body('itinerary').optional().isArray({ max: 100 }),
  validate,
], tourController.create);

router.put('/:id', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, parseJsonFields('highlights', 'includes', 'excludes', 'restrictions', 'conditions', 'itinerary'), [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('duration').optional().trim().isLength({ min: 1, max: 100 }),
  body('price').optional().isFloat({ min: 0 }),
  body('capacity').optional().isInt({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }).isAlpha(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('highlights').optional().isArray({ max: 100 }),
  body('includes').optional().isArray({ max: 100 }),
  body('excludes').optional().isArray({ max: 100 }),
  body('restrictions').optional().isArray({ max: 100 }),
  body('conditions').optional().isArray({ max: 100 }),
  body('itinerary').optional().isArray({ max: 100 }),
  validate,
], tourController.update);
router.delete('/:id', authenticate, authorize('admin'), [param('id').isUUID(), validate], tourController.delete);

router.post('/:id/images', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, [
  param('id').isUUID(),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('isPrimary').optional().isBoolean(),
  validate,
], tourController.addImage);
router.delete('/:id/images/:imageId', authenticate, authorize('admin'), [
  param('id').isUUID(),
  param('imageId').isUUID(),
  validate,
], tourController.deleteImage);

module.exports = router;
