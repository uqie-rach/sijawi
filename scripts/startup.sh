#!/bin/sh
set -e

echo "🚀 Starting WTMS application..."

# Tunggu MongoDB
echo "⏳ Waiting for MongoDB..."
node scripts/wait-for-mongo.js
echo "✅ MongoDB is ready."

# Seed opsional: hanya jika RUN_SEED=true DAN database kosong
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 RUN_SEED=true — checking if database is empty..."
  IS_EMPTY=$(node -e "
    const mongoose = require('mongoose');
    (async () => {
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      const cols = await db.listCollections({ name: 'widyaswaras' }).toArray();
      if (cols.length === 0) { console.log('true'); }
      else {
        const count = await db.collection('widyaswaras').countDocuments();
        console.log(count === 0 ? 'true' : 'false');
      }
      await mongoose.disconnect();
    })().catch(() => { console.log('true'); });
  ")
  if [ "$IS_EMPTY" = "true" ]; then
    echo "🌱 Database is empty. Running seed..."
    npx tsx scripts/seed.ts
    echo "✅ Seed complete!"
  else
    echo "✅ Database already has data. Skipping seed."
  fi
fi

echo "🚀 Starting Next.js..."
exec npm run start