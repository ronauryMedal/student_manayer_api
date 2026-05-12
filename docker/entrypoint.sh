#!/bin/sh
set -e
cd /app
echo "Applying Prisma migrations..."
npx prisma migrate deploy
exec node dist/src/main
