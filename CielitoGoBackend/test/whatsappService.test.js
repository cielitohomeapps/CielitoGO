const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-not-for-production-123456';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone-id';
process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token';

const { WhatsAppMessage } = require('../src/models');

test('WhatsApp service sends and persists supported message types', async () => {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ authorization: req.headers.authorization, body: JSON.parse(body) });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ messages: [{ id: `wa-${requests.length}` }] }));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.WHATSAPP_API_URL = `http://127.0.0.1:${server.address().port}`;
  require('../src/config').whatsapp.apiUrl = process.env.WHATSAPP_API_URL;

  const created = [];
  const originalCreate = WhatsAppMessage.create;
  WhatsAppMessage.create = async (value) => { created.push(value); return value; };
  delete require.cache[require.resolve('../src/modules/whatsapp/whatsappService')];
  const service = require('../src/modules/whatsapp/whatsappService');

  try {
    await service.sendTextMessage('5210000000000', 'Hola');
    await service.sendTemplateMessage('5210000000000', 'bienvenida');
    await service.sendImageMessage('5210000000000', 'https://example.test/image.jpg', 'Imagen');
    assert.equal(requests.length, 3);
    assert.ok(requests.every((request) => request.authorization === 'Bearer test-access-token'));
    assert.deepEqual(requests.map((request) => request.body.type), ['text', 'template', 'image']);
    assert.equal(created.length, 3);
    assert.equal(created[2].mediaUrl, 'https://example.test/image.jpg');
  } finally {
    WhatsAppMessage.create = originalCreate;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('WhatsApp incoming messages are idempotent and statuses are updated', async () => {
  const originalFindOrCreate = WhatsAppMessage.findOrCreate;
  const originalUpdate = WhatsAppMessage.update;
  const calls = { find: [], update: [] };
  WhatsAppMessage.findOrCreate = async (value) => { calls.find.push(value); return [value.defaults, true]; };
  WhatsAppMessage.update = async (values, options) => { calls.update.push({ values, options }); return [1]; };
  delete require.cache[require.resolve('../src/modules/whatsapp/whatsappService')];
  const service = require('../src/modules/whatsapp/whatsappService');

  try {
    await service.handleIncomingMessage({ id: 'incoming-1', from: '521', type: 'text', text: { body: 'Hola' } });
    await service.handleStatusUpdate({ id: 'wa-1', status: 'read' });
    assert.equal(calls.find[0].where.waMessageId, 'incoming-1');
    assert.equal(calls.update[0].values.status, 'read');
    assert.equal(calls.update[0].options.where.waMessageId, 'wa-1');
  } finally {
    WhatsAppMessage.findOrCreate = originalFindOrCreate;
    WhatsAppMessage.update = originalUpdate;
  }
});
