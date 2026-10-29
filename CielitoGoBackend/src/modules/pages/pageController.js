const { sequelize, PageContent, Setting } = require('../../models');

const publicSettingKeys = [
  'site_name', 'site_logo', 'site_email', 'site_phone', 'whatsapp_number',
  'facebook_url', 'instagram_url',
];

const parseSettingValue = (setting) => {
  if (setting.type === 'boolean') return setting.value === 'true';
  if (setting.type === 'number') return Number(setting.value);
  if (setting.type === 'json') return JSON.parse(setting.value);
  return setting.value;
};

const parseContentValue = (item) => {
  if (item.type === 'json') return JSON.parse(item.value);
  if (item.type === 'boolean') return item.value === 'true';
  if (item.type === 'number') return Number(item.value);
  return item.value;
};

const serializeValue = (value, type) => {
  if (type === 'json') return JSON.stringify(value);
  if (type === 'boolean') return value === true || value === 'true' ? 'true' : 'false';
  if (value === null || value === undefined) return value;
  return String(value);
};

exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll({
      where: { key: publicSettingKeys },
      attributes: ['key', 'value', 'type', 'group'],
      order: [['key', 'ASC']],
    });
    const data = Object.fromEntries(settings.map((setting) => [setting.key, parseSettingValue(setting)]));
    res.json({ settings: data });
  } catch (error) {
    next(error);
  }
};

exports.getPageContent = async (req, res, next) => {
  try {
    const { page } = req.params;

    const contents = await PageContent.findAll({
      where: { page, isActive: true },
      order: [['section', 'ASC'], ['key', 'ASC']],
    });

    const grouped = contents.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = {};
      acc[item.section][item.key] = {
        value: parseContentValue(item),
        type: item.type,
        metadata: item.metadata,
      };
      return acc;
    }, {});

    res.json({ page, content: grouped });
  } catch (error) {
    next(error);
  }
};

exports.getAllContent = async (req, res, next) => {
  try {
    const contents = await PageContent.findAll({
      order: [['page', 'ASC'], ['section', 'ASC'], ['key', 'ASC']],
    });
    res.json({ contents });
  } catch (error) {
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const { page, section, key } = req.params;
    const { value, type, metadata } = req.body;

    const [content, created] = await PageContent.findOrCreate({
      where: { page, section, key },
      defaults: {
        value: serializeValue(value, type || 'text'),
        type: type || 'text',
        metadata,
        updatedBy: req.user.id,
      },
    });

    if (!created) {
      const effectiveType = type || content.type;
      await content.update({
        value: serializeValue(value, effectiveType),
        type: effectiveType,
        metadata: metadata !== undefined ? metadata : content.metadata,
        updatedBy: req.user.id,
      });
    }

    res.json({ content });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { items } = req.body;

    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        const [content, created] = await PageContent.findOrCreate({
          where: { page: item.page, section: item.section, key: item.key },
          defaults: {
            value: serializeValue(item.value, item.type || 'text'),
            type: item.type || 'text',
            metadata: item.metadata,
            updatedBy: req.user.id,
          },
          transaction,
        });

        if (!created) {
          const effectiveType = item.type || content.type;
          await content.update({
            value: serializeValue(item.value, effectiveType),
            type: effectiveType,
            metadata: item.metadata !== undefined ? item.metadata : content.metadata,
            updatedBy: req.user.id,
          }, { transaction });
        }
      }
    });

    res.json({ message: 'Contenido actualizado', count: items.length });
  } catch (error) {
    next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const { page, section, key } = req.params;
    const content = await PageContent.findOne({ where: { page, section, key } });
    if (!content) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    await content.destroy();
    res.json({ message: 'Contenido eliminado' });
  } catch (error) {
    next(error);
  }
};

// Settings
exports.getSettings = async (req, res, next) => {
  try {
    const { group } = req.query;
    const where = group ? { group } : {};
    const settings = await Setting.findAll({ where });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, type, group, description } = req.body;

    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { value: serializeValue(value, type || 'text'), type, group, description },
    });

    if (!created) {
      const effectiveType = type || setting.type;
      await setting.update({
        value: serializeValue(value, effectiveType),
        type: effectiveType,
        group: group || setting.group,
        description: description !== undefined ? description : setting.description,
      });
    }

    res.json({ setting });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    await sequelize.transaction(async (transaction) => {
      for (const item of settings) {
        await Setting.upsert({
          key: item.key,
          value: serializeValue(item.value, item.type || 'text'),
          type: item.type || 'text',
          group: item.group || 'general',
          description: item.description,
        }, { transaction });
      }
    });

    res.json({ message: 'Configuraciones actualizadas' });
  } catch (error) {
    next(error);
  }
};
