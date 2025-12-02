# Testing Sanctum Authentication

This guide covers manual curl checks and automated PHPUnit feature tests for the Sanctum auth flow.

## Manual Tests (curl)
Script: `tests/manual-auth-tests.sh` (run from repo root).

```bash
chmod +x tests/manual-auth-tests.sh
USERNAME="admin" PASSWORD="your-bcrypt-password" \
LEGACY_USERNAME="legacy-user" LEGACY_PASSWORD="legacy-hmac-password" \
API_BASE="http://localhost:8000/api/v1" \
./tests/manual-auth-tests.sh
```

What it does:
- Test 1: Protected endpoint without token → 401.
- Test 2: Login (valid credentials) → returns token.
- Test 3: Protected endpoint with token → 200.
- Test 4: Login with legacy HMAC password → succeeds and triggers auto-migrate to bcrypt.
- Test 5: Second login for same legacy user → succeeds using bcrypt.
- Test 6: Logout → token revoked.
- Test 7: Request with revoked token → 401.

Requirements: bash, curl, Python (for JSON parsing), API running at `API_BASE`.

## Automated Tests (PHPUnit Feature)
File: `tests/Feature/Api/Auth/AuthTest.php`.

Run from `laravel-api/`:
```bash
cd laravel-api
php artisan test --filter=AuthTest
```

What the suite covers:
- Login with valid credentials returns token and user payload.
- Login with invalid credentials returns 401.
- Protected route without token returns 401.
- Protected route with valid token returns 200.
- Logout revokes token (subsequent call with same token returns 401).

Notes / prerequisites:
- Tests use in-memory SQLite and disable legacy table prefixes (`yoc.prefix_primary`, `yoc.prefix_fallback`) so the User model resolves to `users`.
- Test schema is created dynamically for `users` and `personal_access_tokens`; production data is untouched.
- Ensure `BACKOFFICE_SECRET` is set in `.env` for the API when running manual tests; automated tests do not depend on it.

## Troubleshooting
- **401 on login in manual tests**: verify credentials, `BACKOFFICE_SECRET`, and that the user’s `user_status` is active (0).
- **401 on protected routes with token**: confirm token is sent as `Authorization: Bearer <token>` and that `personal_access_tokens` table exists.
- **Auto-migrate not happening**: ensure the legacy user’s stored hash is 64-char HMAC-SHA256 and `BACKOFFICE_SECRET` matches the legacy secret.
- **PHPUnit DB errors**: make sure SQLite is available; the suite sets up its own schema and doesn’t need MySQL. If you prefer MySQL, adjust `AuthTest::setUp()` to point at your test database and ensure prefixed tables exist.
