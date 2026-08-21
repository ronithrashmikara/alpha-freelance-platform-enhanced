# Alpha deployment: Koyeb + Neon

The repository contains two independently deployable services:

- `backend/`: Laravel API, listening on port `8000`
- `frontend/`: Next.js app, listening on port `3000`

## Neon

Create a Neon project and copy its **pooled** connection string. The Laravel
service needs these variables:

- `APP_KEY`: output of `php artisan key:generate --show`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_CONNECTION=pgsql`
- `DB_URL=<Neon pooled connection string>`
- `DB_SSLMODE=require`
- `LOG_CHANNEL=stderr`

The backend container runs `php artisan migrate --force` during startup.

## Koyeb

Create one Koyeb app with two Web Services, both built from Dockerfiles:

1. Backend: repository subdirectory `backend`, port `8000`, health path `/up`.
2. Frontend: repository subdirectory `frontend`, port `3000`, health path `/`.

Set `API_INTERNAL_URL=https://<backend-service-domain>/api` on the frontend.
The browser uses the frontend's same-origin `/api/backend/*` proxy, so the
backend address remains a runtime setting and CORS is not required for normal
frontend traffic.

For production data, use `SESSION_DRIVER=database`, `CACHE_STORE=database`, and
`QUEUE_CONNECTION=database`. For a single hobby instance these are sufficient.
