const createHttpError = require('./httpError');

const quoteTransitions = Object.freeze({
  new: ['reviewing', 'cancelled'],
  reviewing: ['contacted', 'sent', 'rejected', 'cancelled'],
  contacted: ['sent', 'rejected', 'cancelled'],
  sent: ['accepted', 'rejected', 'cancelled'],
  accepted: ['cancelled'],
  rejected: [],
  cancelled: [],
});

const reservationTransitions = Object.freeze({
  request: ['pending', 'confirmed', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
});

const assertTransition = (transitions, fromStatus, toStatus, resourceName) => {
  if (fromStatus === toStatus) {
    throw createHttpError(409, 'STATUS_UNCHANGED', `El estado de ${resourceName} no cambió`);
  }
  if (!transitions[fromStatus]?.includes(toStatus)) {
    throw createHttpError(409, 'INVALID_STATUS_TRANSITION', `No se puede cambiar ${resourceName} de ${fromStatus} a ${toStatus}`);
  }
};

module.exports = { quoteTransitions, reservationTransitions, assertTransition };
