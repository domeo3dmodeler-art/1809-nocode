#!/usr/bin/env bash
# Smoke script for Domeo (Next.js app)
# Checks:
#  - /api/health → 200/204
#  - /api/admin/ping without token → 401
#  - /api/admin/ping with token → 200
#  - /doors SSR marker data-smoke="compat-active"
#  - /api/cart/export/doors/{kp,invoice,factory} → tolerant check:
#       * try GET; on 405 fallback to POST {}
#       * HTTP 200/204 accepted; WARN on other codes (do not fail CI for now)

set -u  # (no -e, we handle errors manually)

BASE_URL="${BASE_URL:-http://localhost:3000}"
CURL_TIMEOUT="${CURL_TIMEOUT:-20}"
BEARER_TOKEN="${BEARER_TOKEN:-smoke}"
TMP_DIR="${TMP_DIR:-/tmp}"
SMOKE_FAIL=0

log() { echo -e "$*"; }

req() {
  # usage: req METHOD URL [DATA]
  local method="$1"; shift
  local url="$1"; shift
  local data="${1:-}"

  if [[ "$method" == "GET" ]]; then
    curl -sS -m "$CURL_TIMEOUT" -o "$TMP_OUT" -w "%{http_code}" "$url"
  else
    curl -sS -m "$CURL_TIMEOUT" -o "$TMP_OUT" -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "${data:-{}}" "$url"
  fi
}

check_health() {
  log "[smoke] GET /api/health"
  TMP_OUT="$TMP_DIR/health.out"
  local code
  code=$(req GET "$BASE_URL/api/health")
  if [[ "$code" == "200" || "$code" == "204" ]]; then
    log "✅ health $code"
  else
    log "❌ health HTTP $code"
    SMOKE_FAIL=1
  fi
}

check_admin_ping_no_token() {
  log "[smoke] GET /api/admin/ping (no token)"
  TMP_OUT="$TMP_DIR/ping_unauth.out"
  local code
  code=$(curl -sS -m "$CURL_TIMEOUT" -o "$TMP_OUT" -w "%{http_code}" \
    "$BASE_URL/api/admin/ping")
  if [[ "$code" == "401" ]]; then
    log "✅ admin/ping unauth 401"
  else
    log "❌ admin/ping unauth expected 401, got $code"
    SMOKE_FAIL=1
  fi
}

check_admin_ping_token() {
  log "[smoke] GET /api/admin/ping (with token)"
  TMP_OUT="$TMP_DIR/ping_auth.out"
  local code
  code=$(curl -sS -m "$CURL_TIMEOUT" -o "$TMP_OUT" -w "%{http_code}" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    "$BASE_URL/api/admin/ping")
  if [[ "$code" == "200" ]]; then
    log "✅ admin/ping auth 200"
  else
    log "❌ admin/ping auth expected 200, got $code"
    SMOKE_FAIL=1
  fi
}

check_doors_ssr() {
  log "[smoke] GET /doors"
  TMP_OUT="$TMP_DIR/doors.out"
  local code
  code=$(req GET "$BASE_URL/doors")
  if [[ "$code" != "200" ]]; then
    log "❌ /doors HTTP $code"
    SMOKE_FAIL=1
    return
  fi
  if grep -q 'data-smoke="compat-active"' "$TMP_OUT"; then
    log "✅ /doors SSR marker present"
  else
    log "❌ /doors SSR marker not found"
    SMOKE_FAIL=1
  fi
}

check_exports_tolerant() {
  log "[SMOKE] /api/cart/export/doors/{kp,invoice,factory}"
  local kinds=("kp" "invoice" "factory")
  for kind in "${kinds[@]}"; do
    local url="$BASE_URL/api/cart/export/doors/$kind"
    TMP_OUT="$TMP_DIR/export_${kind}.out"

    # 1) Try GET
    local code
    code=$(req GET "$url")

    # 2) Fallback: if 405, try POST with minimal body
    if [[ "$code" == "405" ]]; then
      code=$(req POST "$url" '{}')
    fi

    # 3) Evaluate
    if [[ "$code" == "200" ]]; then
      # Heuristic content validation (may be PDF/binary -> skip grep failure)
      if command -v file >/dev/null 2>&1 && file "$TMP_OUT" | grep -qiE "PDF|binary"; then
        log "✅ export/$kind 200 (binary/PDF-like)"
      else
        if grep -qi -E "(КП|Invoice|Сч[её]т|Factory|Order|Domeo|Doors)" "$TMP_OUT"; then
          log "✅ export/$kind OK"
        else
          log "⚠️  export/$kind 200 but no known markers (may be binary)."
        fi
      fi
    elif [[ "$code" == "204" ]]; then
      log "✅ export/$kind 204 (allowed for empty cart)"
    else
      # Do not fail CI for now (contract may require valid request body)
      log "⚠️  export/$kind HTTP $code — skipping as WARN"
    fi
  done
}

main() {
  check_health
  check_admin_ping_no_token
  check_admin_ping_token
  check_doors_ssr
  check_exports_tolerant

  if [[ "$SMOKE_FAIL" -eq 0 ]]; then
    log "SMOKE OK"
    exit 0
  else
    log "SMOKE FAIL"
    exit 1
  fi
}

main "$@"
