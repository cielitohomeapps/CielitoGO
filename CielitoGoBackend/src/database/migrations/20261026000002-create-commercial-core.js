'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tours', 'excludes', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('tours', 'restrictions', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('tours', 'conditions', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(150), allowNull: true },
      email: { type: Sequelize.STRING(150), allowNull: true },
      phone: { type: Sequelize.STRING(50), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('customers', ['email'], { name: 'idx_customers_email' });
    await queryInterface.addIndex('customers', ['phone'], { name: 'idx_customers_phone' });

    await queryInterface.createTable('promotions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      tour_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'tours', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(250), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      destination: { type: Sequelize.STRING(200), allowNull: true },
      promotional_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      restrictions: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      conditions: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('promotions', ['is_active', 'start_date', 'end_date'], { name: 'idx_promotions_active_period' });
    await queryInterface.addIndex('promotions', ['is_featured', 'sort_order'], { name: 'idx_promotions_featured_order' });
    await queryInterface.addIndex('promotions', ['tour_id'], { name: 'idx_promotions_tour_id' });

    await queryInterface.createTable('promotion_images', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      promotion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'promotions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      alt: { type: Sequelize.STRING(200), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('promotion_images', ['promotion_id'], { name: 'idx_promotion_images_promotion_id' });

    await queryInterface.createTable('tour_departures', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      tour_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tours', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      capacity: { type: Sequelize.INTEGER, allowNull: false },
      available_spots: { type: Sequelize.INTEGER, allowNull: false },
      price_override: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('available', 'sold_out', 'cancelled'), allowNull: false, defaultValue: 'available' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('tour_departures', ['tour_id', 'start_date', 'status'], { name: 'idx_tour_departures_lookup' });

    await queryInterface.createTable('quotes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      customer_name: { type: Sequelize.STRING(200), allowNull: false },
      phone: { type: Sequelize.STRING(50), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false },
      destination: { type: Sequelize.STRING(200), allowNull: false },
      departure_date: { type: Sequelize.DATEONLY, allowNull: true },
      return_date: { type: Sequelize.DATEONLY, allowNull: true },
      travelers: { type: Sequelize.INTEGER, allowNull: false },
      adults: { type: Sequelize.INTEGER, allowNull: false },
      minors: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      budget: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      comments: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('new', 'reviewing', 'contacted', 'sent', 'accepted', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'new',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('quotes', ['status', 'created_at'], { name: 'idx_quotes_status_created_at' });
    await queryInterface.addIndex('quotes', ['customer_id'], { name: 'idx_quotes_customer_id' });
    await queryInterface.addIndex('quotes', ['email'], { name: 'idx_quotes_email' });

    await queryInterface.createTable('quote_status_history', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      quote_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'quotes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      from_status: { type: Sequelize.STRING(30), allowNull: true },
      to_status: { type: Sequelize.STRING(30), allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('quote_status_history', ['quote_id', 'created_at'], { name: 'idx_quote_history_quote_created' });

    await queryInterface.createTable('reservations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      code: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      quote_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'quotes', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      tour_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'tours', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      promotion_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'promotions', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      departure_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'tour_departures', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      customer_name: { type: Sequelize.STRING(200), allowNull: false },
      phone: { type: Sequelize.STRING(50), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      travelers: { type: Sequelize.INTEGER, allowNull: false },
      adults: { type: Sequelize.INTEGER, allowNull: false },
      minors: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('request', 'pending', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'request',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      cancellation_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('reservations', ['status', 'created_at'], { name: 'idx_reservations_status_created_at' });
    await queryInterface.addIndex('reservations', ['customer_id'], { name: 'idx_reservations_customer_id' });
    await queryInterface.addIndex('reservations', ['tour_id', 'start_date'], { name: 'idx_reservations_tour_start' });
    await queryInterface.addIndex('reservations', ['quote_id'], { name: 'uq_reservations_quote_id', unique: true });

    await queryInterface.createTable('reservation_travelers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reservations', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(150), allowNull: true },
      traveler_type: { type: Sequelize.ENUM('adult', 'minor'), allowNull: false },
      birth_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('reservation_travelers', ['reservation_id'], { name: 'idx_reservation_travelers_reservation_id' });

    await queryInterface.createTable('reservation_status_history', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reservations', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      from_status: { type: Sequelize.STRING(30), allowNull: true },
      to_status: { type: Sequelize.STRING(30), allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('reservation_status_history', ['reservation_id', 'created_at'], { name: 'idx_reservation_history_reservation_created' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('reservation_status_history');
    await queryInterface.dropTable('reservation_travelers');
    await queryInterface.dropTable('reservations');
    await queryInterface.dropTable('quote_status_history');
    await queryInterface.dropTable('quotes');
    await queryInterface.dropTable('tour_departures');
    await queryInterface.dropTable('promotion_images');
    await queryInterface.dropTable('promotions');
    await queryInterface.dropTable('customers');
    await queryInterface.removeColumn('tours', 'conditions');
    await queryInterface.removeColumn('tours', 'restrictions');
    await queryInterface.removeColumn('tours', 'excludes');
  },
};
