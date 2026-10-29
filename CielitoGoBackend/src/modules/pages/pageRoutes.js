const { Router } = require('express');
const { body, param, query } = require('express-validator');
const pageController = require('./pageController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');

const router = Router();
const contentTypes = ['text', 'image', 'json', 'boolean', 'number', 'link'];
const settingTypes = ['text', 'image', 'json', 'boolean', 'number'];
const identifier = /^[a-zA-Z0-9_-]+$/;

router.get('/content/:page', [param('page').matches(identifier).isLength({ max: 100 }), validate], pageController.getPageContent);
router.get('/content', authenticate, pageController.getAllContent);

router.put('/content/:page/:section/:key', authenticate, authorize('admin', 'editor'), [
  param('page').matches(identifier).isLength({ max: 100 }),
  param('section').matches(identifier).isLength({ max: 100 }),
  param('key').matches(identifier).isLength({ max: 150 }),
  body('value').exists(),
  body('type').optional().isIn(contentTypes),
  body('metadata').optional({ nullable: true }).isObject(),
  validate,
], pageController.updateContent);
router.post('/content/bulk', authenticate, authorize('admin', 'editor'), [
  body('items').isArray({ min: 1, max: 500 }),
  body('items.*.page').matches(identifier).isLength({ max: 100 }),
  body('items.*.section').matches(identifier).isLength({ max: 100 }),
  body('items.*.key').matches(identifier).isLength({ max: 150 }),
  body('items.*.value').exists(),
  body('items.*.type').optional().isIn(contentTypes),
  body('items.*.metadata').optional({ nullable: true }).isObject(),
  validate,
], pageController.bulkUpdate);
router.delete('/content/:page/:section/:key', authenticate, authorize('admin'), [
  param('page').matches(identifier).isLength({ max: 100 }),
  param('section').matches(identifier).isLength({ max: 100 }),
  param('key').matches(identifier).isLength({ max: 150 }),
  validate,
], pageController.deleteContent);

router.get('/settings', authenticate, [query('group').optional().matches(identifier).isLength({ max: 100 }), validate], pageController.getSettings);
router.put('/settings/:key', authenticate, authorize('admin'), [
  param('key').matches(identifier).isLength({ max: 150 }),
  body('value').exists(),
  body('type').optional().isIn(settingTypes),
  body('group').optional().matches(identifier).isLength({ max: 100 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 300 }),
  validate,
], pageController.updateSetting);
router.post('/settings/bulk', authenticate, authorize('admin'), [
  body('settings').isArray({ min: 1, max: 500 }),
  body('settings.*.key').matches(identifier).isLength({ max: 150 }),
  body('settings.*.value').exists(),
  body('settings.*.type').optional().isIn(settingTypes),
  body('settings.*.group').optional().matches(identifier).isLength({ max: 100 }),
  body('settings.*.description').optional({ nullable: true }).isString().isLength({ max: 300 }),
  validate,
], pageController.bulkUpdateSettings);

module.exports = router;
