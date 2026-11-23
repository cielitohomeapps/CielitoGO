# Cielito Go Turismo - Backend API

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set DATABASE_URL to the Supabase PostgreSQL connection URI in .env
# JWT_SECRET is required and must be a strong unique value

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Start development server
npm run dev
```

The application never changes the schema on startup. Run the versioned migrations before starting a new release.
The database migrations create the schema in Supabase; they do not copy existing data from MySQL. Export and
transfer existing records separately before switching production traffic.

## Imágenes con Cloudinary

Configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en el `.env` del backend. Opcionalmente usa `CLOUDINARY_FOLDER` para cambiar la carpeta raíz (por defecto, `cielito-go`).

Las imágenes de tours y promociones se validan en el backend antes de subirse. La API guarda la URL segura y el `public_id` para poder reemplazarlas o eliminarlas en Cloudinary. No expongas `CLOUDINARY_API_SECRET` mediante variables `REACT_APP_*` o `NEXT_PUBLIC_*`.

## Initial administrator

Before running the seed, configure `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and a unique `INITIAL_ADMIN_PASSWORD` of at least 12 characters. The project does not include default credentials.

## Verification

```bash
npm test
npm audit --omit=dev
```

- `GET /health` is a process liveness check.
- `GET /ready` verifies database connectivity.
- Administrative user creation requires an authenticated `admin` token.
- WhatsApp POST webhooks require `WHATSAPP_APP_SECRET` and a valid Meta signature.
- Public quote and reservation forms are available at `POST /api/quotes` and `POST /api/reservations` with dedicated rate limits.
- Promotion visibility and departure availability are filtered server-side.
- Confirming/cancelling reservations updates departure capacity transactionally.

## API Documentation
See `docs/ARCHITECTURE.md` for full API documentation.
