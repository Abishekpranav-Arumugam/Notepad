// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // To access environment variables like MONGO_URI

const db = process.env.MONGO_URI; // Your MongoDB connection string

const connectDB = async () => {
  try {
    // Connect using Mongoose 6+ (no deprecated options needed)
    await mongoose.connect(db);

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;