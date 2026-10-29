const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('./promotionController');
const { authenticate, optionalAuthenticate, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { parseJsonFields } = require('../../middleware/normalizeMultipart');
const { validate } = require('../../utils/validators');

const router = Router();

router.get('/', optionalAuthenticate, [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('active').optional().isBoolean(),
  query('featured').optional().isBoolean(),
  query('tourId').optional().isUUID(),
  query('destination').optional().trim().isLength({ max: 200 }),
  validate,
], controller.getAll);
router.get('/:id', optionalAuthenticate, [param('id').isUUID(), validate], controller.getById);

const writeValidators = [
  body('tourId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ min: 1, max: 10000 }),
  body('destination').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('promotionalPrice').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional().isAlpha().isLength({ min: 3, max: 3 }).toUpperCase(),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('restrictions').optional().isArray({ max: 100 }),
  body('conditions').optional().isArray({ max: 100 }),
  body('isActive').optional().isBoolean().toBoolean(),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }).toInt(),
];

router.post('/', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, parseJsonFields('restrictions', 'conditions'), [
  body('title').trim().isLength({ min: 2, max: 200 }),
  body('description').trim().isLength({ min: 1, max: 10000 }),
  ...writeValidators,
  validate,
], controller.create);
router.put('/:id', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, parseJsonFields('restrictions', 'conditions'), [
  param('id').isUUID(),
  ...writeValidators,
  validate,
], controller.update);
router.delete('/:id', authenticate, authorize('admin'), [param('id').isUUID(), validate], controller.deactivate);
router.post('/:id/images', authenticate, authorize('admin', 'editor'), upload.single('image'), upload.validateImages, [
  param('id').isUUID(),
  body('alt').optional().isString().isLength({ max: 200 }),
  body('sortOrder').optional().isInt({ min: 0 }).toInt(),
  body('isPrimary').optional().isBoolean().toBoolean(),
  validate,
], controller.addImage);
router.delete('/:id/images/:imageId', authenticate, authorize('admin'), [
  param('id').isUUID(),
  param('imageId').isUUID(),
  validate,
], controller.deleteImage);

module.exports = router;
