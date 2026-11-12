/**
 * ProductHub Comprehensive Technical Audit Script
 * Performs live HTTP requests against all endpoints, verifies frontend assets,
 * tests full CRUD lifecycle, validation errors, and edge cases.
 */

process.env.NODE_ENV = 'test'; // Prevent server.js from auto-listening
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/database');

const PORT = 5099;

// Helper to make HTTP requests
const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

const runAudit = async () => {
  console.log('====================================================');
  console.log('🔍 INITIATING COMPLETE TECHNICAL AUDIT OF PRODUCTHUB');
  console.log('====================================================\n');

  const auditResults = [];
  const logStep = (id, name, pass, details = '') => {
    const symbol = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} [${id}] ${name} ${details ? '- ' + details : ''}`);
    auditResults.push({ id, name, pass, details });
  };

  let serverInstance;
  let testMongoServer;
  try {
    const connected = await connectDB();
    serverInstance = await new Promise((resolve) => {
      const s = app.listen(PORT, '127.0.0.1', () => {
        console.log(`🚀 Audit Server running on http://127.0.0.1:${PORT}\n`);
        resolve(s);
      });
    });

    if (!connected) {
      console.log('⚠️ MongoDB Atlas is currently offline or client IP is not whitelisted.');
      console.log('👉 Verifying Disconnected (HTTP 503) fail-safe behavior before running full CRUD audit...\n');

      const offlineHealth = await request('GET', '/api/health');
      logStep('AUDIT-00A', 'Health check API returns Disconnected status (HTTP 503) when Atlas is unreachable', offlineHealth.status === 503 && offlineHealth.body.database.status === 'Disconnected');

      const offlineStats = await request('GET', '/api/dashboard/stats');
      logStep('AUDIT-00B', 'Dashboard stats returns HTTP 503 Service Unavailable when Atlas is unreachable', offlineStats.status === 503 && offlineStats.body.success === false);

      // Initialize isolated database sandbox to audit all remaining CRUD, validation, and search rules
      const { MongoMemoryServer } = require('mongodb-memory-server');
      testMongoServer = await MongoMemoryServer.create();
      await mongoose.connect(testMongoServer.getUri());
      const Product = require('../models/Product');
      await Product.init();
      const sampleProducts = require('../docs/sample-products.json');
      await Product.insertMany(sampleProducts);
      console.log('📦 Audit sandbox seeded with sample products.\n');
    }
  } catch (err) {
    console.error('Fatal: Could not initialize server for audit:', err.message);
    process.exit(1);
  }

  try {
    // 1. Frontend Static Assets
    const homeRes = await request('GET', '/');
    logStep('AUDIT-01', 'Frontend index.html loads with HTTP 200', homeRes.status === 200 && typeof homeRes.body === 'string' && homeRes.body.includes('ProductHub'));

    const cssRes = await request('GET', '/css/style.css');
    logStep('AUDIT-02', 'CSS stylesheet loads with HTTP 200', cssRes.status === 200 && typeof cssRes.body === 'string' && cssRes.body.includes('--primary-color'));

    const jsRes = await request('GET', '/js/app.js');
    logStep('AUDIT-03', 'Client JavaScript bundle loads with HTTP 200', jsRes.status === 200 && typeof jsRes.body === 'string' && jsRes.body.includes('navigateTo'));

    // 2. System Health API
    const healthRes = await request('GET', '/api/health');
    logStep('AUDIT-04', 'Health check API returns Connected state', healthRes.status === 200 && healthRes.body.database.status === 'Connected', `Database Status: ${healthRes.body.database.status}`);

    // 3. Dashboard Statistics API
    const statsRes = await request('GET', '/api/dashboard/stats');
    logStep('AUDIT-05', 'Dashboard stats returns valid aggregations', statsRes.status === 200 && statsRes.body.data.totalProducts > 0, `Total Products: ${statsRes.body.data.totalProducts}, Avg Price: ₹${statsRes.body.data.avgPrice}`);

    // 4. Product Catalogue Retrieval & Pagination
    const catRes = await request('GET', '/api/products?page=1&limit=6');
    logStep('AUDIT-06', 'Product catalogue pagination works', catRes.status === 200 && catRes.body.data.length === 6 && catRes.body.currentPage === 1, `Items returned: ${catRes.body.data.length}`);

    // 5. Category Filtering
    const filterRes = await request('GET', '/api/products?category=Laptops');
    const allLaptops = filterRes.body.data.every(p => p.category.toLowerCase() === 'laptops');
    logStep('AUDIT-07', 'Catalogue category filtering restricts results', filterRes.status === 200 && allLaptops && filterRes.body.data.length > 0, `Found ${filterRes.body.data.length} Laptops`);

    // 6. Price Sorting
    const sortRes = await request('GET', '/api/products?sort=price-asc');
    let pricesAscending = true;
    for (let i = 0; i < sortRes.body.data.length - 1; i++) {
      if (sortRes.body.data[i].price > sortRes.body.data[i + 1].price) {
        pricesAscending = false;
        break;
      }
    }
    logStep('AUDIT-08', 'Price sorting (price-asc) orders properly', sortRes.status === 200 && pricesAscending);

    // 7. Search Operation
    const searchRes = await request('GET', '/api/products/search?q=Dell');
    const matchesDell = searchRes.body.data.some(p => p.brand.toLowerCase() === 'dell' || p.name.toLowerCase().includes('dell'));
    logStep('AUDIT-09', 'Search endpoint retrieves matching documents', searchRes.status === 200 && matchesDell, `Found ${searchRes.body.data.length} matches`);

    // 8. Safe Regex Handling in Search
    const regexSafeRes = await request('GET', '/api/products/search?q=test(group)[bracket]+');
    logStep('AUDIT-10', 'Special regex characters in search query do not crash server', regexSafeRes.status === 200);

    // 9. CREATE Product (POST /api/products)
    const newProductPayload = {
      productId: 'AUDIT999',
      name: 'Audit Benchmark Workstation',
      brand: 'TitaniumCorp',
      category: 'Electronics',
      price: 89999,
      description: 'Engineered specifically for verification testing',
      stock: 7,
      specifications: {
        ram: '64GB ECC',
        storage: '2TB NVMe',
        processor: 'AMD Threadripper 7960X'
      }
    };
    const createRes = await request('POST', '/api/products', newProductPayload);
    logStep('AUDIT-11', 'Create product creates document with nested specs', createRes.status === 201 && createRes.body.data.productId === 'AUDIT999' && createRes.body.data.specifications.ram === '64GB ECC');

    // 10. Validation - Duplicate ID Rejection
    const dupRes = await request('POST', '/api/products', newProductPayload);
    logStep('AUDIT-12', 'Duplicate productId returns HTTP 409 Conflict', dupRes.status === 409 && dupRes.body.error === 'Duplicate Product ID');

    // 11. Validation - Negative Price Rejection
    const negPriceRes = await request('POST', '/api/products', { ...newProductPayload, productId: 'AUDIT888', price: -500 });
    logStep('AUDIT-13', 'Negative price returns HTTP 400 Bad Request', negPriceRes.status === 400 && negPriceRes.body.error === 'Invalid Price');

    // 12. READ Single Product (GET /api/products/:id)
    const getSingleRes = await request('GET', '/api/products/AUDIT999');
    logStep('AUDIT-14', 'Retrieve single product by custom productId', getSingleRes.status === 200 && getSingleRes.body.data.productId === 'AUDIT999');

    // 13. UPDATE Product (PUT /api/products/:id)
    const updateRes = await request('PUT', '/api/products/AUDIT999', {
      name: 'Audit Benchmark Workstation Gen 2',
      price: 94999,
      specifications: { ram: '128GB ECC', storage: '4TB NVMe', processor: 'AMD Threadripper 7980X' }
    });
    logStep('AUDIT-15', 'Update product modifies price and nested specifications', updateRes.status === 200 && updateRes.body.data.price === 94999 && updateRes.body.data.specifications.ram === '128GB ECC');

    // 14. DELETE Product (DELETE /api/products/:id)
    const deleteRes = await request('DELETE', '/api/products/AUDIT999');
    logStep('AUDIT-16', 'Delete product returns HTTP 200 and removes document', deleteRes.status === 200 && deleteRes.body.success === true);

    // 15. Verify Deletion
    const verifyDelRes = await request('GET', '/api/products/AUDIT999');
    logStep('AUDIT-17', 'Subsequent GET for deleted product returns HTTP 404', verifyDelRes.status === 404);

    // 16. Centralized Error Handler
    const notFoundRes = await request('GET', '/api/nonexistent-route-xyz');
    logStep('AUDIT-18', 'Centralized error handler returns clean JSON 404 for missing routes', notFoundRes.status === 404 && notFoundRes.body.error === 'Not Found');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    if (testMongoServer) {
      await mongoose.disconnect();
      await testMongoServer.stop();
    } else {
      await disconnectDB();
    }

    const passedCount = auditResults.filter(r => r.pass).length;
    const totalCount = auditResults.length;
    console.log('\n====================================================');
    console.log(`📊 TECHNICAL AUDIT SUMMARY: ${passedCount}/${totalCount} TESTS PASSED (${Math.round(passedCount/totalCount*100)}%)`);
    console.log('====================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  }
};

runAudit();
