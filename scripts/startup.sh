#!/bin/sh
set -e

echo "🚀 WTMS Startup Script"
echo "========================"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until node -e "
  const mongoose = require('mongoose');
  mongoose.connect('${MONGODB_URI}', { serverSelectionTimeoutMS: 3000 })
    .then(() => { console.log('MongoDB is ready!'); process.exit(0); })
    .catch(() => { process.exit(1); });
" 2>/dev/null; do
  echo "   MongoDB not ready yet, retrying in 3s..."
  sleep 3
done

echo "✅ MongoDB is connected."

# Run seed if AUTO_SEED is true and database is empty
if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 Checking if database needs seeding..."
  
  # Check if widyaswaras collection is empty
  IS_EMPTY=$(node -e "
    const mongoose = require('mongoose');
    mongoose.connect('${MONGODB_URI}')
      .then(async () => {
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'widyaswaras' }).toArray();
        if (collections.length === 0) {
          console.log('true');
        } else {
          const count = await db.collection('widyaswaras').countDocuments();
          console.log(count === 0 ? 'true' : 'false');
        }
        process.exit(0);
      })
      .catch(() => { console.log('false'); process.exit(0); });
  ")

  if [ "$IS_EMPTY" = "true" ]; then
    echo "🌱 Database is empty, running seed script..."
    npx tsx scripts/seed.ts
    echo "✅ Seeding complete!"
  else
    echo "✅ Database already has data, skipping seed."
  fi
fi

echo "🚀 Starting Next.js server..."
exec npm start