const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { sequelize, Promotion, PromotionImage, Tour } = require('../../models');
const createHttpError = require('../../utils/httpError');
const { getPagination, paginationResponse } = require('../../utils/pagination');
const toSlug = require('../../utils/slug');
const { validateDateRange } = require('../../utils/domainValidation');

const promotionFields = [
  'tourId', 'title', 'description', 'destination', 'promotionalPrice', 'currency',
  'startDate', 'endDate', 'restrictions', 'conditions', 'isActive', 'isFeatured', 'sortOrder',
];

const pickFields = (body) => Object.fromEntries(
  promotionFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field] === '' ? null : body[field]])
);

const include = [
  { model: Tour, as: 'tour', attributes: ['id', 'name', 'slug', 'isActive'] },
  { model: PromotionImage, as: 'images', separate: true, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] },
];

const activeWhere = () => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    isActive: true,
    [Op.or]: [{ tourId: null }, { '$tour.isActive$': true }],
    [Op.and]: [
      { [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: today } }] },
      { [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }] },
    ],
  };
};

const toPublicPath = (url) => path.join(__dirname, '../../../public', url);

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = req.user ? {} : activeWhere();
    if (req.user && req.query.active !== undefined) where.isActive = req.query.active === 'true';
    if (req.query.featured !== undefined) where.isFeatured = req.query.featured === 'true';
    if (req.query.tourId) where.tourId = req.query.tourId;
    if (req.query.destination) where.destination = { [Op.iLike]: `%${req.query.destination}%` };

    const { count, rows: promotions } = await Promotion.findAndCountAll({
      where,
      include,
      distinct: true,
      subQuery: false,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ promotions, pagination: paginationResponse(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const promotion = await Promotion.findOne({
      where: { id: req.params.id, ...(!req.user ? activeWhere() : {}) },
      include,
    });
    if (!promotion) throw createHttpError(404, 'PROMOTION_NOT_FOUND', 'Promoción no encontrada');
    res.json({ promotion });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    validateDateRange(data.startDate, data.endDate);
    const promotion = await Promotion.create({
      ...data,
      tourId: data.tourId || null,
      slug: toSlug(data.title),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json({ promotion });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) throw createHttpError(404, 'PROMOTION_NOT_FOUND', 'Promoción no encontrada');

    const updates = pickFields(req.body);
    if (updates.title) updates.slug = toSlug(updates.title);
    if (updates.tourId === '') updates.tourId = null;
    const startDate = Object.prototype.hasOwnProperty.call(updates, 'startDate') ? updates.startDate : promotion.startDate;
    const endDate = Object.prototype.hasOwnProperty.call(updates, 'endDate') ? updates.endDate : promotion.endDate;
    validateDateRange(startDate, endDate);

    let oldImagePath;
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
      if (promotion.imageUrl) oldImagePath = toPublicPath(promotion.imageUrl);
    }
    await promotion.update(updates);

    try {
      if (oldImagePath && fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    } catch (cleanupError) {
      console.error('Unable to remove previous promotion image:', cleanupError.message);
    }
    res.json({ promotion });
  } catch (error) {
    next(error);
  }
};

exports.deactivate = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) throw createHttpError(404, 'PROMOTION_NOT_FOUND', 'Promoción no encontrada');
    await promotion.update({ isActive: false });
    res.json({ message: 'Promoción desactivada', promotion });
  } catch (error) {
    next(error);
  }
};

exports.addImage = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) throw createHttpError(404, 'PROMOTION_NOT_FOUND', 'Promoción no encontrada');
    if (!req.file) throw createHttpError(400, 'IMAGE_REQUIRED', 'Imagen requerida');

    const image = await sequelize.transaction(async (transaction) => {
      if (req.body.isPrimary === true) {
        await PromotionImage.update({ isPrimary: false }, { where: { promotionId: promotion.id }, transaction });
      }
      return PromotionImage.create({
        promotionId: promotion.id,
        imageUrl: `/uploads/${req.file.filename}`,
        alt: req.body.alt || promotion.title,
        sortOrder: req.body.sortOrder || 0,
        isPrimary: req.body.isPrimary || false,
      }, { transaction });
    });
    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const image = await PromotionImage.findOne({ where: { id: req.params.imageId, promotionId: req.params.id } });
    if (!image) throw createHttpError(404, 'PROMOTION_IMAGE_NOT_FOUND', 'Imagen de promoción no encontrada');
    const imagePath = toPublicPath(image.imageUrl);
    await image.destroy();
    try {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    } catch (cleanupError) {
      console.error('Unable to remove promotion image:', cleanupError.message);
    }
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    next(error);
  }
};
