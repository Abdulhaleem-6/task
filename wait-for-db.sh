#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
port="$2"
shift 2

until nc -z -v -w30 "$host" "$port"; do
  echo "Waiting for MySQL database connection at ${host}:${port}..."
  # Check if MySQL container is running
  sleep 5
done

echo "MySQL database is up and running!"