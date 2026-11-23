const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const cloudinaryService = require('../services/cloudinaryService');

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);
const allowedFormats = new Set(['jpeg', 'png', 'webp', 'gif']);

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(config.upload.dir, { recursive: true }, (error) => cb(error, config.upload.dir));
  },
  filename: (req, file, cb) => {
    const ext = allowedMimeTypes.get(file.mimetype) || '.img';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const storage = config.cloudinary.enabled ? multer.memoryStorage() : diskStorage;

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
    if (file.cloudinaryPublicId) {
      await cloudinaryService.deleteImage(file.cloudinaryPublicId);
      return;
    }
    if (!file.path) return;
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
      const input = file.buffer || file.path;
      const metadata = await sharp(input, { limitInputPixels: config.upload.maxPixels }).metadata();
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

const storeImage = (folder) => async (req, res, next) => {
  if (!req.file || !config.cloudinary.enabled) return next();
  try {
    const stored = await cloudinaryService.uploadImage(req.file.buffer, folder);
    req.file.cloudinaryUrl = stored.url;
    req.file.cloudinaryPublicId = stored.publicId;
    next();
  } catch (error) {
    error.status = 502;
    error.code = 'IMAGE_STORAGE_ERROR';
    error.message = 'No fue posible almacenar la imagen';
    next(error);
  }
};

const getStoredImage = (file) => {
  if (!file) return null;
  if (file.cloudinaryUrl) {
    return { imageUrl: file.cloudinaryUrl, publicId: file.cloudinaryPublicId };
  }
  return { imageUrl: `/uploads/${file.filename}`, publicId: null };
};

const removeStoredImage = async ({ imageUrl, publicId }) => {
  if (publicId) {
    await cloudinaryService.deleteImage(publicId);
    return;
  }
  if (!imageUrl?.startsWith('/uploads/')) return;
  const filename = path.basename(imageUrl);
  const target = path.join(config.upload.dir, filename);
  try {
    await fs.promises.unlink(target);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

upload.validateImages = validateImages;
upload.getFiles = getFiles;
upload.removeFiles = removeFiles;
upload.storeImage = storeImage;
upload.getStoredImage = getStoredImage;
upload.removeStoredImage = removeStoredImage;

module.exports = upload;
