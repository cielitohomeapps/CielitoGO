const jwt = require('jsonwebtoken');
const config = require('../../config');
const { User } = require('../../models');

const sendError = (res, status, code, message) => res.status(status).json({ success: false, code, message });

const isLastActiveAdmin = async (user) => {
  if (user.role !== 'admin' || !user.isActive) return false;
  return (await User.count({ where: { role: 'admin', isActive: true } })) <= 1;
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
    algorithm: 'HS256',
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'MISSING_CREDENTIALS', 'Email y contraseña son requeridos');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'ACCOUNT_DISABLED', 'Cuenta desactivada');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

    res.json({
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 409, 'EMAIL_ALREADY_REGISTERED', 'El email ya está registrado');
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) updates.password = password;

    await req.user.update(updates);
    res.json({ user: req.user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }
    if (role !== 'admin' && await isLastActiveAdmin(user)) {
      return sendError(res, 409, 'LAST_ACTIVE_ADMIN', 'No se puede cambiar el rol del último administrador activo');
    }
    await user.update({ role });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }
    if (user.id === req.user.id && user.isActive) {
      return sendError(res, 409, 'SELF_DEACTIVATION_NOT_ALLOWED', 'No puedes desactivar tu propia cuenta');
    }
    if (user.isActive && await isLastActiveAdmin(user)) {
      return sendError(res, 409, 'LAST_ACTIVE_ADMIN', 'No se puede desactivar el último administrador activo');
    }
    await user.update({ isActive: !user.isActive });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};
