const crypto = require('crypto');
const config = require('../config');

const verifyWhatsAppSignature = (req, res, next) => {
  if (!config.whatsapp.appSecret) {
    return res.status(503).json({
      success: false,
      code: 'WHATSAPP_NOT_CONFIGURED',
      message: 'El webhook de WhatsApp no está configurado',
    });
  }

  const signature = req.get('x-hub-signature-256');
  if (!signature || !req.rawBody) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_WEBHOOK_SIGNATURE',
      message: 'Firma de webhook inválida',
    });
  }

  const expected = `sha256=${crypto.createHmac('sha256', config.whatsapp.appSecret).update(req.rawBody).digest('hex')}`;
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  const valid = receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

  if (!valid) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_WEBHOOK_SIGNATURE',
      message: 'Firma de webhook inválida',
    });
  }

  next();
};

module.exports = verifyWhatsAppSignature;
