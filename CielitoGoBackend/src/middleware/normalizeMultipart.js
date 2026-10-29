const createHttpError = require('../utils/httpError');

const parseJsonFields = (...fields) => (req, res, next) => {
  try {
    for (const field of fields) {
      const value = req.body[field];
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw createHttpError(400, 'INVALID_JSON_FIELD', `${field} debe ser un arreglo JSON`);
        }
        req.body[field] = parsed;
      }
    }
    next();
  } catch (error) {
    if (!error.status) next(createHttpError(400, 'INVALID_JSON_FIELD', 'Uno de los campos JSON no es válido'));
    else next(error);
  }
};

module.exports = { parseJsonFields };
