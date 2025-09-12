#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:3000}"
echo "[smoke] GET /api/health"
curl -fsS "$BASE_URL/api/health" >/dev/null
echo "[smoke] GET /api/catalog/doors/options"
curl -fsS "$BASE_URL/api/catalog/doors/options" >/dev/null
echo "[smoke] POST /api/price/doors"
curl -fsS -X POST "$BASE_URL/api/price/doors" -H "Content-Type: application/json" \
  -d '{"selection":{"model":"PG Base 1","finish":"Нанотекс","color":"Белый","type":"Распашная","width":800,"height":2000}}' >/dev/null
echo "[smoke] POST /api/cart/export/doors/kp"
curl -fsS -X POST "$BASE_URL/api/cart/export/doors/kp" -H "Content-Type: application/json" \
  -d '{"cart":{"items":[{"model":"PG Base 1","width":800,"height":2000,"qty":1,"unitPrice":21280}]}}' >/dev/null
echo "Smoke OK"
