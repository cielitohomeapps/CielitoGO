const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateQuoteCode(date = new Date()) {
  const bytes = crypto.randomBytes(5);
  const suffix = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
  return `CG-${date.getFullYear()}-${suffix}`;
}

module.exports = generateQuoteCode;
