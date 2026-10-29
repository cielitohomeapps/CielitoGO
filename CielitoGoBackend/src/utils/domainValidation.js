const createHttpError = require('./httpError');

const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate && startDate > endDate) {
    throw createHttpError(422, 'INVALID_DATE_RANGE', 'La fecha final debe ser igual o posterior a la fecha inicial');
  }
};

const validateParty = ({ travelers, adults, minors = 0 }, travelersList) => {
  if (Number(travelers) !== Number(adults) + Number(minors)) {
    throw createHttpError(422, 'INVALID_TRAVELER_TOTAL', 'El total de viajeros debe ser igual a adultos más menores');
  }
  if (travelersList && travelersList.length > 0 && travelersList.length !== Number(travelers)) {
    throw createHttpError(422, 'INVALID_TRAVELER_LIST', 'La lista de viajeros debe coincidir con el total indicado');
  }
  if (travelersList && travelersList.length > 0) {
    const adultCount = travelersList.filter((item) => item.travelerType === 'adult').length;
    const minorCount = travelersList.filter((item) => item.travelerType === 'minor').length;
    if (adultCount !== Number(adults) || minorCount !== Number(minors)) {
      throw createHttpError(422, 'INVALID_TRAVELER_TYPES', 'Los tipos de viajeros no coinciden con los totales de adultos y menores');
    }
  }
};

module.exports = { validateDateRange, validateParty };
