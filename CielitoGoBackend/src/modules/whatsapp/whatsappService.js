const axios = require('axios');
const config = require('../../config');
const { WhatsAppMessage, Tour } = require('../../models');

class WhatsAppService {
  constructor() {
    this.apiUrl = config.whatsapp.apiUrl;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  ensureConfigured() {
    if (!this.phoneNumberId || !this.accessToken) {
      const error = new Error('El servicio de WhatsApp no está configurado');
      error.status = 503;
      error.code = 'WHATSAPP_NOT_CONFIGURED';
      throw error;
    }
  }

  async sendTextMessage(to, text) {
    try {
      this.ensureConfigured();
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        { headers: this.getHeaders() }
      );

      const messageData = response.data.messages?.[0];
      if (messageData) {
        await WhatsAppMessage.create({
          waMessageId: messageData.id,
          from: this.phoneNumberId,
          to,
          body: text,
          type: 'text',
          direction: 'outgoing',
          status: 'sent',
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', {
        status: error.response?.status,
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }

  async sendTemplateMessage(to, templateName, languageCode = 'es', components = []) {
    try {
      this.ensureConfigured();
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        },
        { headers: this.getHeaders() }
      );

      const messageData = response.data.messages?.[0];
      if (messageData) {
        await WhatsAppMessage.create({
          waMessageId: messageData.id,
          from: this.phoneNumberId,
          to,
          type: 'template',
          templateName,
          direction: 'outgoing',
          status: 'sent',
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp template:', {
        status: error.response?.status,
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }

  async sendImageMessage(to, imageUrl, caption = '') {
    try {
      this.ensureConfigured();
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'image',
          image: { link: imageUrl, caption },
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp image:', {
        status: error.response?.status,
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }

  async sendTourInfo(to, tourId) {
    const tour = await Tour.findByPk(tourId);
    if (!tour) throw new Error('Tour not found');

    const message = `🏖️ *${tour.name}*\n\n${tour.description}\n\n⏱️ Duración: ${tour.duration}\n💰 Precio: ${tour.currency} ${tour.price}\n📍 Ubicación: ${tour.location || 'N/A'}\n\n¿Te gustaría reservar este tour? Responde con tu nombre y número de personas.`;

    return this.sendTextMessage(to, message);
  }

  handleIncomingMessage(messageData) {
    const { from, timestamp, type, text, image, id: waMessageId } = messageData;

    return WhatsAppMessage.create({
      waMessageId,
      from,
      to: this.phoneNumberId,
      body: text?.body || null,
      type: type || 'text',
      mediaUrl: image?.link || null,
      direction: 'incoming',
      status: 'delivered',
      contactName: messageData.contacts?.[0]?.profile?.name || null,
    });
  }

  async getMessages({ page = 1, limit = 50, from, status }) {
    const where = {};
    if (from) where.from = from;
    if (status) where.status = status;

    return WhatsAppMessage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
  }

  async markAsRead(id) {
    const message = await WhatsAppMessage.findByPk(id);
    if (message) {
      await message.update({ isRead: true });
    }
    return message;
  }

  async getUnreadCount() {
    return WhatsAppMessage.count({ where: { isRead: false, direction: 'incoming' } });
  }
}

module.exports = new WhatsAppService();
