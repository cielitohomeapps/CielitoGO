const { Router } = require('express');
const { param } = require('express-validator');
const authRoutes = require('../modules/auth/authRoutes');
const tourRoutes = require('../modules/tours/tourRoutes');
const pricingRoutes = require('../modules/pricing/pricingRoutes');
const mediaRoutes = require('../modules/media/mediaRoutes');
const pageRoutes = require('../modules/pages/pageRoutes');
const whatsappRoutes = require('../modules/whatsapp/whatsappRoutes');
const promotionRoutes = require('../modules/promotions/promotionRoutes');
const quoteRoutes = require('../modules/quotes/quoteRoutes');
const reservationRoutes = require('../modules/reservations/reservationRoutes');
const customerRoutes = require('../modules/customers/customerRoutes');
const pageController = require('../modules/pages/pageController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const {
  Tour, Pricing, WhatsAppMessage, Media, User,
  Promotion, Quote, Reservation, Customer,
} = require('../models');

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Webhook (no auth)
router.use('/whatsapp', whatsappRoutes);
router.get('/public/settings', pageController.getPublicSettings);
router.use('/promotions', promotionRoutes);
router.use('/quotes', quoteRoutes);
router.use('/reservations', reservationRoutes);
router.use('/customers', customerRoutes);

// Dashboard stats
router.get('/dashboard/stats', authenticate, async (req, res, next) => {
  try {
    const [
      tourCount, pricingCount, mediaCount, messageCount, unreadMessages, userCount,
      promotionCount, quoteCount, reservationCount, customerCount,
    ] = await Promise.all([
      Tour.count(),
      Pricing.count(),
      Media.count(),
      WhatsAppMessage.count(),
      WhatsAppMessage.count({ where: { isRead: false, direction: 'incoming' } }),
      User.count(),
      Promotion.count(),
      Quote.count(),
      Reservation.count(),
      Customer.count(),
    ]);

    const [recentMessages, recentTours, recentQuotes, recentReservations] = await Promise.all([
      WhatsAppMessage.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
      Tour.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
      Quote.findAll({
        attributes: ['id', 'customerName', 'destination', 'status', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Reservation.findAll({
        attributes: ['id', 'code', 'customerName', 'status', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    res.json({
      stats: {
        tours: tourCount,
        pricings: pricingCount,
        media: mediaCount,
        messages: messageCount,
        unreadMessages,
        users: userCount,
        promotions: promotionCount,
        quotes: quoteCount,
        reservations: reservationCount,
        customers: customerCount,
      },
      recentMessages,
      recentTours,
      recentQuotes,
      recentReservations,
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use('/tours', tourRoutes);
router.use('/pricing', pricingRoutes);
router.use('/media', mediaRoutes);
router.use('/pages', pageRoutes);

// Public content endpoint (for frontend)
router.get('/content/:page', [
  param('page').matches(/^[a-zA-Z0-9_-]+$/).isLength({ max: 100 }),
  validate,
], pageController.getPageContent);

module.exports = router;
