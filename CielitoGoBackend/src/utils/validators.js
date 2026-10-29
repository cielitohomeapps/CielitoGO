const upload = require('../middleware/upload');

const validate = async (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      await upload.removeFiles(upload.getFiles(req));
    } catch (cleanupError) {
      console.error('Unable to clean invalid request uploads:', cleanupError.message);
    }
    const details = errors.array({ onlyFirstError: true }).map(({ value, ...error }) => error);
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'La solicitud contiene datos inválidos',
      details,
    });
  }
  next();
};

module.exports = { validate };
