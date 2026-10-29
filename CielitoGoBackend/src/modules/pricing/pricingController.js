const { Op } = require('sequelize');
const { Pricing, Tour } = require('../../models');

const pricingFields = [
  'name', 'tourId', 'season', 'seasonName', 'price', 'discountPrice', 'currency',
  'validFrom', 'validTo', 'minPeople', 'maxPeople', 'isActive', 'notes',
];

const pickPricingFields = (body) => Object.fromEntries(
  pricingFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

const validatePricingRules = (data) => {
  if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
    const error = new Error('La fecha final debe ser igual o posterior a la fecha inicial');
    error.status = 422;
    error.code = 'INVALID_DATE_RANGE';
    throw error;
  }
  if (data.discountPrice !== null && data.discountPrice !== undefined && Number(data.discountPrice) > Number(data.price)) {
    const error = new Error('El precio con descuento no puede exceder el precio normal');
    error.status = 422;
    error.code = 'INVALID_DISCOUNT_PRICE';
    throw error;
  }
  if (data.maxPeople !== null && data.maxPeople !== undefined && Number(data.maxPeople) < Number(data.minPeople)) {
    const error = new Error('El máximo de personas no puede ser menor que el mínimo');
    error.status = 422;
    error.code = 'INVALID_PEOPLE_RANGE';
    throw error;
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { tourId, season, active } = req.query;

    const where = {};
    if (tourId) where.tourId = tourId;
    if (season) where.season = season;
    if (active !== undefined) where.isActive = active === 'true';

    const pricings = await Pricing.findAll({
      where,
      include: [{ model: Tour, as: 'tour', attributes: ['id', 'name', 'slug'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ pricings });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id, {
      include: [{ model: Tour, as: 'tour' }],
    });
    if (!pricing) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }
    res.json({ pricing });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = pickPricingFields(req.body);
    validatePricingRules(data);
    const pricing = await Pricing.create(data);
    res.status(201).json({ pricing });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id);
    if (!pricing) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }
    const data = { ...pricing.toJSON(), ...pickPricingFields(req.body) };
    validatePricingRules(data);
    await pricing.update(pickPricingFields(req.body));
    res.json({ pricing });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id);
    if (!pricing) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }
    await pricing.update({ isActive: false });
    res.json({ message: 'Precio desactivado' });
  } catch (error) {
    next(error);
  }
};

exports.getActivePrice = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const pricing = await Pricing.findOne({
      where: {
        tourId,
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ validFrom: null }, { validFrom: { [Op.lte]: today } }] },
          { [Op.or]: [{ validTo: null }, { validTo: { [Op.gte]: today } }] },
        ],
      },
      attributes: ['id', 'name', 'tourId', 'season', 'seasonName', 'price', 'discountPrice', 'currency', 'validFrom', 'validTo', 'minPeople', 'maxPeople'],
      include: [{ model: Tour, as: 'tour', attributes: ['id', 'name', 'slug'], where: { isActive: true }, required: true }],
      order: [['season', 'ASC']],
    });

    res.json({ pricing: pricing || null });
  } catch (error) {
    next(error);
  }
};
