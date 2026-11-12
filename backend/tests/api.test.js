const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
const { app } = require('../server');
const Product = require('../models/Product');

let mongoServer;

describe('ProductHub API & MongoDB Document Tests', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await Product.init(); // Ensure indexes like unique productId are created
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  // 1. Health check
  it('TC-00: GET /api/health should return system status and connected database state', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'Healthy');
    assert.equal(res.body.database.status, 'Connected');
  });

  // 2. Add valid product
  it('TC-01: POST /api/products - Add a valid product document', async () => {
    const newProduct = {
      productId: 'P1001',
      name: 'Dell Inspiron 15',
      brand: 'Dell',
      category: 'Laptops',
      price: 65000,
      description: 'High performance laptop for students and professionals',
      image: 'https://example.com/laptop.jpg',
      specifications: {
        ram: '16GB',
        storage: '512GB SSD',
        processor: 'Intel Core i5'
      },
      stock: 15
    };

    const res = await request(app)
      .post('/api/products')
      .send(newProduct);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.productId, 'P1001');
    assert.equal(res.body.data.specifications.ram, '16GB');
    assert.equal(res.body.data.specifications.storage, '512GB SSD');

    // Verify stored directly in MongoDB
    const inDb = await Product.findOne({ productId: 'P1001' });
    assert.ok(inDb);
    assert.equal(inDb.name, 'Dell Inspiron 15');
    assert.equal(inDb.price, 65000);
  });

  // 3. Add product with missing required fields
  it('TC-02: POST /api/products - Reject product with missing required fields', async () => {
    const invalidProduct = {
      productId: 'P1002',
      // missing name, brand, category, price
      description: 'Incomplete product'
    };

    const res = await request(app)
      .post('/api/products')
      .send(invalidProduct);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /mandatory fields/i);
  });

  // 4. Add duplicate product ID
  it('TC-03: POST /api/products - Reject duplicate productId', async () => {
    const item1 = {
      productId: 'P1001',
      name: 'Item One',
      brand: 'BrandA',
      category: 'Electronics',
      price: 1000,
      stock: 5
    };

    const item2 = {
      productId: 'P1001',
      name: 'Duplicate Item',
      brand: 'BrandB',
      category: 'Electronics',
      price: 2000,
      stock: 10
    };

    const res1 = await request(app).post('/api/products').send(item1);
    assert.equal(res1.status, 201);

    const res2 = await request(app).post('/api/products').send(item2);
    assert.equal(res2.status, 409);
    assert.equal(res2.body.success, false);
    assert.match(res2.body.message, /already exists/i);
  });

  // 5. Retrieve all products
  it('TC-04: GET /api/products - Retrieve all products from database', async () => {
    await Product.create([
      {
        productId: 'P1001',
        name: 'Dell Inspiron',
        brand: 'Dell',
        category: 'Laptops',
        price: 65000,
        stock: 10
      },
      {
        productId: 'P1002',
        name: 'MacBook Air',
        brand: 'Apple',
        category: 'Laptops',
        price: 99000,
        stock: 5
      }
    ]);

    const res = await request(app).get('/api/products');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.data.length, 2);
  });

  // 6. Search by product name
  it('TC-05: GET /api/products/search - Search by product name', async () => {
    await Product.create([
      { productId: 'P1001', name: 'MacBook Air M2', brand: 'Apple', category: 'Laptops', price: 99000, stock: 5 },
      { productId: 'P1002', name: 'Lenovo ThinkPad', brand: 'Lenovo', category: 'Laptops', price: 68000, stock: 8 }
    ]);

    const res = await request(app).get('/api/products/search?q=MacBook');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].name, 'MacBook Air M2');
  });

  // 7. Search by brand
  it('TC-06: GET /api/products/search - Search by brand', async () => {
    await Product.create([
      { productId: 'P1001', name: 'Galaxy S24', brand: 'Samsung', category: 'Smartphones', price: 129000, stock: 4 },
      { productId: 'P1002', name: 'iPhone 15', brand: 'Apple', category: 'Smartphones', price: 134000, stock: 6 }
    ]);

    const res = await request(app).get('/api/products/search?q=Samsung');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].brand, 'Samsung');
  });

  // 8. Search by product ID
  it('TC-07: GET /api/products/search - Search by product ID', async () => {
    await Product.create([
      { productId: 'P1001', name: 'Product One', brand: 'Brand1', category: 'General', price: 500, stock: 10 },
      { productId: 'P2002', name: 'Product Two', brand: 'Brand2', category: 'General', price: 800, stock: 12 }
    ]);

    const res = await request(app).get('/api/products/search?q=P2002');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].productId, 'P2002');
  });

  // 9. Update product details
  it('TC-08: PUT /api/products/:id - Update product details in MongoDB', async () => {
    const created = await Product.create({
      productId: 'P1001',
      name: 'Original Laptop',
      brand: 'Dell',
      category: 'Laptops',
      price: 50000,
      stock: 10,
      specifications: { ram: '8GB', storage: '256GB SSD', processor: 'Core i3' }
    });

    const updateData = {
      name: 'Updated Laptop Pro',
      price: 58000,
      specifications: { ram: '16GB', storage: '512GB SSD', processor: 'Core i5' }
    };

    const res = await request(app)
      .put(`/api/products/${created.productId}`)
      .send(updateData);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Updated Laptop Pro');
    assert.equal(res.body.data.price, 58000);
    assert.equal(res.body.data.specifications.ram, '16GB');

    // Confirm in DB
    const inDb = await Product.findById(created._id);
    assert.equal(inDb.name, 'Updated Laptop Pro');
    assert.equal(inDb.price, 58000);
  });

  // 10. Update nonexistent product
  it('TC-09: PUT /api/products/:id - Return 404 when updating nonexistent product', async () => {
    const res = await request(app)
      .put('/api/products/NONEXISTENT999')
      .send({ name: 'Phantom Product' });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });

  // 11. Delete existing product
  it('TC-10: DELETE /api/products/:id - Delete product from MongoDB', async () => {
    const created = await Product.create({
      productId: 'P9999',
      name: 'To Be Deleted',
      brand: 'TestBrand',
      category: 'Electronics',
      price: 1500,
      stock: 2
    });

    const res = await request(app).delete(`/api/products/${created.productId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /deleted successfully/i);

    // Verify deleted in DB
    const inDb = await Product.findById(created._id);
    assert.equal(inDb, null);
  });

  // 12. Delete nonexistent product
  it('TC-11: DELETE /api/products/:id - Return 404 when deleting nonexistent product', async () => {
    const res = await request(app).delete('/api/products/DOESNOTEXIST');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // 13. Dashboard statistics aggregation
  it('TC-12: GET /api/dashboard/stats - Calculate MongoDB aggregation statistics accurately', async () => {
    await Product.create([
      { productId: 'P1001', name: 'Item 1', brand: 'BrandA', category: 'Laptops', price: 50000, stock: 10 },
      { productId: 'P1002', name: 'Item 2', brand: 'BrandA', category: 'Smartphones', price: 30000, stock: 5 },
      { productId: 'P1003', name: 'Item 3', brand: 'BrandB', category: 'Laptops', price: 70000, stock: 20 }
    ]);

    const res = await request(app).get('/api/dashboard/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.totalProducts, 3);
    assert.equal(res.body.data.totalBrands, 2);
    assert.equal(res.body.data.totalCategories, 2);
    assert.equal(res.body.data.avgPrice, 50000); // (50000+30000+70000)/3
    assert.equal(res.body.data.totalStock, 35);
  });

  // 14. Edge Case: Search with special regex characters
  it('TC-13: GET /api/products/search - Safely handle special regex characters without 500 crash', async () => {
    await Product.create({
      productId: 'P1010',
      name: 'iPhone 15 Pro (Titanium)',
      brand: 'Apple',
      category: 'Smartphones',
      price: 130000,
      stock: 5
    });

    // Query containing regex special characters: ( ) [ ] + * ?
    const res = await request(app).get('/api/products/search?q=Pro+(Titanium)');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
  });

  // 15. Validation Rule: Negative price rejection
  it('TC-14: POST /api/products - Reject negative price values', async () => {
    const invalidProduct = {
      productId: 'P9001',
      name: 'Invalid Price Product',
      brand: 'BrandX',
      category: 'Electronics',
      price: -500,
      stock: 10
    };

    const res = await request(app).post('/api/products').send(invalidProduct);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /positive number/i);
  });

  // 16. Validation Rule: Invalid product ID format rejection
  it('TC-15: POST /api/products - Reject invalid Product ID format with special symbols or spaces', async () => {
    const invalidProduct = {
      productId: 'P 1001@#$',
      name: 'Invalid ID Product',
      brand: 'BrandX',
      category: 'Electronics',
      price: 500,
      stock: 10
    };

    const res = await request(app).post('/api/products').send(invalidProduct);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /letters, numbers, hyphens/i);
  });

  // 17. Edge Case: Non-numeric pagination parameters
  it('TC-16: GET /api/products - Gracefully sanitize invalid non-numeric page and limit parameters', async () => {
    await Product.create({
      productId: 'P1001',
      name: 'Test Item',
      brand: 'TestBrand',
      category: 'General',
      price: 100,
      stock: 1
    });

    const res = await request(app).get('/api/products?page=invalid&limit=notanumber');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.currentPage, 1);
  });
});
