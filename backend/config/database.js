const mongoose = require('mongoose');

// Mask credentials in connection string for safe server logging
const maskUri = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/\/\/(.*):(.*)@/, '//$1:********@');
  } catch (e) {
    return '[Protected URI]';
  }
};

/**
 * Connect to dedicated ProductHub MongoDB Atlas Cluster
 * Database: product_catalogue_db
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not defined.');
    console.error('👉 Please configure MONGODB_URI in your .env file with your ProductHub MongoDB Atlas connection string.');
    return false;
  }

  const isPlaceholder = uri.includes('cluster0.abcde.mongodb.net') || uri.includes('<username>');
  if (isPlaceholder) {
    console.error('❌ MONGODB_URI contains unconfigured placeholder values.');
    console.error('👉 Please configure your actual ProductHub MongoDB Atlas connection string in .env.');
    return false;
  }

  try {
    console.log(`📡 Connecting to MongoDB Atlas: ${maskUri(uri)} (Database: product_catalogue_db)...`);

    const conn = await mongoose.connect(uri, {
      dbName: 'product_catalogue_db', // Explicitly enforce dedicated ProductHub database
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed: ${error.message}`);
    console.error('👉 Please verify your MongoDB Atlas cluster URI, username, password, and IP whitelist in Atlas Network Access.');
    return false;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB Atlas connection closed.');
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
