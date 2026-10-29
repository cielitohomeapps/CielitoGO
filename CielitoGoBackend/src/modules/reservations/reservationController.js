const { Op } = require('sequelize');
const {
  sequelize,
  Reservation,
  ReservationTraveler,
  ReservationStatusHistory,
  Customer,
  Tour,
  Promotion,
  TourDeparture,
  User,
} = require('../../models');
const createHttpError = require('../../utils/httpError');
const { getPagination, paginationResponse } = require('../../utils/pagination');
const { validateDateRange, validateParty } = require('../../utils/domainValidation');
const { createReservation, transitionReservation, validateReferences } = require('./reservationService');

const editableFields = [
  'customerId', 'tourId', 'promotionId', 'departureId', 'customerName', 'phone', 'email',
  'startDate', 'endDate', 'travelers', 'adults', 'minors', 'notes',
];
const operationalFields = ['tourId', 'promotionId', 'departureId', 'startDate', 'endDate', 'travelers', 'adults', 'minors'];
const pickFields = (body) => Object.fromEntries(
  editableFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field] === '' ? null : body[field]])
);

const listInclude = [
  { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
  { model: Tour, as: 'tour', attributes: ['id', 'name', 'slug'] },
  { model: Promotion, as: 'promotion', attributes: ['id', 'title', 'slug'] },
  { model: TourDeparture, as: 'departure', attributes: ['id', 'startDate', 'endDate', 'status'] },
];

const detailInclude = [
  ...listInclude,
  { model: ReservationTraveler, as: 'travelersList', separate: true, order: [['createdAt', 'ASC']] },
  {
    model: ReservationStatusHistory,
    as: 'history',
    separate: true,
    order: [['createdAt', 'ASC']],
    include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
  },
];

exports.create = async (req, res, next) => {
  try {
    const data = {
      ...pickFields(req.body),
      customerId: null,
      travelersList: req.body.travelersList || [],
    };
    const reservation = await sequelize.transaction((transaction) => createReservation(data, { transaction }));
    res.status(201).json({
      reservation: { id: reservation.id, code: reservation.code, status: reservation.status },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.tourId) where.tourId = req.query.tourId;
    if (req.query.customerId) where.customerId = req.query.customerId;
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { code: { [Op.iLike]: term } },
        { customerName: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }
    const { count, rows: reservations } = await Reservation.findAndCountAll({
      where,
      include: listInclude,
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ reservations, pagination: paginationResponse(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, { include: detailInclude });
    if (!reservation) throw createHttpError(404, 'RESERVATION_NOT_FOUND', 'Reservación no encontrada');
    res.json({ reservation });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) throw createHttpError(404, 'RESERVATION_NOT_FOUND', 'Reservación no encontrada');
    const updates = pickFields(req.body);
    if (['confirmed', 'completed', 'cancelled'].includes(reservation.status)
      && operationalFields.some((field) => updates[field] !== undefined)) {
      throw createHttpError(409, 'RESERVATION_LOCKED', 'No se pueden modificar datos operativos en el estado actual');
    }

    const merged = { ...reservation.toJSON(), ...updates, travelersList: req.body.travelersList };
    validateDateRange(merged.startDate, merged.endDate);
    validateParty(merged, merged.travelersList);

    await sequelize.transaction(async (transaction) => {
      await validateReferences(merged, transaction);
      await reservation.update(updates, { transaction });
      if (req.body.travelersList) {
        await ReservationTraveler.destroy({ where: { reservationId: reservation.id }, transaction });
        await ReservationTraveler.bulkCreate(req.body.travelersList.map((traveler) => ({
          reservationId: reservation.id,
          firstName: traveler.firstName,
          lastName: traveler.lastName || null,
          travelerType: traveler.travelerType,
          birthDate: traveler.birthDate || null,
          notes: traveler.notes || null,
        })), { transaction });
      }
    });
    res.json({ reservation: await Reservation.findByPk(reservation.id, { include: detailInclude }) });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    await transitionReservation(sequelize, req.params.id, req.body.status, req.body.note, req.user.id);
    res.json({ reservation: await Reservation.findByPk(req.params.id, { include: detailInclude }) });
  } catch (error) {
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    await transitionReservation(sequelize, req.params.id, 'cancelled', req.body.reason, req.user.id);
    res.json({ reservation: await Reservation.findByPk(req.params.id, { include: detailInclude }) });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, { attributes: ['id'] });
    if (!reservation) throw createHttpError(404, 'RESERVATION_NOT_FOUND', 'Reservación no encontrada');
    const history = await ReservationStatusHistory.findAll({
      where: { reservationId: reservation.id },
      include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};
