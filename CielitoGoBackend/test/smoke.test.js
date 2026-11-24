const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const express = require('express');
const sharp = require('sharp');
const { sequelize } = require('../src/database');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-not-for-production-123456';
process.env.WHATSAPP_APP_SECRET = 'test-whatsapp-app-secret';

const app = require('../src/app');
const upload = require('../src/middleware/upload');
const errorHandler = require('../src/middleware/errorHandler');
const config = require('../src/config');
const cloudinaryService = require('../src/services/cloudinaryService');

test('database dialect is PostgreSQL', () => {
  assert.equal(sequelize.getDialect(), 'postgres');
});

const withServer = async (callback) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
};

test('the application loads and exposes its liveness endpoint', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.ok(response.headers.get('x-content-type-options'));
  });
});

test('unknown routes return the JSON error contract', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/does-not-exist`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.code, 'NOT_FOUND');
  });
});

test('administrative registration requires authentication', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Unauthorized Admin',
        email: 'admin@example.com',
        password: 'a-strong-password',
        role: 'admin',
      }),
    });

    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, 'ACCESS_TOKEN_REQUIRED');
  });
});

test('WhatsApp webhook rejects requests without a valid signature', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entry: [] }),
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.code, 'INVALID_WEBHOOK_SIGNATURE');
  });
});

test('WhatsApp webhook accepts a correctly signed request', async () => {
  await withServer(async (baseUrl) => {
    const payload = JSON.stringify({ entry: [] });
    const signature = `sha256=${crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET).update(payload).digest('hex')}`;
    const response = await fetch(`${baseUrl}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signature,
      },
      body: payload,
    });

    assert.equal(response.status, 200);
  });
});

test('production configuration fails closed without JWT_SECRET', () => {
  const env = { ...process.env, NODE_ENV: 'production' };
  delete env.JWT_SECRET;
  const result = spawnSync(process.execPath, ['-e', "require('../src/config')"], {
    cwd: __dirname,
    env,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /JWT_SECRET es obligatorio/);
});

test('upload validation rejects spoofed image content', async () => {
  const uploadApp = express();
  uploadApp.post('/upload', upload.single('file'), upload.validateImages, (req, res) => res.status(204).end());
  uploadApp.use(errorHandler);

  const server = uploadApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const form = new FormData();
    form.append('file', new Blob(['<html><script>alert(1)</script></html>'], { type: 'image/jpeg' }), 'fake.html');
    const response = await fetch(`http://127.0.0.1:${port}/upload`, { method: 'POST', body: form });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_IMAGE_CONTENT');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('production uploads fail closed without persistent storage', async () => {
  const previous = {
    nodeEnv: config.nodeEnv,
    cloudinaryEnabled: config.cloudinary.enabled,
    allowEphemeralUploads: config.allowEphemeralUploads,
  };
  config.nodeEnv = 'production';
  config.cloudinary.enabled = false;
  config.allowEphemeralUploads = false;

  const uploadApp = express();
  uploadApp.post('/upload', upload.single('file'), (req, res) => res.status(204).end());
  uploadApp.use(errorHandler);
  const server = uploadApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
    const form = new FormData();
    form.append('file', new Blob([image], { type: 'image/png' }), 'image.png');
    const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, { method: 'POST', body: form });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'PERSISTENT_STORAGE_REQUIRED');
  } finally {
    config.nodeEnv = previous.nodeEnv;
    config.cloudinary.enabled = previous.cloudinaryEnabled;
    config.allowEphemeralUploads = previous.allowEphemeralUploads;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Cloudinary storage annotates every file in a multiple upload', async () => {
  const previousEnabled = config.cloudinary.enabled;
  const originalUploadImage = cloudinaryService.uploadImage;
  config.cloudinary.enabled = true;
  let sequence = 0;
  cloudinaryService.uploadImage = async () => {
    sequence += 1;
    return { url: `https://res.cloudinary.com/test/image/upload/media-${sequence}.png`, publicId: `media-${sequence}` };
  };
  const req = { files: [{ buffer: Buffer.from('a') }, { buffer: Buffer.from('b') }] };

  try {
    await new Promise((resolve, reject) => upload.storeImage('media')(req, {}, (error) => (error ? reject(error) : resolve())));
    assert.equal(req.files[0].cloudinaryPublicId, 'media-1');
    assert.equal(req.files[1].cloudinaryPublicId, 'media-2');
  } finally {
    config.cloudinary.enabled = previousEnabled;
    cloudinaryService.uploadImage = originalUploadImage;
  }
});

test('P1 public forms reject invalid payloads before database access', async () => {
  await withServer(async (baseUrl) => {
    const quoteResponse = await fetch(`${baseUrl}/api/quotes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ customerName: '', travelers: -1 }),
    });
    const reservationResponse = await fetch(`${baseUrl}/api/reservations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ customerName: 'A', travelers: 0 }),
    });

    assert.equal(quoteResponse.status, 400);
    assert.equal((await quoteResponse.json()).code, 'VALIDATION_ERROR');
    assert.equal(reservationResponse.status, 400);
    assert.equal((await reservationResponse.json()).code, 'VALIDATION_ERROR');
  });
});

test('P1 administrative endpoints require authentication', async () => {
  await withServer(async (baseUrl) => {
    const responses = await Promise.all([
      fetch(`${baseUrl}/api/quotes`),
      fetch(`${baseUrl}/api/reservations`),
      fetch(`${baseUrl}/api/customers`),
      fetch(`${baseUrl}/api/promotions`, { method: 'POST' }),
      fetch(`${baseUrl}/api/tours/2f9b298e-7682-4f52-a951-cbb70cbd3190/departures`, { method: 'POST' }),
    ]);

    for (const response of responses) assert.equal(response.status, 401);
  });
});
