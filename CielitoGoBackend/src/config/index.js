require('dotenv').config();

const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'test' ? 'test-only-secret-not-for-production-123456' : null);

if (!jwtSecret) {
  throw new Error('JWT_SECRET es obligatorio');
}

if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
}

const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseTrustProxy = (value) => {
  if (!value || value === 'false') return false;
  if (value === 'true') return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : false;
};

module.exports = {
  port: positiveInteger(process.env.PORT, 3000),
  nodeEnv,

  db: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.DB_TEST_URL,
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    name: process.env.PGDATABASE || 'cielito_go',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: process.env.DB_SSL === 'true' || (nodeEnv === 'production' && process.env.DB_SSL !== 'false'),
  },

  jwt: {
    secret: jwtSecret,
    expiration: process.env.JWT_EXPIRATION || '24h',
    issuer: process.env.JWT_ISSUER || 'cielito-go-api',
    audience: process.env.JWT_AUDIENCE || 'cielito-go-admin',
  },

  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
  },

  upload: {
    dir: path.resolve(process.env.UPLOAD_DIR || './public/uploads'),
    maxFileSize: positiveInteger(process.env.MAX_FILE_SIZE, 10485760),
    maxWidth: positiveInteger(process.env.MAX_IMAGE_WIDTH, 8000),
    maxHeight: positiveInteger(process.env.MAX_IMAGE_HEIGHT, 8000),
    maxPixels: positiveInteger(process.env.MAX_IMAGE_PIXELS, 40000000),
  },

  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '1mb',

  rateLimit: {
    windowMs: positiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: positiveInteger(process.env.RATE_LIMIT_MAX, 300),
    authMax: positiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 10),
    webhookMax: positiveInteger(process.env.WEBHOOK_RATE_LIMIT_MAX, 120),
    publicFormMax: positiveInteger(process.env.PUBLIC_FORM_RATE_LIMIT_MAX, 20),
  },

  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
