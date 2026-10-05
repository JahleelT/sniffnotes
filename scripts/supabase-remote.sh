#!/bin/sh
# Runs a Supabase CLI command against the hosted database in .env.local.
# Usage: sh scripts/supabase-remote.sh db push
set -e
set -a
. ./.env.local
set +a
exec npx supabase "$@" --db-url "$SUPABASE_DB_URL"
