#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

say() { echo "[smoke] $*"; }

# 1) API: health
say "GET /api/health"
code=$(curl -sS -m 10 -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [[ "$code" != "200" && "$code" != "204" ]]; then
  echo "Expected 200/204, got $code"; exit 1
fi

# 2) Admin endpoint: без токена должен вернуть 401
say "GET /api/admin/ping (no token)"
code=$(curl -sS -m 10 -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/ping")
if [[ "$code" != "401" ]]; then
  echo "Expected 401, got $code"; exit 1
fi

# 2b) Admin endpoint: с токеном должен вернуть 200
say "GET /api/admin/ping (with token)"
code=$(curl -sS -m 10 -H "Authorization: Bearer test-smoke-token" -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/ping")
if [[ "$code" != "200" ]]; then
  echo "Expected 200 with Bearer, got $code"; exit 1
fi

# 3) UI: /doors содержит SSR-маркер
say "GET /doors"
body=$(curl -sS -L -m 10 "$BASE_URL/doors")
if ! echo "$body" | grep -q 'data-smoke="compat-active"'; then
  echo "Smoke marker not found on /doors"; exit 1
fi

say "SMOKE OK"
