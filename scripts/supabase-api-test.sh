#!/usr/bin/env bash
set -euo pipefail

# Simple CLI to exercise Supabase-backed endpoints in this repo.
# Defaults to local dev server; override with BASE_URL env var.
#
# Usage examples:
#   ./scripts/supabase-api-test.sh guests:list
#   ./scripts/supabase-api-test.sh guests:create "João Silva" joao@example.com "+351 912 345 678" Portuguese
#   ./scripts/supabase-api-test.sh guests:import samples/guests.testing.csv
#   ./scripts/supabase-api-test.sh bookings:create <HOSTEL_ID> <GUEST_ID> 2025-10-15 2025-10-17 120
#   ./scripts/supabase-api-test.sh bookings:update <BOOKING_ID> checked_in
#   ./scripts/supabase-api-test.sh bookings:list
#   ./scripts/supabase-api-test.sh export:guests guests.csv
#   ./scripts/supabase-api-test.sh export:bookings bookings.csv
#   ./scripts/supabase-api-test.sh import:bookings samples/bookings.testing.csv

BASE_URL=${BASE_URL:-http://localhost:3000}

have_jq() {
  command -v jq >/dev/null 2>&1 || {
    echo "jq is required. Install jq and retry." >&2
    exit 2
  }
}

curl_json() {
  local method=$1; shift
  local path=$1; shift
  local data=${1:-}
  if [ -n "$data" ]; then
    curl -s -X "$method" "$BASE_URL$path" -H 'Content-Type: application/json' -d "$data"
  else
    curl -s -X "$method" "$BASE_URL$path"
  fi
}

to_json_csv_body() {
  # Reads a CSV file and outputs a JSON object body: {"csv":"..."}
  local file=$1
  # Normalize CRLF and escape newlines for JSON
  local csv
  csv=$(tr -d '\r' < "$file" | sed ':a;N;$!ba;s/\n/\\n/g')
  printf '{"csv":"%s"}' "$csv"
}

usage() {
  cat << USAGE
Supabase API Tester
BASE_URL=$BASE_URL

Commands:
  guests:list
  guests:create <name> <email> [phone] [nationality]
  guests:import <csv_file>

  bookings:create <hostel_id> <guest_id> <check_in:YYYY-MM-DD> <check_out:YYYY-MM-DD> <amount>
  bookings:update <booking_id> <status>
  bookings:list
  import:bookings <csv_file>

  export:guests [outfile]
  export:bookings [outfile]

  smoke <HOSTEL_ID> [CHECK_IN YYYY-MM-DD] [CHECK_OUT YYYY-MM-DD]

CSV formats:
  guests:   id,name,email,phone,nationality
  bookings: id,hostel_id,guest_id,check_in,check_out,amount,status
USAGE
}

cmd=${1:-}
case "$cmd" in
  guests:list)
    have_jq
    curl_json GET /api/guests | jq ;;

  guests:create)
    have_jq
    name=${2:-}; email=${3:-}; phone=${4:-}; nationality=${5:-}
    [ -z "$name" ] && { echo "name required" >&2; exit 1; }
    [ -z "$email" ] && { echo "email required" >&2; exit 1; }
    data=$(jq -n --arg n "$name" --arg e "$email" --arg p "$phone" --arg nat "$nationality" '{name:$n,email:$e,phone:$p,nationality:$nat}')
    curl_json POST /api/guests "$data" | jq ;;

  guests:import)
    have_jq
    file=${2:-}
    [ -f "$file" ] || { echo "CSV file not found: $file" >&2; exit 1; }
    body=$(to_json_csv_body "$file")
    curl_json POST /api/import/guests "$body" | jq ;;

  bookings:create)
    have_jq
    hostel_id=${2:-}; guest_id=${3:-}; ci=${4:-}; co=${5:-}; amount=${6:-}
    for v in hostel_id guest_id ci co amount; do
      eval val=\$$v; [ -z "$val" ] && { echo "$v required" >&2; exit 1; }
    done
    data=$(jq -n --arg h "$hostel_id" --arg g "$guest_id" --arg ci "$ci" --arg co "$co" --argjson a "$amount" '{hostel_id:$h,guest_id:$g,check_in:$ci,check_out:$co,amount:$a}')
    curl_json POST /api/bookings "$data" | jq ;;

  bookings:update)
    have_jq
    id=${2:-}; status=${3:-}
    [ -z "$id" ] && { echo "booking_id required" >&2; exit 1; }
    [ -z "$status" ] && { echo "status required" >&2; exit 1; }
    data=$(jq -n --arg id "$id" --arg s "$status" '{id:$id,status:$s}')
    curl_json PUT /api/bookings "$data" | jq ;;

  bookings:list)
    have_jq
    curl_json GET /api/bookings | jq ;;

  import:bookings)
    have_jq
    file=${2:-}
    [ -f "$file" ] || { echo "CSV file not found: $file" >&2; exit 1; }
    body=$(to_json_csv_body "$file")
    curl_json POST /api/import/bookings "$body" | jq ;;

  export:guests)
    outfile=${2:-guests.csv}
    curl -s "$BASE_URL/api/export/guests" -o "$outfile" && echo "Saved $outfile" && head -n 5 "$outfile" ;;

  export:bookings)
    outfile=${2:-bookings.csv}
    curl -s "$BASE_URL/api/export/bookings" -o "$outfile" && echo "Saved $outfile" && head -n 5 "$outfile" ;;

  smoke)
    have_jq
    HOSTEL_ID=${2:-}
    CI_DATE=${3:-}
    CO_DATE=${4:-}
    if [ -z "$HOSTEL_ID" ]; then
      echo "Usage: $0 smoke <HOSTEL_ID> [CHECK_IN YYYY-MM-DD] [CHECK_OUT YYYY-MM-DD]" >&2
      exit 1
    fi
    if [ -z "$CI_DATE" ]; then
      CI_DATE=$(date -I 2>/dev/null || date +%F)
    fi
    if [ -z "$CO_DATE" ]; then
      CO_DATE=$(date -I -d "+1 day" 2>/dev/null || date -v+1d +%F 2>/dev/null || echo "$CI_DATE")
    fi
    echo "[1/6] Creating test guest..."
    EMAIL_SUFFIX=$RANDOM
    GUEST_JSON=$(jq -n --arg n "Test Guest $EMAIL_SUFFIX" --arg e "test.guest+$EMAIL_SUFFIX@example.com" '{name:$n,email:$e}')
    GUEST_RES=$(curl_json POST /api/guests "$GUEST_JSON")
    echo "$GUEST_RES" | jq
    GUEST_ID=$(echo "$GUEST_RES" | jq -r '.guest.id // empty')
    if [ -z "$GUEST_ID" ]; then
      echo "Failed to create guest" >&2
      exit 1
    fi
    echo "[2/6] Creating booking for guest $GUEST_ID at hostel $HOSTEL_ID ($CI_DATE → $CO_DATE) ..."
    BOOK_JSON=$(jq -n --arg h "$HOSTEL_ID" --arg g "$GUEST_ID" --arg ci "$CI_DATE" --arg co "$CO_DATE" --argjson a 99 '{hostel_id:$h,guest_id:$g,check_in:$ci,check_out:$co,amount:$a}')
    BOOK_RES=$(curl_json POST /api/bookings "$BOOK_JSON")
    echo "$BOOK_RES" | jq
    BOOK_ID=$(echo "$BOOK_RES" | jq -r '.booking.id // empty')
    if [ -z "$BOOK_ID" ]; then
      echo "Failed to create booking (maybe overlap or invalid IDs)." >&2
      exit 1
    fi
    echo "[3/6] Listing guests (first 5)..."
    curl_json GET /api/guests | jq '.guests | .[0:5]'
    echo "[4/6] Listing bookings (first 5)..."
    curl_json GET /api/bookings | jq '.bookings | .[0:5]'
    echo "[5/6] Exporting guests.csv"
    curl -s "$BASE_URL/api/export/guests" -o guests.csv && head -n 5 guests.csv
    echo "[6/6] Exporting bookings.csv"
    curl -s "$BASE_URL/api/export/bookings" -o bookings.csv && head -n 5 bookings.csv
    echo "Smoke test complete. Guest: $GUEST_ID, Booking: $BOOK_ID" ;;

  ""|help|-h|--help)
    usage ;;

  *)
    echo "Unknown command: $cmd" >&2
    usage
    exit 1 ;;
esac
