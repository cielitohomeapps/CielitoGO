# Cielito Go - Backend API Architecture

## Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL on Supabase + Sequelize ORM
- **Auth**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Sharp (currently stored on local disk)
- **WhatsApp**: WhatsApp Business Cloud API

The current upload middleware writes to `public/uploads`; use durable object storage such as Cloudinary
before deploying to an environment with ephemeral or multiple application instances.

## Project Structure

```
src/
├── config/             # Configuration files
│   ├── index.js        # Main config (env vars)
│   └── database.js     # Database config
├── database/
│   ├── index.js        # Sequelize connection
│   ├── migrations/     # Database migrations
│   └── seeds/          # Seed data
├── middleware/
│   ├── auth.js         # JWT auth + role authorization
│   ├── upload.js       # Multer file upload config
│   └── errorHandler.js # Global error handler
├── models/             # Sequelize models
│   ├── index.js        # Model associations
│   ├── User.js
│   ├── Tour.js
│   ├── TourImage.js
│   ├── Pricing.js
│   ├── Media.js
│   ├── PageContent.js
│   ├── WhatsAppMessage.js
│   └── Setting.js
├── modules/
│   ├── auth/           # Authentication module
│   ├── tours/          # Tours CRUD module
│   ├── pricing/        # Pricing management module
│   ├── media/          # Media/images management
│   ├── pages/          # CMS page content module
│   └── whatsapp/       # WhatsApp integration module
├── routes/
│   └── index.js        # Main API routes
├── utils/
│   └── validators.js   # Validation utilities
└── server.js           # Entry point
```

## Modules

### Auth Module
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Create new user (authenticated admin only)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/users` - List all users (admin)
- `PUT /api/auth/users/:id/role` - Change user role (admin)
- `PUT /api/auth/users/:id/toggle` - Enable/disable user (admin)

### Tours Module
- `GET /api/tours` - Public active tours; authenticated users may query all tours
- `GET /api/tours/:id` - Public active tour by ID; authenticated users may query inactive tours
- `POST /api/tours` - Create tour (with image upload)
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Deactivate tour (admin)
- `POST /api/tours/:id/images` - Add image to tour
- `DELETE /api/tours/:id/images/:imageId` - Remove tour image
- `PUT /api/tours/reorder` - Reorder tours

### Pricing Module
- `GET /api/pricing` - List all prices
- `GET /api/pricing/active/:tourId` - Get public active price for an active tour
- `GET /api/pricing/:id` - Get price by ID
- `POST /api/pricing` - Create price entry
- `PUT /api/pricing/:id` - Update price
- `DELETE /api/pricing/:id` - Deactivate price (admin)

### Media Module
- `GET /api/media` - List all media files
- `GET /api/media/:id` - Get media by ID
- `POST /api/media` - Upload single file
- `POST /api/media/multiple` - Upload multiple files
- `PUT /api/media/:id` - Update alt/category
- `DELETE /api/media/:id` - Delete media file (admin)
- `PUT /api/media/:id/resize` - Resize image

### Pages Module (CMS)
- `GET /api/pages/content/:page` - Get page content by name (public)
- `GET /api/pages/content` - Get all content (admin)
- `PUT /api/pages/content/:page/:section/:key` - Update specific content
- `POST /api/pages/content/bulk` - Bulk update content
- `DELETE /api/pages/content/:page/:section/:key` - Delete content
- `GET /api/pages/settings` - Get all settings
- `PUT /api/pages/settings/:key` - Update setting
- `POST /api/pages/settings/bulk` - Bulk update settings
- `GET /api/public/settings` - Public allowlisted contact/social settings

### WhatsApp Module
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Receive incoming messages
- `GET /api/whatsapp/messages` - List messages
- `GET /api/whatsapp/conversation/:phone` - Get conversation
- `GET /api/whatsapp/unread` - Get unread count
- `PUT /api/whatsapp/read/:id` - Mark as read
- `POST /api/whatsapp/send` - Send message
- `POST /api/whatsapp/send-tour` - Send tour info

POST webhooks validate Meta's SHA-256 signature. Delivery/read-status events, incoming media downloads,
and duplicate-event idempotency are not implemented yet.

### Promotions Module
- `GET /api/promotions` - Public active/in-date promotions; authenticated users may query all
- `GET /api/promotions/:id` - Promotion detail
- `POST /api/promotions` - Create promotion (admin/editor)
- `PUT /api/promotions/:id` - Update promotion (admin/editor)
- `DELETE /api/promotions/:id` - Deactivate promotion (admin)
- `POST /api/promotions/:id/images` - Add promotion image (admin/editor)
- `DELETE /api/promotions/:id/images/:imageId` - Delete promotion image (admin)

### Tour Departures Module
- `GET /api/tours/:id/departures` - Public future availability; authenticated users may query all statuses
- `POST /api/tours/:id/departures` - Create departure (admin/editor)
- `PUT /api/tours/:id/departures/:departureId` - Update dates, capacity, price, or status
- `DELETE /api/tours/:id/departures/:departureId` - Cancel departure (admin)

### Quotes Module
- `POST /api/quotes` - Submit a public quote request
- `GET /api/quotes` - Administrative list
- `GET /api/quotes/:id` - Administrative detail
- `PATCH /api/quotes/:id` - Update request data (admin/editor)
- `PATCH /api/quotes/:id/status` - Apply a validated status transition
- `GET /api/quotes/:id/history` - Status history
- `POST /api/quotes/:id/convert-to-reservation` - Convert an accepted quote

Quote states: `new`, `reviewing`, `contacted`, `sent`, `accepted`, `rejected`, `cancelled`.

### Reservations Module
- `POST /api/reservations` - Submit a public reservation request
- `GET /api/reservations` - Administrative list
- `GET /api/reservations/:id` - Detail with travelers and history
- `PATCH /api/reservations/:id` - Update reservation data (admin/editor)
- `PATCH /api/reservations/:id/status` - Apply a validated status transition
- `POST /api/reservations/:id/cancel` - Cancel and restore confirmed capacity
- `GET /api/reservations/:id/history` - Status history

Reservation states: `request`, `pending`, `confirmed`, `cancelled`, `completed`. Capacity is deducted only when a reservation is confirmed and is restored when a confirmed reservation is cancelled.

### Customers Module
- `GET /api/customers` - Search/list customers
- `GET /api/customers/:id` - Customer detail and history counts
- `POST /api/customers` - Create customer (admin/editor)
- `PUT /api/customers/:id` - Update customer (admin/editor)
- `DELETE /api/customers/:id` - Deactivate customer (admin)
- `GET /api/customers/:id/quotes` - Quote history
- `GET /api/customers/:id/reservations` - Reservation history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### Users
- id (UUID), name, email, password, role (admin|editor), isActive, lastLogin

### Tours
- id, name, slug, description, shortDescription, duration, price, currency, capacity, difficulty, location, highlights (JSON), includes (JSON), itinerary (JSON), imageUrl, isActive, sortOrder, metaTitle, metaDescription

### Tour Images
- id, tourId (FK), imageUrl, alt, sortOrder, isPrimary

### Pricings
- id, name, tourId (FK), season (low|mid|high|peak|custom), seasonName, price, discountPrice, currency, validFrom, validTo, minPeople, maxPeople, isActive, notes

### Media
- id, filename, originalName, mimeType, size, path, url, width, height, alt, category, uploadedBy

### Page Contents
- id, page, section, key, value, type (text|image|json|boolean|number|link), metadata (JSON), isActive, updatedBy

### Settings
- id, key (unique), value, type, group, description

### WhatsApp Messages
- id, waMessageId, from, to, body, type, mediaUrl, direction (incoming|outgoing), status, templateName, metadata, contactName, tourId (optional), isRead

### Promotions and Departures
- promotions: title, description, destination, promotional price, validity, restrictions, conditions, active/featured/order, optional tour
- promotion_images: promotion image gallery
- tour_departures: dates, capacity, available spots, optional price override, status

### Commercial Workflow
- customers: minimal contact identity and active status
- quotes + quote_status_history: quote request snapshots and traceable transitions
- reservations + reservation_status_history: booking snapshots, associations, status, cancellation data
- reservation_travelers: minimal traveler names/type and optional birth date

## Setup

1. Copy `.env.example` to `.env` and configure
2. Configure `DATABASE_URL` with the Supabase PostgreSQL connection URI and set `DB_SSL=true`
3. Run `npm install`
4. Run `npx sequelize-cli db:migrate`
5. Run `npx sequelize-cli db:seed:all`
6. Run `npm run dev`

## Initial administrator

The initial administrator is created from the `INITIAL_ADMIN_*` environment variables. No default credentials are included.

## Frontend Integration

The API serves from `/api`. For the frontend:

```javascript
// Fetch page content
const response = await fetch('/api/pages/content/home');
const { content } = await response.json();

// Fetch tours
const response = await fetch('/api/tours?active=true');
const { tours } = await response.json();
```

## Key Features

1. **CMS**: Edit page content, images, and text without developer intervention
2. **Tours Management**: CRUD with images, seasonal pricing, departures, capacity, and availability
3. **Media Library**: Validate, upload, resize, and organize raster images
4. **WhatsApp Integration**: Send/receive messages, tour info via WhatsApp
5. **Role-based Auth**: Admin and Editor roles with different permissions
6. **Commercial workflow**: Promotions, quote intake, reservation conversion, customers, travelers, and status histories
7. **API safeguards**: Request limits, rate limits, security headers, webhook signatures, and JSON error responses
