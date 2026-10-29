const { Router } = require('express');
const { body, param } = require('express-validator');
const authController = require('./authController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../utils/validators');
const { authLimiter } = require('../../middleware/rateLimit');

const router = Router();

router.post('/login', authLimiter, [
  body('email').trim().isEmail().normalizeEmail().withMessage('Email válido requerido'),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Contraseña requerida'),
  validate,
], authController.login);

router.post('/register', authenticate, authorize('admin'), authLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre válido requerido'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Email válido requerido'),
  body('password').isString().isLength({ min: 12, max: 128 }).withMessage('La contraseña debe tener entre 12 y 128 caracteres'),
  body('role').optional().isIn(['admin', 'editor']),
  validate,
], authController.register);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('password').optional().isString().isLength({ min: 12, max: 128 }),
  validate,
], authController.updateProfile);

router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), [
  param('id').isUUID(),
  body('role').isIn(['admin', 'editor']),
  validate,
], authController.updateUserRole);
router.put('/users/:id/toggle', authenticate, authorize('admin'), [
  param('id').isUUID(),
  validate,
], authController.toggleUserActive);

module.exports = router;
