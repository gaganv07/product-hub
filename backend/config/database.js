const dns = require('dns');
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

// Configure DNS resolver fallback when Node.js c-ares defaults to loopback only (common on Windows)
const ensureSrvDnsResolution = (uri) => {
  if (!uri || !uri.startsWith('mongodb+srv://')) return;
  try {
    const currentServers = dns.getServers();
    const onlyLoopback = currentServers.length > 0 && currentServers.every(
      (s) => s === '127.0.0.1' || s === '::1'
    );
    if (onlyLoopback) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('🌐 Configured DNS SRV fallback resolvers (8.8.8.8, 1.1.1.1) for MongoDB Atlas.');
    }
  } catch (err) {
    console.warn('⚠️ Unable to inspect/update DNS servers:', err.message);
  }
};

let listenersRegistered = false;
const registerConnectionEvents = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose event: connected to MongoDB Atlas (product_catalogue)');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose event: connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🟡 Mongoose event: disconnected from MongoDB Atlas');
  });
};

/**
 * Connect to dedicated ProductHub MongoDB Atlas Cluster
 * Database: product_catalogue
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

  registerConnectionEvents();
  ensureSrvDnsResolution(uri);

  try {
    console.log(`📡 Connecting to MongoDB Atlas: ${maskUri(uri)} (Database: product_catalogue)...`);

    const conn = await mongoose.connect(uri, {
      dbName: 'product_catalogue', // Explicitly enforce dedicated ProductHub database
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed: ${error.message}`);

    // Inspect underlying shard TLS/network errors for clearer diagnosis
    if (error.reason && error.reason.servers) {
      for (const [addr, desc] of error.reason.servers) {
        if (desc && desc.error && desc.error.message) {
          console.error(`   ↳ Shard ${addr}: ${desc.error.message}`);
          if (desc.error.message.includes('SSL alert number 80') || desc.error.message.includes('tlsv1 alert internal error')) {
            console.error('   👉 Diagnosis: TLS Alert 80 indicates the client public IP address is NOT whitelisted in MongoDB Atlas Network Access.');
          }
          break;
        }
      }
    }

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
