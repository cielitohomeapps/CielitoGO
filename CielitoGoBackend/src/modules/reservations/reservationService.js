const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  Reservation,
  ReservationTraveler,
  ReservationStatusHistory,
  Tour,
  Promotion,
  TourDeparture,
} = require('../../models');
const createHttpError = require('../../utils/httpError');
const { validateDateRange, validateParty } = require('../../utils/domainValidation');
const { reservationTransitions, assertTransition } = require('../../utils/workflow');

const generateCode = () => `CG-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const validateReferences = async (data, transaction) => {
  const tour = await Tour.findOne({ where: { id: data.tourId, isActive: true }, transaction });
  if (!tour) throw createHttpError(422, 'INVALID_TOUR', 'El paquete seleccionado no existe o está inactivo');

  let departure = null;
  if (data.departureId) {
    departure = await TourDeparture.findByPk(data.departureId, { transaction });
    if (!departure || departure.tourId !== tour.id) {
      throw createHttpError(422, 'INVALID_DEPARTURE', 'La salida no corresponde al paquete seleccionado');
    }
    if (departure.status === 'cancelled') {
      throw createHttpError(409, 'DEPARTURE_CANCELLED', 'La salida seleccionada está cancelada');
    }
    if (Number(departure.availableSpots) < Number(data.travelers)) {
      throw createHttpError(409, 'INSUFFICIENT_AVAILABILITY', 'No hay lugares suficientes en la salida seleccionada');
    }
    data.startDate = data.startDate || departure.startDate;
    data.endDate = data.endDate || departure.endDate;
  }

  let promotion = null;
  if (data.promotionId) {
    const today = new Date().toISOString().slice(0, 10);
    promotion = await Promotion.findOne({
      where: {
        id: data.promotionId,
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: today } }] },
          { [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }] },
        ],
      },
      transaction,
    });
    if (!promotion || (promotion.tourId && promotion.tourId !== tour.id)) {
      throw createHttpError(422, 'INVALID_PROMOTION', 'La promoción no es válida para el paquete seleccionado');
    }
  }

  if (!data.startDate || !data.endDate) {
    throw createHttpError(422, 'RESERVATION_DATES_REQUIRED', 'Las fechas de inicio y fin son obligatorias');
  }
  validateDateRange(data.startDate, data.endDate);
  validateParty(data, data.travelersList);
  return { tour, departure, promotion };
};

const createReservation = async (data, options) => {
  const { transaction, changedBy = null, status = 'request' } = options;
  await validateReferences(data, transaction);

  const reservation = await Reservation.create({
    code: generateCode(),
    quoteId: data.quoteId || null,
    customerId: data.customerId || null,
    tourId: data.tourId,
    promotionId: data.promotionId || null,
    departureId: data.departureId || null,
    customerName: data.customerName,
    phone: data.phone,
    email: data.email,
    startDate: data.startDate,
    endDate: data.endDate,
    travelers: data.travelers,
    adults: data.adults,
    minors: data.minors || 0,
    status,
    notes: data.notes || null,
  }, { transaction });

  if (data.travelersList?.length) {
    await ReservationTraveler.bulkCreate(data.travelersList.map((traveler) => ({
      reservationId: reservation.id,
      firstName: traveler.firstName,
      lastName: traveler.lastName || null,
      travelerType: traveler.travelerType,
      birthDate: traveler.birthDate || null,
      notes: traveler.notes || null,
    })), { transaction });
  }

  await ReservationStatusHistory.create({
    reservationId: reservation.id,
    fromStatus: null,
    toStatus: status,
    note: data.historyNote || 'Reservación creada',
    changedBy,
  }, { transaction });

  return reservation;
};

const transitionReservation = async (sequelize, reservationId, toStatus, note, changedBy) => {
  await sequelize.transaction(async (transaction) => {
    const reservation = await Reservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!reservation) throw createHttpError(404, 'RESERVATION_NOT_FOUND', 'Reservación no encontrada');
    assertTransition(reservationTransitions, reservation.status, toStatus, 'la reservación');

    if (toStatus === 'confirmed' && reservation.departureId) {
      const departure = await TourDeparture.findByPk(reservation.departureId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!departure || departure.status === 'cancelled') {
        throw createHttpError(409, 'DEPARTURE_UNAVAILABLE', 'La salida ya no está disponible');
      }
      if (Number(departure.availableSpots) < Number(reservation.travelers)) {
        throw createHttpError(409, 'INSUFFICIENT_AVAILABILITY', 'No hay lugares suficientes para confirmar la reservación');
      }
      const availableSpots = Number(departure.availableSpots) - Number(reservation.travelers);
      await departure.update({
        availableSpots,
        status: availableSpots === 0 ? 'sold_out' : 'available',
      }, { transaction });
    }

    if (toStatus === 'cancelled' && reservation.status === 'confirmed' && reservation.departureId) {
      const departure = await TourDeparture.findByPk(reservation.departureId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (departure) {
        const availableSpots = Math.min(
          Number(departure.capacity),
          Number(departure.availableSpots) + Number(reservation.travelers)
        );
        await departure.update({
          availableSpots,
          status: departure.status === 'cancelled' ? 'cancelled' : 'available',
        }, { transaction });
      }
    }

    const fromStatus = reservation.status;
    await reservation.update({
      status: toStatus,
      cancelledAt: toStatus === 'cancelled' ? new Date() : reservation.cancelledAt,
      cancellationReason: toStatus === 'cancelled' ? note || null : reservation.cancellationReason,
    }, { transaction });
    await ReservationStatusHistory.create({
      reservationId: reservation.id,
      fromStatus,
      toStatus,
      note: note || null,
      changedBy,
    }, { transaction });
  });

  return Reservation.findByPk(reservationId);
};

module.exports = { createReservation, transitionReservation, validateReferences };
