const { sequelize } = require('../database');
const User = require('./User');
const Tour = require('./Tour');
const TourImage = require('./TourImage');
const Pricing = require('./Pricing');
const Media = require('./Media');
const PageContent = require('./PageContent');
const WhatsAppMessage = require('./WhatsAppMessage');
const Setting = require('./Setting');
const Customer = require('./Customer');
const Promotion = require('./Promotion');
const PromotionImage = require('./PromotionImage');
const TourDeparture = require('./TourDeparture');
const Quote = require('./Quote');
const QuoteStatusHistory = require('./QuoteStatusHistory');
const Reservation = require('./Reservation');
const ReservationTraveler = require('./ReservationTraveler');
const ReservationStatusHistory = require('./ReservationStatusHistory');

// Tour <-> TourImage
Tour.hasMany(TourImage, { foreignKey: 'tourId', as: 'images', onDelete: 'CASCADE' });
TourImage.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

// Tour <-> Pricing
Tour.hasMany(Pricing, { foreignKey: 'tourId', as: 'pricings', onDelete: 'CASCADE' });
Pricing.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

// User -> Media/PageContent audit ownership
User.hasMany(Media, { foreignKey: 'uploadedBy', as: 'uploadedMedia', onDelete: 'SET NULL' });
Media.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
User.hasMany(PageContent, { foreignKey: 'updatedBy', as: 'updatedContent', onDelete: 'SET NULL' });
PageContent.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

// WhatsAppMessage -> Tour (optional)
Tour.hasMany(WhatsAppMessage, { foreignKey: 'tourId', as: 'whatsappMessages', onDelete: 'SET NULL' });
WhatsAppMessage.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour', allowNull: true, onDelete: 'SET NULL' });

// Tour -> Promotions and departures
Tour.hasMany(Promotion, { foreignKey: 'tourId', as: 'promotions', onDelete: 'SET NULL' });
Promotion.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });
Promotion.hasMany(PromotionImage, { foreignKey: 'promotionId', as: 'images', onDelete: 'CASCADE' });
PromotionImage.belongsTo(Promotion, { foreignKey: 'promotionId', as: 'promotion' });
Tour.hasMany(TourDeparture, { foreignKey: 'tourId', as: 'departures', onDelete: 'CASCADE' });
TourDeparture.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

// Customer -> Quotes and reservations
Customer.hasMany(Quote, { foreignKey: 'customerId', as: 'quotes', onDelete: 'SET NULL' });
Quote.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Reservation, { foreignKey: 'customerId', as: 'reservations', onDelete: 'SET NULL' });
Reservation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Quote workflow
Quote.hasMany(QuoteStatusHistory, { foreignKey: 'quoteId', as: 'history', onDelete: 'CASCADE' });
QuoteStatusHistory.belongsTo(Quote, { foreignKey: 'quoteId', as: 'quote' });
User.hasMany(QuoteStatusHistory, { foreignKey: 'changedBy', as: 'quoteStatusChanges', onDelete: 'SET NULL' });
QuoteStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });
Quote.hasOne(Reservation, { foreignKey: 'quoteId', as: 'reservation', onDelete: 'SET NULL' });
Reservation.belongsTo(Quote, { foreignKey: 'quoteId', as: 'quote' });

// Reservation workflow
Tour.hasMany(Reservation, { foreignKey: 'tourId', as: 'reservations', onDelete: 'SET NULL' });
Reservation.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });
Promotion.hasMany(Reservation, { foreignKey: 'promotionId', as: 'reservations', onDelete: 'SET NULL' });
Reservation.belongsTo(Promotion, { foreignKey: 'promotionId', as: 'promotion' });
TourDeparture.hasMany(Reservation, { foreignKey: 'departureId', as: 'reservations', onDelete: 'SET NULL' });
Reservation.belongsTo(TourDeparture, { foreignKey: 'departureId', as: 'departure' });
Reservation.hasMany(ReservationTraveler, { foreignKey: 'reservationId', as: 'travelersList', onDelete: 'CASCADE' });
ReservationTraveler.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });
Reservation.hasMany(ReservationStatusHistory, { foreignKey: 'reservationId', as: 'history', onDelete: 'CASCADE' });
ReservationStatusHistory.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });
User.hasMany(ReservationStatusHistory, { foreignKey: 'changedBy', as: 'reservationStatusChanges', onDelete: 'SET NULL' });
ReservationStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

module.exports = {
  sequelize,
  User,
  Tour,
  TourImage,
  Pricing,
  Media,
  PageContent,
  WhatsAppMessage,
  Setting,
  Customer,
  Promotion,
  PromotionImage,
  TourDeparture,
  Quote,
  QuoteStatusHistory,
  Reservation,
  ReservationTraveler,
  ReservationStatusHistory,
};
