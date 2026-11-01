#!/usr/bin/env bash
# Runs the SQL test suite.
#   - With DATABASE_URL set: runs against that database (e.g. `supabase start` local stack).
#   - Otherwise: spins up a throwaway Postgres 16 cluster with a Supabase auth shim.
set -euo pipefail
shopt -s nullglob
cd "$(dirname "$0")/.."

run_sql() { psql "$@" -X -q -v ON_ERROR_STOP=1; }

if [ -n "${DATABASE_URL:-}" ]; then
  CONN=("$DATABASE_URL")
else
  PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
  TMP=$(mktemp -d)
  chmod 777 "$TMP"
  AS_PG=()
  [ "$(id -u)" = 0 ] && AS_PG=(runuser -u postgres --)
  "${AS_PG[@]}" "$PGBIN/initdb" -D "$TMP/data" -E UTF8 --locale=C.UTF-8 -U postgres -A trust >/dev/null 2>&1
  "${AS_PG[@]}" "$PGBIN/pg_ctl" -D "$TMP/data" -o "-p 54329 -k $TMP -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null
  trap '"${AS_PG[@]}" "$PGBIN/pg_ctl" -D "$TMP/data" -m immediate stop >/dev/null; rm -rf "$TMP"' EXIT
  CONN=(-h "$TMP" -p 54329 -U postgres -d postgres)
  run_sql "${CONN[@]}" -f supabase/tests/shim.sql
  for f in supabase/migrations/*.sql; do run_sql "${CONN[@]}" -f "$f"; done
  [ -f supabase/seed.sql ] && run_sql "${CONN[@]}" -f supabase/seed.sql
fi

status=0
for t in supabase/tests/*.test.sql; do
  if run_sql "${CONN[@]}" -f "$t" > /tmp/latiniq-dbtest.out 2>&1; then
    echo "PASS $t"
  else
    echo "FAIL $t"; cat /tmp/latiniq-dbtest.out; status=1
  fi
done
exit $status
