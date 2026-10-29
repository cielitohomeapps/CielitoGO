const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);
const allowedFormats = new Set(['jpeg', 'png', 'webp', 'gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(config.upload.dir, { recursive: true }, (error) => cb(error, config.upload.dir));
  },
  filename: (req, file, cb) => {
    const ext = allowedMimeTypes.get(file.mimetype) || '.img';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

const getFiles = (req) => [
  ...(req.file ? [req.file] : []),
  ...(Array.isArray(req.files) ? req.files : []),
];

const removeFiles = async (files) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }));
};

const validateImages = async (req, res, next) => {
  const files = getFiles(req);
  if (files.length === 0) return next();

  try {
    for (const file of files) {
      const metadata = await sharp(file.path, { limitInputPixels: config.upload.maxPixels }).metadata();
      if (!allowedFormats.has(metadata.format)) {
        const error = new Error('El contenido del archivo no corresponde a una imagen permitida');
        error.status = 400;
        error.code = 'INVALID_IMAGE_CONTENT';
        throw error;
      }
      if (metadata.width > config.upload.maxWidth || metadata.height > config.upload.maxHeight) {
        const error = new Error('Las dimensiones de la imagen exceden el límite permitido');
        error.status = 400;
        error.code = 'IMAGE_DIMENSIONS_EXCEEDED';
        throw error;
      }
    }
    next();
  } catch (error) {
    try {
      await removeFiles(files);
    } catch (cleanupError) {
      console.error('Unable to remove rejected upload:', cleanupError.message);
    }
    if (!error.status) {
      error.status = 400;
      error.code = 'INVALID_IMAGE_CONTENT';
      error.message = 'El contenido del archivo no corresponde a una imagen válida';
    }
    next(error);
  }
};

upload.validateImages = validateImages;
upload.getFiles = getFiles;
upload.removeFiles = removeFiles;

module.exports = upload;
