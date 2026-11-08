#!/usr/bin/env bash
# Regenerate db/init/01-schema.sql from the TypeORM entities.
# Needs a MySQL 8 server and an EMPTY database you can throw away:
#   DB_HOST=127.0.0.1 DB_USERNAME=root DB_PASSWORD=... DB_DATABASE=schema_gen ./db/dump-schema.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build >/dev/null
# boot once with synchronize=true so TypeORM creates every table, then stop
DB_SYNCHRONIZE=true PORT=${PORT:-3999} MQTT_HOST=${MQTT_HOST:-127.0.0.1} timeout 25 node dist/src/main >/dev/null 2>&1 || true
{
  echo "-- Clean schema generated from the TypeORM entities by db/dump-schema.sh"
  echo "-- (synchronize against an empty MySQL 8 database, then mysqldump --no-data)."
  echo "-- Runs automatically on the first 'docker compose up' via docker-entrypoint-initdb.d."
  echo "SET NAMES utf8mb4;"
  echo "SET FOREIGN_KEY_CHECKS = 0;"
  mysqldump -h "$DB_HOST" -u "$DB_USERNAME" ${DB_PASSWORD:+-p"$DB_PASSWORD"} --no-data --no-tablespaces --skip-comments --skip-add-drop-table "$DB_DATABASE" \
    | sed 's/ AUTO_INCREMENT=[0-9]*//' \
    | grep -v '^/\*!\|^--\|^$' \
    | sed 's/^) ENGINE=InnoDB.*$/) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;/'
  echo "SET FOREIGN_KEY_CHECKS = 1;"
} > db/init/01-schema.sql
echo "wrote db/init/01-schema.sql"
