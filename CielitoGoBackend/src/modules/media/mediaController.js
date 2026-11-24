const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Media } = require('../../models');
const config = require('../../config');
const upload = require('../../middleware/upload');
const cloudinaryService = require('../../services/cloudinaryService');

const mediaRowFromFile = async (file, body, userId) => {
  const input = file.buffer || file.path;
  const metadata = await sharp(input, { limitInputPixels: config.upload.maxPixels }).metadata();
  const stored = upload.getStoredImage(file);
  const extension = path.extname(file.originalname || '') || `.${metadata.format || 'img'}`;
  const filename = file.filename || `${uuidv4()}${extension}`;

  return {
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path || stored.imageUrl,
    url: stored.imageUrl,
    publicId: stored.publicId,
    width: metadata.width,
    height: metadata.height,
    alt: body.alt || '',
    category: body.category || 'general',
    uploadedBy: userId,
  };
};

exports.getAll = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;

    const { count, rows: media } = await Media.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      media,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const media = await Media.create(await mediaRowFromFile(req.file, req.body, req.user.id));

    res.status(201).json({ media });
  } catch (error) {
    try {
      await upload.removeFiles(upload.getFiles(req));
    } catch (cleanupError) {
      console.error('Unable to remove failed media upload:', cleanupError.message);
    }
    next(error);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Archivos requeridos' });
    }

    const rows = await Promise.all(
      req.files.map((file) => mediaRowFromFile(file, req.body, req.user.id))
    );
    const mediaItems = await sequelize.transaction((transaction) => Media.bulkCreate(rows, { transaction }));

    res.status(201).json({ media: mediaItems });
  } catch (error) {
    try {
      await upload.removeFiles(upload.getFiles(req));
    } catch (cleanupError) {
      console.error('Unable to remove failed media uploads:', cleanupError.message);
    }
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    res.json({ media });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    await media.update({ alt: req.body.alt, category: req.body.category });
    res.json({ media });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    await media.destroy();
    try {
      await upload.removeStoredImage({ imageUrl: media.url, publicId: media.publicId });
    } catch (cleanupError) {
      console.error('Unable to remove media file:', cleanupError.message);
    }
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.resize = async (req, res, next) => {
  let newPath;
  try {
    const { width, height } = req.body;
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    if (media.publicId) {
      const resizedUrl = cloudinaryService.buildResizedImageUrl(media.publicId, parseInt(width), parseInt(height));
      await media.update({
        url: resizedUrl,
        path: resizedUrl,
        width: parseInt(width),
        height: parseInt(height),
      });
      return res.json({ media });
    }

    const ext = path.extname(media.filename);
    const newFilename = `${uuidv4()}${ext}`;
    newPath = path.join(config.upload.dir, newFilename);
    const oldPath = media.path;

    await sharp(oldPath, { limitInputPixels: config.upload.maxPixels })
      .resize(parseInt(width), parseInt(height), { fit: 'cover' })
      .toFile(newPath);

    await media.update({
      filename: newFilename,
      path: newPath,
      url: `/uploads/${newFilename}`,
      width: parseInt(width),
      height: parseInt(height),
    });

    try {
      if (fs.existsSync(oldPath) && oldPath !== newPath) fs.unlinkSync(oldPath);
    } catch (cleanupError) {
      console.error('Unable to remove original image:', cleanupError.message);
    }

    res.json({ media });
  } catch (error) {
    try {
      if (newPath && fs.existsSync(newPath)) fs.unlinkSync(newPath);
    } catch (cleanupError) {
      console.error('Unable to remove failed resized image:', cleanupError.message);
    }
    next(error);
  }
};
