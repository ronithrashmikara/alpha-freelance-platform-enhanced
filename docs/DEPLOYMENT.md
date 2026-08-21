# Alpha deployment: Render + Neon

The repository contains two independently deployable services:

- `backend/`: Laravel API
- `frontend/`: Next.js app

## Neon

Create a Neon project and copy both connection strings. Use the pooled URL for
application traffic and the direct URL for migrations:

- `APP_KEY`: output of `php artisan key:generate --show`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_CONNECTION=pgsql`
- `DB_URL=<Neon pooled connection string (-pooler host)>`
- `DB_MIGRATION_URL=<Neon direct connection string>`
- `DB_SSLMODE=require`
- `LOG_CHANNEL=stderr`

The backend container runs migrations through the direct connection during
startup, then uses the pooled connection for web requests.

## Render

The root `render.yaml` Blueprint defines two free Docker web services in the
Singapore region:

1. `alpha-api`: Laravel backend, health path `/up`.
2. `alpha-web`: Next.js frontend, health path `/`.

Create a Render Blueprint from the repository. During setup, provide the two
Neon URLs. After Render assigns the API domain, set
`API_INTERNAL_URL=https://<backend-service-domain>/api` on `alpha-web`.
The browser uses the frontend's same-origin `/api/backend/*` proxy, so the
backend address remains a runtime setting and CORS is not required for normal
frontend traffic.

For production data, use `SESSION_DRIVER=database`, `CACHE_STORE=database`, and
`QUEUE_CONNECTION=database`. For a single hobby instance these are sufficient.
