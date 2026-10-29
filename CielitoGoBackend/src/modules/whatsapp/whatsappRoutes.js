const { Router } = require('express');
const { body, param, query } = require('express-validator');
const whatsappController = require('./whatsappController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');
const { webhookLimiter } = require('../../middleware/rateLimit');
const verifyWhatsAppSignature = require('../../middleware/whatsappSignature');

const router = Router();

router.get('/webhook', webhookLimiter, whatsappController.webhookVerify);
router.post('/webhook', webhookLimiter, verifyWhatsAppSignature, whatsappController.webhookHandler);

router.get('/messages', authenticate, [
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['sent', 'delivered', 'read', 'failed']),
  query('from').optional().isString().isLength({ min: 7, max: 50 }),
  validate,
], whatsappController.getMessages);
router.get('/conversation/:phone', authenticate, [
  param('phone').isString().isLength({ min: 7, max: 50 }),
  validate,
], whatsappController.getConversation);
router.get('/unread', authenticate, whatsappController.getUnreadCount);
router.put('/read/:id', authenticate, [param('id').isUUID(), validate], whatsappController.markAsRead);

router.post('/send', authenticate, authorize('admin', 'editor'), [
  body('to').notEmpty().withMessage('Teléfono requerido'),
  body('message').notEmpty().withMessage('Mensaje requerido'),
  body('type').optional().isIn(['text', 'template', 'image']),
  validate,
], whatsappController.sendMessage);

router.post('/send-tour', authenticate, authorize('admin', 'editor'), [
  body('to').notEmpty().withMessage('Teléfono requerido'),
  body('tourId').isUUID().withMessage('Tour requerido'),
  validate,
], whatsappController.sendTourInfo);

module.exports = router;
