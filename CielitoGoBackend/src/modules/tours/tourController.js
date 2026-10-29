const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Tour, TourImage, Pricing } = require('../../models');
const toSlug = require('../../utils/slug');

const generateSlug = (text) => {
  return toSlug(text);
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (!req.user) {
      where.isActive = true;
    } else if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const { count, rows: tours } = await Tour.findAndCountAll({
      where,
      include: [
        { model: TourImage, as: 'images' },
        ...(req.user ? [{ model: Pricing, as: 'pricings' }] : []),
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      tours,
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

exports.getById = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({
      where: { id: req.params.id, ...(!req.user ? { isActive: true } : {}) },
      include: [
        { model: TourImage, as: 'images' },
        ...(req.user ? [{ model: Pricing, as: 'pricings' }] : []),
      ],
    });
    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }
    res.json({ tour });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      name, description, shortDescription, duration, price,
      currency, capacity, difficulty, location, highlights,
      includes, excludes, restrictions, conditions, itinerary, metaTitle, metaDescription,
    } = req.body;

    const slug = generateSlug(name);

    const tour = await Tour.create({
      name,
      slug,
      description,
      shortDescription,
      duration,
      price,
      currency,
      capacity,
      difficulty,
      location,
      highlights: highlights || [],
      includes: includes || [],
      excludes: excludes || [],
      restrictions: restrictions || [],
      conditions: conditions || [],
      itinerary: itinerary || [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      metaTitle,
      metaDescription,
    });

    res.status(201).json({ tour });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) {
      const error = new Error('Tour no encontrado');
      error.status = 404;
      error.code = 'TOUR_NOT_FOUND';
      return next(error);
    }

    const allowedFields = [
      'name', 'description', 'shortDescription', 'duration', 'price', 'currency',
      'capacity', 'difficulty', 'location', 'highlights', 'includes', 'excludes',
      'restrictions', 'conditions', 'itinerary',
      'metaTitle', 'metaDescription', 'isActive', 'sortOrder',
    ];
    const updates = Object.fromEntries(
      allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    let oldImagePath;
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
      if (tour.imageUrl) {
        oldImagePath = path.join(__dirname, '../../../public', tour.imageUrl);
      }
    }
    if (updates.name && !req.body.slug) {
      updates.slug = generateSlug(updates.name);
    }

    await tour.update(updates);
    if (oldImagePath) {
      try {
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      } catch (cleanupError) {
        console.error('Unable to remove previous tour image:', cleanupError.message);
      }
    }
    res.json({ tour });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) {
      const error = new Error('Tour no encontrado');
      error.status = 404;
      error.code = 'TOUR_NOT_FOUND';
      return next(error);
    }
    await tour.update({ isActive: false });
    res.json({ message: 'Tour desactivado' });
  } catch (error) {
    next(error);
  }
};

exports.addImage = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) {
      const error = new Error('Tour no encontrado');
      error.status = 404;
      error.code = 'TOUR_NOT_FOUND';
      return next(error);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    const image = await TourImage.create({
      tourId: tour.id,
      imageUrl: `/uploads/${req.file.filename}`,
      alt: req.body.alt || tour.name,
      sortOrder: req.body.sortOrder || 0,
      isPrimary: req.body.isPrimary || false,
    });

    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const image = await TourImage.findOne({
      where: { id: req.params.imageId, tourId: req.params.id },
    });
    if (!image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imagePath = path.join(__dirname, '../../../public', image.imageUrl);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await image.destroy();
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    next(error);
  }
};

exports.reorder = async (req, res, next) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await Tour.update({ sortOrder: item.sortOrder }, { where: { id: item.id } });
    }
    res.json({ message: 'Orden actualizado' });
  } catch (error) {
    next(error);
  }
};
