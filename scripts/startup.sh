#!/bin/sh
set -e

echo "🚀 Starting WTMS application..."

# Tunggu MongoDB siap (retry logic)
echo "⏳ Waiting for MongoDB..."
node scripts/wait-for-mongo.js

echo "✅ MongoDB is ready. Starting Next.js..."

# Execute the passed command (default: npm run start)
exec npm run start