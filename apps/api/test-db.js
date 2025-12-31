// apps/api/test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing in .env');

    await mongoose.connect(process.env.MONGO_URI); // no deprecated options
    console.log('✅ MongoDB connected successfully!');

    const admin = mongoose.connection.db.admin();
    const info = await admin.serverStatus();
    console.log('Server info:', { host: info.host, version: info.version });

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed: ', err.message || err);
    process.exit(1);
  }
}

test();
