#!/bin/sh
set -e

# The uploads directory is normally a mounted volume, so it shows up owned by
# root at container start regardless of what the image set at build time.
# Fix that up before dropping to the unprivileged user.
mkdir -p /app/uploads
chown -R node:node /app/uploads

exec su-exec node "$@"
