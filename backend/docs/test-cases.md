# ProductHub – Software Testing Report & Technical Audit

## 1. Test Environment & Verification Summary

* **Testing Harness:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) & Supertest
* **Live Integration Auditor:** `scripts/audit.js` (End-to-End HTTP & Database Operations)
* **Database Engines Verified:** MongoDB Atlas Cloud Database (`product_catalogue`) & Test Sandbox
* **Date of Audit:** November 2026
* **Audited By:** Deviprasad & Gagan Gowda
* **Automated Unit & Integration Tests:** 17 Passed / 0 Failed (100% Pass Rate)
* **Live End-to-End HTTP Audit Tests:** 20 Passed / 0 Failed (100% Pass Rate)

---

## 2. Technical Audit Summary & Bugs Identified and Resolved

During the audit, the following vulnerabilities and edge-case bugs were discovered, remediated, and verified:

| Bug ID | Component | Defect Description | Resolution & Fix | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **BUG-01** | `controllers/productController.js` | Unescaped user search queries containing regex characters (e.g. `(`, `)`, `+`, `*`) caused `SyntaxError` and HTTP 500 server crashes. | Implemented `escapeRegex()` helper sanitizing all search strings before compiling regular expressions. | **RESOLVED & VERIFIED (TC-13 / AUDIT-10)** |
| **BUG-02** | `controllers/productController.js` | Non-numeric pagination query parameters (`page=abc`) evaluated to `NaN`, leading to `skip(NaN)` query crashes. | Added explicit `isNaN()` fallbacks defaulting invalid page/limit inputs to 1 and 12 respectively. | **RESOLVED & VERIFIED (TC-16 / AUDIT-06)** |
| **BUG-03** | `controllers/productController.js` | Product creation and update accepted negative price values and invalid Product ID formats. | Added strict input validation returning HTTP 400 with explicit descriptive messages for negative prices and non-compliant SKU formats. | **RESOLVED & VERIFIED (TC-14, TC-15 / AUDIT-13)** |
| **BUG-04** | `config/database.js` | Insecure connection fallback and potential connection buffering when Atlas was unreachable. | Enforced dedicated MongoDB Atlas database (`product_catalogue`) with safe HTTP 503 fail-safe states and credential-masked logging. | **RESOLVED & VERIFIED (AUDIT-00A, AUDIT-00B)** |

---

## 3. Automated Test Suite Execution Log (`npm test`)

```text
> producthub@1.0.0 test
> node --test tests/api.test.js

▶ ProductHub API & MongoDB Document Tests
  ✔ TC-00: GET /api/health should return system status and connected database state (75.6ms)
  ✔ TC-01: POST /api/products - Add a valid product document (114.9ms)
  ✔ TC-02: POST /api/products - Reject product with missing required fields (16.9ms)
  ✔ TC-03: POST /api/products - Reject duplicate productId (41.7ms)
  ✔ TC-04: GET /api/products - Retrieve all products from database (57.3ms)
  ✔ TC-05: GET /api/products/search - Search by product name (43.8ms)
  ✔ TC-06: GET /api/products/search - Search by brand (37.1ms)
  ✔ TC-07: GET /api/products/search - Search by product ID (40.1ms)
  ✔ TC-08: PUT /api/products/:id - Update product details in MongoDB (55.8ms)
  ✔ TC-09: PUT /api/products/:id - Return 404 when updating nonexistent product (22.5ms)
  ✔ TC-10: DELETE /api/products/:id - Delete product from MongoDB (38.7ms)
  ✔ TC-11: DELETE /api/products/:id - Return 404 when deleting nonexistent product (13.9ms)
  ✔ TC-12: GET /api/dashboard/stats - Calculate MongoDB aggregation statistics accurately (62.2ms)
  ✔ TC-13: GET /api/products/search - Safely handle special regex characters without 500 crash (35.0ms)
  ✔ TC-14: POST /api/products - Reject negative price values (18.2ms)
  ✔ TC-15: POST /api/products - Reject invalid Product ID format with special symbols or spaces (19.0ms)
  ✔ TC-16: GET /api/products - Gracefully sanitize invalid non-numeric page and limit parameters (47.0ms)
✔ 17 tests passed, 0 failed (100% pass rate)
```

---

## 4. Live End-to-End HTTP Audit Log (`node scripts/audit.js`)

```text
====================================================
🔍 INITIATING COMPLETE TECHNICAL AUDIT OF PRODUCTHUB
====================================================

✅ PASS [AUDIT-00A] Health check API returns Disconnected status (HTTP 503) when Atlas is unreachable 
✅ PASS [AUDIT-00B] Dashboard stats returns HTTP 503 Service Unavailable when Atlas is unreachable 
✅ PASS [AUDIT-01] Frontend index.html loads with HTTP 200 
✅ PASS [AUDIT-02] CSS stylesheet loads with HTTP 200 
✅ PASS [AUDIT-03] Client JavaScript bundle loads with HTTP 200 
✅ PASS [AUDIT-04] Health check API returns Connected state - Database Status: Connected
✅ PASS [AUDIT-05] Dashboard stats returns valid aggregations - Total Products: 12, Avg Price: ₹65381
✅ PASS [AUDIT-06] Product catalogue pagination works - Items returned: 6
✅ PASS [AUDIT-07] Catalogue category filtering restricts results - Found 3 Laptops
✅ PASS [AUDIT-08] Price sorting (price-asc) orders properly 
✅ PASS [AUDIT-09] Search endpoint retrieves matching documents - Found 1 matches
✅ PASS [AUDIT-10] Special regex characters in search query do not crash server 
✅ PASS [AUDIT-11] Create product creates document with nested specs 
✅ PASS [AUDIT-12] Duplicate productId returns HTTP 409 Conflict 
✅ PASS [AUDIT-13] Negative price returns HTTP 400 Bad Request 
✅ PASS [AUDIT-14] Retrieve single product by custom productId 
✅ PASS [AUDIT-15] Update product modifies price and nested specifications 
✅ PASS [AUDIT-16] Delete product returns HTTP 200 and removes document 
✅ PASS [AUDIT-17] Subsequent GET for deleted product returns HTTP 404 
✅ PASS [AUDIT-18] Centralized error handler returns clean JSON 404 for missing routes 

====================================================
📊 TECHNICAL AUDIT SUMMARY: 20/20 TESTS PASSED (100%)
====================================================
```

---

## 5. Detailed Test Cases Matrix

| Test Case ID | Test Description | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-00** | System Health & DB Connectivity | `GET /api/health` | HTTP 200, status: "Healthy", database.status: "Connected" | HTTP 200 returned with system uptime and connected DB state | **PASS** |
| **TC-01** | Add a valid product document | `POST /api/products` with valid payload (`productId: "P1001"`, `name: "Dell Inspiron 15"`, `price: 65000`, nested `specifications`) | HTTP 201 Created; document saved in MongoDB with nested specifications | HTTP 201 Created; document confirmed stored in collection | **PASS** |
| **TC-02** | Add product with missing required fields | `POST /api/products` missing `name`, `brand`, `category`, and `price` | HTTP 400 Bad Request; message indicates missing mandatory fields | HTTP 400 Bad Request with explicit validation message | **PASS** |
| **TC-03** | Prevent duplicate product ID | `POST /api/products` with existing `productId: "P1001"` | HTTP 409 Conflict; duplicate key error handled cleanly | HTTP 409 returned with message: "Duplicate value 'P1001' entered for productId" | **PASS** |
| **TC-04** | Retrieve all products | `GET /api/products` | HTTP 200 OK; array of product documents with pagination metadata | HTTP 200 with count, total pages, and product document array | **PASS** |
| **TC-05** | Search product by name | `GET /api/products/search?q=MacBook` | HTTP 200; returns array containing matching "MacBook Air M2" | HTTP 200; only MacBook product returned | **PASS** |
| **TC-06** | Search product by brand | `GET /api/products/search?q=Samsung` | HTTP 200; returns Samsung devices | HTTP 200; Samsung product returned | **PASS** |
| **TC-07** | Search product by product ID | `GET /api/products/search?q=P2002` | HTTP 200; retrieves exact document matching `P2002` | HTTP 200; exact product record retrieved | **PASS** |
| **TC-08** | Update product details | `PUT /api/products/P1001` with modified price (58000) and upgraded RAM | HTTP 200; modified values persisted in MongoDB document | HTTP 200; confirmed updated RAM and price in database | **PASS** |
| **TC-09** | Update nonexistent product | `PUT /api/products/NONEXISTENT999` | HTTP 404 Not Found; descriptive error message | HTTP 404 returned: "Product with ID 'NONEXISTENT999' was not found" | **PASS** |
| **TC-10** | Delete existing product | `DELETE /api/products/P9999` | HTTP 200 OK; document deleted from MongoDB collection | HTTP 200; subsequent query confirms document is null in database | **PASS** |
| **TC-11** | Delete nonexistent product | `DELETE /api/products/DOESNOTEXIST` | HTTP 404 Not Found | HTTP 404 returned | **PASS** |
| **TC-12** | Aggregate dashboard statistics | `GET /api/dashboard/stats` | HTTP 200; accurate total products, average price, brand/category counts | HTTP 200; mathematical calculations match database documents | **PASS** |
| **TC-13** | Regex Injection & Special Character Handling | `GET /api/products/search?q=Pro+(Titanium)` | HTTP 200 OK; sanitized query without 500 crash | HTTP 200; matching product retrieved without exception | **PASS** |
| **TC-14** | Negative Price Rejection | `POST /api/products` with `price: -500` | HTTP 400 Bad Request; message indicates price must be positive | HTTP 400 returned: "Price must be a valid positive number or zero" | **PASS** |
| **TC-15** | Product ID Format Validation | `POST /api/products` with `productId: "P 1001@#$"` | HTTP 400 Bad Request; alphanumeric constraint enforced | HTTP 400 returned: "Product ID can only contain letters, numbers, hyphens" | **PASS** |
| **TC-16** | Non-Numeric Pagination Sanitization | `GET /api/products?page=invalid&limit=notanumber` | HTTP 200 OK; fallback to page 1 and limit 12 | HTTP 200 returned with `currentPage: 1` | **PASS** |
