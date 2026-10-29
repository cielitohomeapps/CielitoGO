const whatsappService = require('./whatsappService');
const config = require('../../config');
const { Op } = require('sequelize');
const { WhatsAppMessage } = require('../../models');

exports.webhookVerify = (req, res) => {
  if (!config.whatsapp.verifyToken) {
    return res.status(503).json({
      success: false,
      code: 'WHATSAPP_NOT_CONFIGURED',
      message: 'El webhook de WhatsApp no está configurado',
    });
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

exports.webhookHandler = async (req, res) => {
  try {
    const { entry } = req.body;

    const firstEntry = Array.isArray(entry) ? entry[0] : null;
    if (Array.isArray(firstEntry?.changes) && firstEntry.changes.length > 0) {
      const change = firstEntry.changes[0];
      if (change.field === 'messages') {
        const messages = change.value.messages;
        if (messages) {
          for (const message of messages) {
            await whatsappService.handleIncomingMessage({
              ...message,
              contacts: change.value.contacts,
            });
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { page, limit, from, status } = req.query;
    const result = await whatsappService.getMessages({ page, limit, from, status });
    res.json({
      messages: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page) || 1,
        pages: Math.ceil(result.count / (parseInt(limit) || 50)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const messages = await WhatsAppMessage.findAll({
      where: { [Op.or]: [{ from: phone }, { to: phone }] },
      order: [['createdAt', 'ASC']],
    });
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { to, message, type = 'text' } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Teléfono y mensaje requeridos' });
    }

    let result;
    switch (type) {
      case 'template':
        result = await whatsappService.sendTemplateMessage(to, message.templateName, message.languageCode, message.components);
        break;
      case 'image':
        result = await whatsappService.sendImageMessage(to, message.imageUrl, message.caption);
        break;
      default:
        result = await whatsappService.sendTextMessage(to, message);
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.sendTourInfo = async (req, res, next) => {
  try {
    const { to, tourId } = req.body;
    const result = await whatsappService.sendTourInfo(to, tourId);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const message = await whatsappService.markAsRead(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json({ message });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await whatsappService.getUnreadCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};
