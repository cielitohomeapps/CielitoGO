const fs = require('fs');
const multer = require('multer');
const config = require('../config');

const cleanupUploads = (req) => {
  const files = [
    ...(req.file ? [req.file] : []),
    ...(Array.isArray(req.files) ? req.files : []),
  ];
  for (const file of files) {
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (error) {
      console.error('Unable to clean uploaded file:', error.message);
    }
  }
};

const errorHandler = (err, req, res, next) => {
  cleanupUploads(req);
  console.error('Request error:', {
    name: err.name,
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({
      success: false,
      code: err.code,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'El archivo excede el tamaño permitido' : 'Error al procesar el archivo',
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Error de validación', details: errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, code: 'RESOURCE_CONFLICT', message: 'El recurso ya existe' });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, code: 'INVALID_REFERENCE', message: 'Referencia inválida' });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      code: err.code || 'REQUEST_ERROR',
      message: err.message,
    });
  }

  if (err.status === 503 && err.code) {
    return res.status(503).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
  });
};

module.exports = errorHandler;
