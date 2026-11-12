/**
 * ProductHub Frontend Automated Test Suite
 * Validates structure, asset linkage, DOM IDs, configuration mechanism,
 * and security constraints (no backend code, no secrets, no AI branding).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const FRONTEND_ROOT = path.resolve(__dirname, '..');

describe('ProductHub Frontend Integrity & Configuration Tests', () => {

  // 1. Structure Verification
  it('TC-F01: Essential frontend files must exist', () => {
    const requiredFiles = [
      'index.html',
      path.join('css', 'style.css'),
      path.join('js', 'config.js'),
      path.join('js', 'app.js'),
      'package.json',
      'README.md',
      path.join('docs', 'deployment-guide.md')
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(FRONTEND_ROOT, file);
      assert.ok(fs.existsSync(fullPath), `Missing required file: ${file}`);
    }
  });

  // 2. Strict Backend Exclusion
  it('TC-F02: Must NOT contain backend code, server files, models, or secrets', () => {
    const forbiddenPaths = [
      'server.js',
      path.join('config', 'database.js'),
      'models',
      'controllers',
      'routes',
      'middleware',
      '.env',
      '.env.example'
    ];

    for (const item of forbiddenPaths) {
      const fullPath = path.join(FRONTEND_ROOT, item);
      assert.ok(!fs.existsSync(fullPath), `Backend asset should NOT be present: ${item}`);
    }
  });

  // 3. Configuration Module Validation
  it('TC-F03: config.js must define CONFIG with documented API_BASE_URL placeholder', () => {
    const configPath = path.join(FRONTEND_ROOT, 'js', 'config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Test CommonJS export
    const CONFIG = require(configPath);
    assert.ok(CONFIG, 'CONFIG object must be defined');
    assert.equal(CONFIG.API_BASE_URL, 'BACKEND_API_PLACEHOLDER', 'Default API_BASE_URL must be BACKEND_API_PLACEHOLDER');
    assert.ok(configContent.includes('BACKEND_API_PLACEHOLDER'), 'config.js must document the placeholder');
    assert.ok(!configContent.includes('http://localhost:5000" as production'), 'Must not hardcode localhost as production address');
  });

  // 4. Client JS API Routing Validation
  it('TC-F04: app.js must route all API calls through getApiUrl() and CONFIG.API_BASE_URL', () => {
    const appPath = path.join(FRONTEND_ROOT, 'js', 'app.js');
    const appContent = fs.readFileSync(appPath, 'utf-8');

    assert.ok(appContent.includes('function getApiUrl('), 'app.js must define getApiUrl helper');
    assert.ok(appContent.includes('CONFIG.API_BASE_URL'), 'getApiUrl must reference CONFIG.API_BASE_URL');

    // Find all fetch calls in app.js
    const fetchMatches = appContent.match(/fetch\([^)]+\)/g) || [];
    assert.ok(fetchMatches.length >= 7, 'Must have at least 7 API fetch calls');

    for (const match of fetchMatches) {
      assert.ok(
        match.includes('getApiUrl('),
        `fetch call must use getApiUrl(): ${match}`
      );
    }
  });

  // 5. HTML Asset Linkage & Script Order
  it('TC-F05: index.html must load style.css, Bootstrap 5, config.js, and app.js in correct order', () => {
    const htmlPath = path.join(FRONTEND_ROOT, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(htmlContent.includes('href="css/style.css"'), 'Must link relative css/style.css');
    assert.ok(htmlContent.includes('cdn.jsdelivr.net/npm/bootstrap@5'), 'Must load Bootstrap 5 CDN');
    assert.ok(htmlContent.includes('src="js/config.js"'), 'Must load js/config.js');
    assert.ok(htmlContent.includes('src="js/app.js"'), 'Must load js/app.js');

    const configPos = htmlContent.indexOf('src="js/config.js"');
    const appPos = htmlContent.indexOf('src="js/app.js"');
    assert.ok(configPos > 0 && appPos > configPos, 'config.js must be loaded before app.js');
  });

  // 6. Required DOM Component IDs
  it('TC-F06: index.html must contain all functional DOM element IDs required by app.js', () => {
    const htmlPath = path.join(FRONTEND_ROOT, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    const requiredIds = [
      'nav-dashboard',
      'nav-catalogue',
      'nav-add-product',
      'nav-pulse-dot',
      'nav-db-label',
      'section-dashboard',
      'section-catalogue',
      'section-add-product',
      'banner-pulse-dot',
      'banner-db-status',
      'banner-db-details',
      'stat-total-products',
      'stat-total-brands',
      'stat-total-categories',
      'stat-avg-price',
      'products-grid',
      'catalogue-search-input',
      'catalogue-filter-category',
      'catalogue-filter-brand',
      'catalogue-sort',
      'add-product-form',
      'productDetailsModal',
      'editProductModal',
      'deleteConfirmModal',
      'healthModal'
    ];

    for (const id of requiredIds) {
      assert.ok(
        htmlContent.includes(`id="${id}"`),
        `DOM element with id="${id}" must exist in index.html`
      );
    }
  });

  // 7. Pulse Indicator CSS Styles
  it('TC-F07: style.css must define pulse-dot animations for connected, connecting, and disconnected states', () => {
    const cssPath = path.join(FRONTEND_ROOT, 'css', 'style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(cssContent.includes('.pulse-dot'), 'Must define .pulse-dot');
    assert.ok(cssContent.includes('.pulse-dot.connected'), 'Must define .pulse-dot.connected');
    assert.ok(cssContent.includes('.pulse-dot.connecting'), 'Must define .pulse-dot.connecting');
    assert.ok(cssContent.includes('.pulse-dot.disconnected'), 'Must define .pulse-dot.disconnected');
  });

  // 8. AI Branding Removal Verification
  it('TC-F08: Frontend code and documentation must contain NO AI branding or terminology', () => {
    const filesToCheck = [
      path.join(FRONTEND_ROOT, 'index.html'),
      path.join(FRONTEND_ROOT, 'css', 'style.css'),
      path.join(FRONTEND_ROOT, 'js', 'config.js'),
      path.join(FRONTEND_ROOT, 'js', 'app.js'),
      path.join(FRONTEND_ROOT, 'package.json'),
      path.join(FRONTEND_ROOT, 'README.md')
    ];

    const aiPattern = /\b(copilot|gemini|galaxy ai)\b/i;

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        const match = content.match(aiPattern);
        assert.ok(!match, `Found prohibited AI branding "${match ? match[0] : ''}" in ${file}`);
      }
    }
  });
});

