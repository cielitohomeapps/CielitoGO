const { Op } = require('sequelize');
const { Customer, Quote, Reservation } = require('../../models');
const createHttpError = require('../../utils/httpError');
const { getPagination, paginationResponse } = require('../../utils/pagination');

const customerFields = ['firstName', 'lastName', 'email', 'phone', 'isActive'];
const pickFields = (body) => Object.fromEntries(
  customerFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field] === '' ? null : body[field]])
);

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.active !== undefined) where.isActive = req.query.active === 'true';
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: term } },
        { lastName: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } },
      ];
    }
    const { count, rows: customers } = await Customer.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ customers, pagination: paginationResponse(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) throw createHttpError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    const [quotesCount, reservationsCount] = await Promise.all([
      Quote.count({ where: { customerId: customer.id } }),
      Reservation.count({ where: { customerId: customer.id } }),
    ]);
    res.json({ customer, stats: { quotes: quotesCount, reservations: reservationsCount } });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const customer = await Customer.create(pickFields(req.body));
    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) throw createHttpError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    await customer.update(pickFields(req.body));
    res.json({ customer });
  } catch (error) {
    next(error);
  }
};

exports.deactivate = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) throw createHttpError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    await customer.update({ isActive: false });
    res.json({ message: 'Cliente desactivado', customer });
  } catch (error) {
    next(error);
  }
};

exports.getQuotes = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id, { attributes: ['id'] });
    if (!customer) throw createHttpError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    const quotes = await Quote.findAll({ where: { customerId: customer.id }, order: [['createdAt', 'DESC']] });
    res.json({ quotes });
  } catch (error) {
    next(error);
  }
};

exports.getReservations = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id, { attributes: ['id'] });
    if (!customer) throw createHttpError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    const reservations = await Reservation.findAll({ where: { customerId: customer.id }, order: [['createdAt', 'DESC']] });
    res.json({ reservations });
  } catch (error) {
    next(error);
  }
};
