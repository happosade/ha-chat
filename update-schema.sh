#!/bin/bash

# Update Prisma and restart server
cd /Users/orasila/src/ha-chat

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Restarting the development server..."
# Kill any running dev server
pkill -f "next dev" || true

# Start the server in the background
npm run dev &

echo "Done! The application should now be running with the updated schema."
