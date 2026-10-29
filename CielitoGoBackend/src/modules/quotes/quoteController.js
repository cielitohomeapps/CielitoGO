const { Op } = require('sequelize');
const {
  sequelize,
  Quote,
  QuoteStatusHistory,
  Customer,
  Reservation,
  User,
} = require('../../models');
const createHttpError = require('../../utils/httpError');
const { getPagination, paginationResponse } = require('../../utils/pagination');
const { validateDateRange, validateParty } = require('../../utils/domainValidation');
const { quoteTransitions, assertTransition } = require('../../utils/workflow');
const { createReservation } = require('../reservations/reservationService');

const quoteFields = [
  'customerId', 'customerName', 'phone', 'email', 'destination', 'departureDate',
  'returnDate', 'travelers', 'adults', 'minors', 'budget', 'comments',
];
const pickFields = (body) => Object.fromEntries(
  quoteFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field] === '' ? null : body[field]])
);

const detailInclude = [
  { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
  {
    model: QuoteStatusHistory,
    as: 'history',
    separate: true,
    order: [['createdAt', 'ASC']],
    include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
  },
  { model: Reservation, as: 'reservation', attributes: ['id', 'code', 'status', 'createdAt'] },
];

exports.create = async (req, res, next) => {
  try {
    const data = { ...pickFields(req.body), customerId: null };
    validateDateRange(data.departureDate, data.returnDate);
    validateParty(data);
    const quote = await sequelize.transaction(async (transaction) => {
      const created = await Quote.create({ ...data, minors: data.minors || 0, status: 'new' }, { transaction });
      await QuoteStatusHistory.create({
        quoteId: created.id,
        fromStatus: null,
        toStatus: 'new',
        note: 'Solicitud de cotización recibida',
        changedBy: null,
      }, { transaction });
      return created;
    });
    res.status(201).json({ quote: { id: quote.id, status: quote.status, createdAt: quote.createdAt } });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.customerId) where.customerId = req.query.customerId;
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { customerName: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
        { destination: { [Op.iLike]: term } },
      ];
    }
    const { count, rows: quotes } = await Quote.findAndCountAll({
      where,
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ quotes, pagination: paginationResponse(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const quote = await Quote.findByPk(req.params.id, { include: detailInclude });
    if (!quote) throw createHttpError(404, 'QUOTE_NOT_FOUND', 'Cotización no encontrada');
    res.json({ quote });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) throw createHttpError(404, 'QUOTE_NOT_FOUND', 'Cotización no encontrada');
    const updates = pickFields(req.body);
    const merged = { ...quote.toJSON(), ...updates };
    validateDateRange(merged.departureDate, merged.returnDate);
    validateParty(merged);
    await quote.update(updates);
    res.json({ quote });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const quote = await Quote.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!quote) throw createHttpError(404, 'QUOTE_NOT_FOUND', 'Cotización no encontrada');
      assertTransition(quoteTransitions, quote.status, req.body.status, 'la cotización');
      const fromStatus = quote.status;
      await quote.update({ status: req.body.status }, { transaction });
      await QuoteStatusHistory.create({
        quoteId: quote.id,
        fromStatus,
        toStatus: req.body.status,
        note: req.body.note || null,
        changedBy: req.user.id,
      }, { transaction });
    });
    res.json({ quote: await Quote.findByPk(req.params.id, { include: detailInclude }) });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const quote = await Quote.findByPk(req.params.id, { attributes: ['id'] });
    if (!quote) throw createHttpError(404, 'QUOTE_NOT_FOUND', 'Cotización no encontrada');
    const history = await QuoteStatusHistory.findAll({
      where: { quoteId: quote.id },
      include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

exports.convertToReservation = async (req, res, next) => {
  try {
    const reservation = await sequelize.transaction(async (transaction) => {
      const quote = await Quote.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!quote) throw createHttpError(404, 'QUOTE_NOT_FOUND', 'Cotización no encontrada');
      if (quote.status !== 'accepted') {
        throw createHttpError(409, 'QUOTE_NOT_ACCEPTED', 'La cotización debe estar aceptada antes de convertirla');
      }
      const existing = await Reservation.findOne({
        where: { quoteId: quote.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (existing) throw createHttpError(409, 'QUOTE_ALREADY_CONVERTED', 'La cotización ya tiene una reservación asociada');

      return createReservation({
        quoteId: quote.id,
        customerId: quote.customerId,
        tourId: req.body.tourId,
        promotionId: req.body.promotionId || null,
        departureId: req.body.departureId || null,
        customerName: quote.customerName,
        phone: quote.phone,
        email: quote.email,
        startDate: req.body.startDate || quote.departureDate,
        endDate: req.body.endDate || quote.returnDate,
        travelers: quote.travelers,
        adults: quote.adults,
        minors: quote.minors,
        notes: req.body.notes || quote.comments,
        travelersList: req.body.travelersList || [],
        historyNote: 'Reservación creada desde cotización aceptada',
      }, { transaction, changedBy: req.user.id, status: 'pending' });
    });
    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
};
