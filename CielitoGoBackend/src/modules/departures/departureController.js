const { Op } = require('sequelize');
const { sequelize, Tour, TourDeparture, Reservation } = require('../../models');
const createHttpError = require('../../utils/httpError');
const { validateDateRange } = require('../../utils/domainValidation');

const departureFields = ['startDate', 'endDate', 'capacity', 'availableSpots', 'priceOverride', 'currency', 'status', 'notes'];
const pickFields = (body) => Object.fromEntries(
  departureFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field] === '' ? null : body[field]])
);

const validateRules = (data) => {
  validateDateRange(data.startDate, data.endDate);
  if (Number(data.availableSpots) > Number(data.capacity)) {
    throw createHttpError(422, 'INVALID_AVAILABILITY', 'Los lugares disponibles no pueden exceder la capacidad');
  }
  if (Number(data.availableSpots) === 0 && data.status === 'available') data.status = 'sold_out';
  if (Number(data.availableSpots) > 0 && data.status === 'sold_out') data.status = 'available';
};

exports.getAll = async (req, res, next) => {
  try {
    const tourWhere = { id: req.params.id, ...(!req.user ? { isActive: true } : {}) };
    const tour = await Tour.findOne({ where: tourWhere, attributes: ['id', 'name', 'isActive'] });
    if (!tour) throw createHttpError(404, 'TOUR_NOT_FOUND', 'Tour no encontrado');

    const where = { tourId: tour.id };
    if (!req.user) {
      where.status = 'available';
      where.startDate = { [Op.gte]: new Date().toISOString().slice(0, 10) };
    } else if (req.query.status) {
      where.status = req.query.status;
    }
    const departures = await TourDeparture.findAll({ where, order: [['startDate', 'ASC']] });
    res.json({ tour, departures });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) throw createHttpError(404, 'TOUR_NOT_FOUND', 'Tour no encontrado');
    const data = pickFields(req.body);
    data.availableSpots = data.availableSpots ?? data.capacity;
    data.status = data.status || 'available';
    validateRules(data);
    const departure = await TourDeparture.create({ ...data, tourId: tour.id });
    res.status(201).json({ departure });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    let departure;
    await sequelize.transaction(async (transaction) => {
      departure = await TourDeparture.findOne({
        where: { id: req.params.departureId, tourId: req.params.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!departure) throw createHttpError(404, 'DEPARTURE_NOT_FOUND', 'Salida no encontrada');
      const updates = pickFields(req.body);
      const confirmedSeats = Number(await Reservation.sum('travelers', {
        where: { departureId: departure.id, status: 'confirmed' },
        transaction,
      }) || 0);
      if (updates.capacity !== undefined && updates.availableSpots === undefined) {
        updates.availableSpots = Number(departure.availableSpots) + Number(updates.capacity) - Number(departure.capacity);
      }
      const merged = { ...departure.toJSON(), ...updates };
      if (Number(merged.capacity) < confirmedSeats || Number(merged.availableSpots) > Number(merged.capacity) - confirmedSeats) {
        throw createHttpError(409, 'CAPACITY_BELOW_CONFIRMED', 'La capacidad o disponibilidad es incompatible con las reservaciones confirmadas');
      }
      validateRules(merged);
      updates.status = merged.status;
      await departure.update(updates, { transaction });
    });
    res.json({ departure });
  } catch (error) {
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    let departure;
    await sequelize.transaction(async (transaction) => {
      departure = await TourDeparture.findOne({
        where: { id: req.params.departureId, tourId: req.params.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!departure) throw createHttpError(404, 'DEPARTURE_NOT_FOUND', 'Salida no encontrada');
      const confirmed = await Reservation.count({
        where: { departureId: departure.id, status: 'confirmed' },
        transaction,
      });
      if (confirmed > 0) {
        throw createHttpError(409, 'DEPARTURE_HAS_CONFIRMED_RESERVATIONS', 'Cancela o reasigna las reservaciones confirmadas antes de cancelar la salida');
      }
      await departure.update({ status: 'cancelled' }, { transaction });
    });
    res.json({ message: 'Salida cancelada', departure });
  } catch (error) {
    next(error);
  }
};
