/**
 * ProductHub – Database Connectivity Verification Script
 * Validates connection to MongoDB Atlas, verifies latency, document count,
 * and prints masked configuration without exposing credentials.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Mask credentials in connection string
const maskUri = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/\/\/(.*):(.*)@/, '//$1:********@');
  } catch (e) {
    return '[Protected URI]';
  }
};

const verifyDatabase = async () => {
  console.log('====================================================');
  console.log('🔍 PRODUCTHUB DATABASE CONNECTIVITY VERIFICATION');
  console.log('====================================================\n');

  const uri = process.env.MONGODB_URI;
  const isPlaceholder = !uri || uri.includes('cluster0.abcde.mongodb.net') || uri.includes('<username>');

  console.log(`📌 Environment Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 Configured URI:      ${maskUri(uri)}`);

  if (!uri) {
    console.error('\n❌ ERROR: MONGODB_URI is not defined in .env.');
    console.error('👉 Please configure your MongoDB Atlas connection string in .env.');
    process.exit(1);
  }

  if (isPlaceholder) {
    console.log('\n⚠️ NOTICE: MONGODB_URI contains placeholder values.');
    console.log('   Current URI appears to be a template: cluster0.abcde.mongodb.net');
    console.log('   A valid MongoDB Atlas URI is strictly required to connect.');
    console.log('\n👉 To verify a live MongoDB Atlas connection, paste your actual Atlas URI in .env and rerun:');
    console.log('   npm run verify:db\n');
    process.exit(1);
  }

  console.log('\n📡 Attempting secure TLS/SSL handshake with MongoDB Atlas...');
  console.log('   Target Database: product_catalogue_db');
  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'product_catalogue_db',
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    const latencyMs = Date.now() - startTime;
    console.log(`✅ MongoDB Atlas Connection Verified successfully in ${latencyMs}ms!`);

    // Verify database access and collection stats
    const adminDb = conn.connection.db.admin();
    const buildInfo = await adminDb.buildInfo();

    const Product = require('../models/Product');
    const docCount = await Product.countDocuments();
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('\n----------------------------------------------------');
    console.log('📊 ATLAS CLUSTER DIAGNOSTIC SUMMARY:');
    console.log('----------------------------------------------------');
    console.log(`   Cluster Host:       ${conn.connection.host}`);
    console.log(`   Database Name:      ${conn.connection.name}`);
    console.log(`   MongoDB Version:    v${buildInfo.version}`);
    console.log(`   Network Latency:    ${latencyMs}ms`);
    console.log(`   Collections in DB:  ${collectionNames.join(', ') || 'None (New DB)'}`);
    console.log(`   Products Count:     ${docCount} documents in collection 'products'`);
    console.log('----------------------------------------------------');
    console.log('\n🎉 VERIFICATION RESULT: PROVED CONNECTED TO MONGODB ATLAS CLOUD.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ MongoDB Atlas Connection Failed: ${error.message}`);
    console.error('\n🔧 TROUBLESHOOTING CHECKLIST:');
    console.error('   1. IP Whitelist: Have you added your current IP (or 0.0.0.0/0) in Atlas > Network Access?');
    console.error('   2. Credentials: Did you verify the username and password in Atlas > Database Access?');
    console.error('   3. URL Encoding: Does your password contain special characters like @, :, /? (Must be URL-encoded)');
    console.error('   4. DNS Resolution: Can your network resolve _mongodb._tcp SRV records?\n');
    process.exit(1);
  }
};

verifyDatabase();

