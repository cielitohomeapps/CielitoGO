const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Media } = require('../../models');
const config = require('../../config');

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

    const file = req.file;
    const metadata = await sharp(file.path).metadata();

    const media = await Media.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
      width: metadata.width,
      height: metadata.height,
      alt: req.body.alt || '',
      category: req.body.category || 'general',
      uploadedBy: req.user.id,
    });

    res.status(201).json({ media });
  } catch (error) {
    next(error);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Archivos requeridos' });
    }

    const rows = await Promise.all(
      req.files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();
        return {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`,
          width: metadata.width,
          height: metadata.height,
          alt: req.body.alt || '',
          category: req.body.category || 'general',
          uploadedBy: req.user.id,
        };
      })
    );
    const mediaItems = await sequelize.transaction((transaction) => Media.bulkCreate(rows, { transaction }));

    res.status(201).json({ media: mediaItems });
  } catch (error) {
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
      if (fs.existsSync(media.path)) fs.unlinkSync(media.path);
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
