const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sijawi';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

async function tryConnect() {
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      console.log(`[wait-for-mongo] Attempt ${i}/${MAX_RETRIES}...`);
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      // Verify with ping
      await mongoose.connection.db.admin().ping();
      await mongoose.disconnect();
      console.log('[wait-for-mongo] ✅ MongoDB ready.');
      return true;
    } catch (err) {
      if (i < MAX_RETRIES) {
        console.log(`[wait-for-mongo] Not ready, retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      } else {
        console.error('[wait-for-mongo] ❌ MongoDB not reachable after max retries.');
        return false;
      }
    }
  }
}

tryConnect().then((success) => {
  process.exit(success ? 0 : 1);
});