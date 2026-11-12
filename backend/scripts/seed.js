const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/database');
const Product = require('../models/Product');

const seedData = async () => {
  console.log('🌱 Starting ProductHub database seeding process...');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Database connection failed. Aborting seeding.');
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'docs', 'sample-products.json'), 'utf-8');
    const products = JSON.parse(rawData);

    console.log(`📦 Loaded ${products.length} sample products from sample-products.json`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of products) {
      const result = await Product.updateOne(
        { productId: item.productId },
        { $set: item },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
        console.log(`➕ Added new product: [${item.productId}] ${item.name}`);
      } else if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`🔄 Updated existing product: [${item.productId}] ${item.name}`);
      } else {
        console.log(`ℹ️ Product already up to date: [${item.productId}] ${item.name}`);
      }
    }

    const totalInDb = await Product.countDocuments();
    console.log('\n====================================================');
    console.log(`🎉 Seeding completed successfully!`);
    console.log(`   - New Products Inserted: ${insertedCount}`);
    console.log(`   - Existing Products Updated: ${updatedCount}`);
    console.log(`   - Total Products in MongoDB Atlas: ${totalInDb}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedData();

