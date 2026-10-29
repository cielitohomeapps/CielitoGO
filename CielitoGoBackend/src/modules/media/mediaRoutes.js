const { Router } = require('express');
const { body, param, query } = require('express-validator');
const mediaController = require('./mediaController');
const { authenticate, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { validate } = require('../../utils/validators');
const config = require('../../config');

const router = Router();

router.use(authenticate);

router.get('/', [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString().isLength({ max: 100 }),
  validate,
], mediaController.getAll);
router.get('/:id', [param('id').isUUID(), validate], mediaController.getById);

router.post('/', authorize('admin', 'editor'), upload.single('file'), upload.validateImages, [
  body('alt').optional().isString().isLength({ max: 200 }),
  body('category').optional().isString().isLength({ max: 100 }),
  validate,
], mediaController.upload);
router.post('/multiple', authorize('admin', 'editor'), upload.array('files', 10), upload.validateImages, [
  body('alt').optional().isString().isLength({ max: 200 }),
  body('category').optional().isString().isLength({ max: 100 }),
  validate,
], mediaController.uploadMultiple);

router.put('/:id', authorize('admin', 'editor'), [
  param('id').isUUID(),
  body('alt').optional().isString().isLength({ max: 200 }),
  body('category').optional().isString().isLength({ max: 100 }),
  validate,
], mediaController.update);
router.delete('/:id', authorize('admin'), [param('id').isUUID(), validate], mediaController.delete);
router.put('/:id/resize', authorize('admin'), [
  param('id').isUUID(),
  body('width').isInt({ min: 1, max: config.upload.maxWidth }),
  body('height').isInt({ min: 1, max: config.upload.maxHeight }),
  validate,
], mediaController.resize);

module.exports = router;
