PHP API Endpoints
=================

This folder contains standalone PHP endpoints you can upload to your server (e.g., cPanel `public_html/api`).

Endpoints
- `analytics.php` — Analytics data
  - Params (GET):
    - `kind`: `total-raised` | `first-installments` | `one-time-donations`
    - `startDate`: `YYYY-MM-DD`
    - `endDate`: `YYYY-MM-DD`
    - `granularity`: `daily` | `weekly` (default: `daily`)
    - `appealId` (optional): numeric
    - `fundId` (optional): numeric
    - `frequency` (optional): `all` | `one-time` | `recurring` | `recurring-first` | `recurring-next`
  - Date filter uses inclusive microsecond bounds:
    - `t.date >= 'YYYY-MM-DD 00:00:00.000000' AND t.date <= 'YYYY-MM-DD 23:59:59.999999'`

- `filters/appeals.php` — Appeals list
- `filters/funds.php` — Funds list (optional `appeal_ids=1,2,3`)

Configuration
- Copy this folder to your server, e.g.: `public_html/api`
- Set DB credentials either as environment variables or edit `config.php`:
  - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`

CORS
- By default, `_*` endpoints enable `Access-Control-Allow-Origin: *`. Restrict this if needed.

Frontend
- Set `NEXT_PUBLIC_PHP_API_BASE_URL` to the URL where these endpoints are served (no trailing slash). Example:
  - `NEXT_PUBLIC_PHP_API_BASE_URL=https://example.com/api`
- If this env var is not set, the frontend will default to `"/php-api"` so local setups that serve this folder directly will work out-of-the-box.

Logging
- Server-side PHP errors are logged to `php-api/logs/php-api.log` (best effort).
- The bootstrap sets:
  - `error_reporting(E_ALL)`, `log_errors=1`, `display_errors=0`
  - A request line like `[php-api] GET /analytics.php?...` at start
- Access to `php-api/logs/` is denied via `.htaccess` to prevent web access.
- If the folder is not writable by PHP, logs fall back to the server’s default error log.
