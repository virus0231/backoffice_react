#!/usr/bin/env bash
set -euo pipefail

# Manual Sanctum auth test script
# Requirements: curl, bash, Python (for JSON parsing)

API_BASE="${API_BASE:-http://localhost:8000/api/v1}"
USERNAME="${USERNAME:-}"
PASSWORD="${PASSWORD:-}"
LEGACY_USERNAME="${LEGACY_USERNAME:-$USERNAME}"
LEGACY_PASSWORD="${LEGACY_PASSWORD:-$PASSWORD}"

if [[ -z "$USERNAME" || -z "$PASSWORD" ]]; then
  echo "Set USERNAME and PASSWORD env vars (valid user with bcrypt or migrated password)." >&2
  exit 1
fi

echo "API_BASE=$API_BASE"
echo "USERNAME=$USERNAME"
echo "LEGACY_USERNAME=$LEGACY_USERNAME"
echo

parse_token() {
  python - <<'PY' "$@"
import json, sys
data=json.loads(sys.stdin.read())
print(data.get("token",""))
PY
}

fail_expected() {
  if [[ $1 -eq 0 ]]; then
    echo "❌ Expected failure but request succeeded"
    exit 1
  fi
}

echo "Test 1: Unauthenticated request to protected endpoint (should be 401)"
set +e
resp=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health")
set -e
echo "HTTP $resp"
[[ "$resp" == "401" ]] || { echo "❌ Expected 401"; exit 1; }
echo "✅ Unauthenticated request blocked"
echo

echo "Test 2: Login with valid credentials (expect token)"
login_body=$(cat <<JSON
{"username_val":"$USERNAME","password_val":"$PASSWORD"}
JSON
)
login_resp=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "$login_body")
echo "Response: $login_resp"
TOKEN=$(echo "$login_resp" | parse_token)
[[ -n "$TOKEN" ]] || { echo "❌ No token returned"; exit 1; }
echo "✅ Received token"
echo

echo "Test 3: Authenticated request with token (should succeed)"
auth_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health" \
  -H "Authorization: Bearer $TOKEN")
echo "HTTP $auth_code"
[[ "$auth_code" == "200" ]] || { echo "❌ Expected 200"; exit 1; }
echo "✅ Protected endpoint succeeded"
echo

echo "Test 4: Login with legacy HMAC password (auto-migrate to bcrypt)"
legacy_body=$(cat <<JSON
{"username_val":"$LEGACY_USERNAME","password_val":"$LEGACY_PASSWORD"}
JSON
)
legacy_resp=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "$legacy_body")
echo "Response: $legacy_resp"
LEGACY_TOKEN=$(echo "$legacy_resp" | parse_token)
[[ -n "$LEGACY_TOKEN" ]] || { echo "❌ No token for legacy login"; exit 1; }
echo "✅ Legacy login worked; password should now be bcrypt"
echo

echo "Test 5: Second login with same user (should use bcrypt)"
second_resp=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "$legacy_body")
echo "Response: $second_resp"
SECOND_TOKEN=$(echo "$second_resp" | parse_token)
[[ -n "$SECOND_TOKEN" ]] || { echo "❌ Second login failed"; exit 1; }
echo "✅ Second login succeeded (bcrypt)"
echo

echo "Test 6: Logout (invalidate token)"
logout_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/auth/logout" \
  -X POST \
  -H "Authorization: Bearer $TOKEN")
echo "HTTP $logout_code"
[[ "$logout_code" == "200" ]] || { echo "❌ Expected 200 on logout"; exit 1; }
echo "✅ Logout succeeded"
echo

echo "Test 7: Request with invalidated token (should be 401)"
post_logout_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health" \
  -H "Authorization: Bearer $TOKEN")
echo "HTTP $post_logout_code"
[[ "$post_logout_code" == "401" ]] || { echo "❌ Expected 401 after logout"; exit 1; }
echo "✅ Token invalidated"
echo

echo "All manual auth tests completed."
