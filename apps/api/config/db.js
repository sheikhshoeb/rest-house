// apps/api/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not found in env');
    await mongoose.connect(process.env.MONGO_URI); // no deprecated options
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    throw error;
  }
}

module.exports = connectDB;
