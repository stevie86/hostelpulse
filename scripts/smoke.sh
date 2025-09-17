#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
ADMIN_TOKEN=${ADMIN_TOKEN:-4c23dc5f20b15c42482ac456e0d7eb59e64a04c8ea6cd2ab20bd550ae4fd8786}
HEADER_TOKEN="x-admin-token: ${ADMIN_TOKEN}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }
}

require_cmd curl

info() { printf '\n=== %s ===\n' "$1"; }

info "GET /api/guests"
response=$(curl -sS -H "$HEADER_TOKEN" "$BASE_URL/api/guests")
echo "$response" | head -c 200 >/dev/null

tmp_guest=$(mktemp)
cat <<JSON >"$tmp_guest"
{
  "name": "Smoke Test Guest",
  "email": "smoke+guest@hostelpulse.local",
  "phone": "+351 910 000 000"
}
JSON

info "POST /api/guests"
post_response=$(curl -sS -X POST -H "$HEADER_TOKEN" -H 'Content-Type: application/json' \
  -d @"$tmp_guest" "$BASE_URL/api/guests")
echo "$post_response"

echo "Smoke test complete"
