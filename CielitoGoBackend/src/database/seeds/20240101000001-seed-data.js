'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const adminName = process.env.INITIAL_ADMIN_NAME;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    if (!adminName || !adminEmail || !adminPassword || adminPassword.length < 12) {
      throw new Error('INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD (mínimo 12 caracteres) son obligatorios para ejecutar el seed');
    }

    const adminId = uuidv4();
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: await bcrypt.hash(adminPassword, 12),
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('settings', [
      { id: uuidv4(), key: 'site_name', value: 'Cielito Go Turismo', type: 'text', group: 'general', description: 'Nombre del sitio', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'site_logo', value: '/images/logo.png', type: 'image', group: 'general', description: 'Logo del sitio', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'site_email', value: 'info@cielitogo.com', type: 'text', group: 'contact', description: 'Email de contacto', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'site_phone', value: '+5491112345678', type: 'text', group: 'contact', description: 'Teléfono de contacto', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'whatsapp_number', value: '+5491112345678', type: 'text', group: 'whatsapp', description: 'Número de WhatsApp', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'hero_title', value: 'Explora la mejor experiencia turística', type: 'text', group: 'home', description: 'Título principal del hero', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'hero_subtitle', value: 'Descubre los destinos más increíbles', type: 'text', group: 'home', description: 'Subtítulo del hero', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'hero_image', value: '/images/hero-default.jpg', type: 'image', group: 'home', description: 'Imagen del hero', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'facebook_url', value: 'https://facebook.com/cielitogo', type: 'text', group: 'social', description: 'URL de Facebook', created_at: now, updated_at: now },
      { id: uuidv4(), key: 'instagram_url', value: 'https://instagram.com/cielitogo', type: 'text', group: 'social', description: 'URL de Instagram', created_at: now, updated_at: now },
    ]);
  },

  down: async (queryInterface) => {
    const settingKeys = [
      'site_name', 'site_logo', 'site_email', 'site_phone', 'whatsapp_number',
      'hero_title', 'hero_subtitle', 'hero_image', 'facebook_url', 'instagram_url',
    ];
    await queryInterface.bulkDelete('settings', { key: settingKeys }, {});
    if (process.env.INITIAL_ADMIN_EMAIL) {
      await queryInterface.bulkDelete('users', { email: process.env.INITIAL_ADMIN_EMAIL.toLowerCase() }, {});
    }
  },
};
