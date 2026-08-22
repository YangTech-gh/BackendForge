#!/usr/bin/env bash
set -euo pipefail

SUPABASE_URL="https://esrbdsfquckcexfbucvr.supabase.co"
PROJECT_REF="esrbdsfquckcexfbucvr"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

commit_and_push() {
  git add -A && git commit -m 'update' && git push
}

get_access_token() {
  if [[ -f "$HOME/.supabase/access-token" ]]; then
    cat "$HOME/.supabase/access-token"
  else
    echo ""
  fi
}

run_sql() {
  local SQL="$1"
  local TOKEN
  TOKEN=$(get_access_token)
  if [[ -z "$TOKEN" ]]; then
    echo "ERROR: No Supabase access token found at $HOME/.supabase/access-token"
    return 1
  fi

  local PAYLOAD
  PAYLOAD=$(printf '%s' "$SQL" | python3 -c "import json,sys; print(json.dumps({'query': sys.stdin.read()}))")

  local RESULT
  RESULT=$(curl -s -w "\n%{http_code}" -X POST \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" 2>&1)

  local HTTP_CODE
  HTTP_CODE=$(echo "$RESULT" | tail -1)
  local BODY
  BODY=$(echo "$RESULT" | sed '$d')

  if [[ "$HTTP_CODE" =~ ^(200|201|204)$ ]]; then
    return 0
  else
    echo "  SQL ERROR ($HTTP_CODE): $(echo "$BODY" | head -c 200)"
    return 1
  fi
}

seed_database() {
  echo "Seeding database via Management API..."
  local SQL_DIR="$SCRIPT_DIR/supabase"
  local FAILED=0

  if [[ ! -d "$SQL_DIR" ]]; then
    echo "  ERROR: SQL directory not found at $SQL_DIR"
    return 1
  fi

  # 1. Tracks
  if [[ -f "$SQL_DIR/seed-tracks.sql" ]]; then
    echo -n "  seed-tracks.sql... "
    if run_sql "$(cat "$SQL_DIR/seed-tracks.sql")"; then
      echo "OK"
    else
      FAILED=1
    fi
  fi

  # 2. Labs (each track file)
  if [[ -d "$SQL_DIR/seed-labs" ]]; then
    for f in "$SQL_DIR"/seed-labs/track-*.sql; do
      [[ ! -f "$f" ]] && continue
      local NAME
      NAME=$(basename "$f")
      echo -n "  $NAME... "
      if run_sql "$(cat "$f")"; then
        echo "OK"
      else
        FAILED=1
      fi
    done
  fi

  # 3. Starter kits
  if [[ -f "$SQL_DIR/seed-starter-kits.sql" ]]; then
    echo -n "  seed-starter-kits.sql... "
    if run_sql "$(cat "$SQL_DIR/seed-starter-kits.sql")"; then
      echo "OK"
    else
      FAILED=1
    fi
  fi

  # 4. Workshops
  if [[ -f "$SQL_DIR/seed-workshops.sql" ]]; then
    echo -n "  seed-workshops.sql... "
    if run_sql "$(cat "$SQL_DIR/seed-workshops.sql")"; then
      echo "OK"
    else
      FAILED=1
    fi
  fi

  # 5. Teardowns
  if [[ -f "$SQL_DIR/seed-teardowns.sql" ]]; then
    echo -n "  seed-teardowns.sql... "
    if run_sql "$(cat "$SQL_DIR/seed-teardowns.sql")"; then
      echo "OK"
    else
      FAILED=1
    fi
  fi

  return $FAILED
}

if [[ "${1:-}" == "-A" ]]; then
  echo "=== Deploying Supabase ==="

  echo "1/3: Pushing migrations..."
  npx supabase db push

  echo ""
  echo "2/3: Seeding data..."
  seed_database || true

  echo ""
  echo "3/3: Deploying edge functions..."
  npx supabase functions deploy

  echo ""
  echo "=== Deploy complete ==="
fi

commit_and_push
