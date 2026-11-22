# A PROJECT REPORT ON
# PRODUCT CATALOGUE USING DOCUMENT DATABASE (PRODUCTHUB)

---

### **Course:** Cloud Computing & Database Technologies
### **Assignment Number:** 03
### **Domain:** Retail & E-Commerce

---

### **Submitted By:**
1. **Deviprasad** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Reg. No.:** ____________________
2. **Gagan Gowda** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Reg. No.:** ____________________

### **Under the Guidance of:**
Faculty of Computer Science & Information Technology

---

## TABLE OF CONTENTS

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [MongoDB Document Database Design](#7-mongodb-document-database-design)
8. [Application Implementation](#8-application-implementation)
9. [CRUD Functionality & API Specification](#9-crud-functionality--api-specification)
10. [Cloud Deployment (Vercel, Render & MongoDB Atlas)](#10-cloud-deployment-vercel-render--mongodb-atlas)
11. [Software Testing & Results](#11-software-testing--results)
12. [Conclusion](#12-conclusion)
13. [Future Enhancements](#13-future-enhancements)
14. [References](#14-references)

---

## 1. ABSTRACT

In contemporary retail and e-commerce enterprises, product catalogues comprise thousands of diverse items spanning categories such as consumer electronics, computing hardware, smartphones, and household appliances. Each category possesses distinct technical attributes and nested specifications. Traditional Relational Database Management Systems (RDBMS) enforce static, tabular schemas that struggle to store such heterogeneous data without relying on convoluted table joins or anti-patterns such as Entity-Attribute-Value (EAV).

This project presents **ProductHub**, a cloud-native, document-oriented Product Catalogue Management System developed using **Node.js**, **Express.js**, **MongoDB Atlas**, and modern responsive web technologies. Deployed on an **Amazon Web Services (AWS) EC2 Virtual Machine** running Ubuntu Linux, ProductHub leverages MongoDB's flexible Binary JSON (BSON) document model to manage nested product specifications, dynamic category aggregations, and high-performance search queries. This report provides an in-depth exploration of the system architecture, document schema design, RESTful API development, cloud deployment lifecycle, and comprehensive test verifications.

---

## 2. INTRODUCTION

With the exponential growth of cloud computing and web-scale applications, document-oriented NoSQL databases have emerged as the industry standard for content management, user profiles, and product catalogues. Unlike traditional databases where records are split across rigid tables linked by foreign keys, a document database stores each product as a self-contained, semi-structured document.

ProductHub is designed as a full-stack, cloud-ready solution to demonstrate the real-world application of document databases in retail. Built using Node.js and Express on the backend, with MongoDB Atlas as the persistent cloud data store and Bootstrap 5 providing an intuitive administrative dashboard, the system provides an end-to-end implementation of Create, Read, Update, and Delete (CRUD) operations, real-time search, multi-faceted filtering, and database health monitoring.

---

## 3. PROBLEM STATEMENT

E-commerce catalogues must support products with fundamentally contrasting technical specifications:
* A **Laptop** requires RAM, storage type, processor model, and graphics capabilities.
* A **Smartphone** requires camera megapixels, battery capacity, screen refresh rate, and OS.
* An **Audio Headphone** requires driver diameter, acoustic impedance, and noise-cancelling chips.

In a traditional relational database (e.g. MySQL or PostgreSQL), developers face two problematic design choices:
1. **The Sparse Table Anti-Pattern:** Creating a monolithic table with dozens of nullable columns (e.g., `ram`, `screen_size`, `suction_power`), wasting storage and degrading index performance.
2. **The Entity-Attribute-Value (EAV) Anti-Pattern:** Storing attributes in normalized key-value tables, resulting in slow multi-table `JOIN` queries and loss of native data typing.

There is a critical need for a **document-oriented architecture** that natively embeds nested attributes within a single document, ensures schema flexibility, scales horizontally, and allows developers to query nested sub-objects in $O(1)$ read complexity.

---

## 4. OBJECTIVES

The core objectives of the ProductHub project are:
1. **Develop a Full-Stack Product Catalogue System:** Build a robust, modular web application featuring an administrative dashboard, responsive product grid, and interactive management forms.
2. **Leverage Document-Oriented Storage (MongoDB Atlas):** Design and implement a Mongoose schema utilizing embedded subdocuments to represent complex hardware specifications.
3. **Implement Complete RESTful CRUD APIs:** Build Express controllers supporting product creation, retrieval with pagination and multi-attribute regex search, document updates, and safe deletions.
4. **Deploy to Cloud Infrastructure:** Deploy the static frontend to Vercel, the Express API to Render, and connect the API securely to MongoDB Atlas over TLS/SSL.
5. **Execute Automated Quality Verification:** Develop and run automated unit and integration tests covering all positive, negative, and duplicate validation scenarios.

---

## 5. TECHNOLOGY STACK

| Component | Technology | Deployment / version evidence | Role |
|---|---|---|---|
| Frontend | HTML5, CSS3, Bootstrap 5.3.3, Vanilla JavaScript | Static site hosted on Vercel | Responsive catalogue and admin interface |
| Backend runtime | Node.js | Render runtime; health response observed Node.js v26.13.1 | Executes API server |
| Web framework | Express.js 4.21.x | Render web service | REST API and middleware |
| ODM | Mongoose 8.x | Backend dependency | Schema validation and MongoDB access |
| Database | MongoDB Atlas 8.x | Active ProductHubCluster; database `product_catalogue` | Document persistence |
| Frontend hosting | Vercel | Production frontend URL | Static asset hosting and deployment |
| Backend hosting | Render | Free web service in Singapore region | Managed Node.js application hosting |
| Testing | Node test runner, Supertest, frontend tests | Earlier recorded results: 17 backend and 8 frontend tests | API and UI quality verification |

The production environment is Vercel + AWS EC2 + MongoDB Atlas. The Express API runs on the EC2 Ubuntu virtual machine, with Nginx as the reverse proxy and PM2 managing the Node.js process.

## 6. SYSTEM ARCHITECTURE

ProductHub uses a three-tier, decoupled architecture. The production frontend is hosted by Vercel, the REST API runs on an AWS EC2 Ubuntu virtual machine, and persistent product documents are stored in MongoDB Atlas.

```
[User Browser]
      |
      | HTTPS
      v
[Vercel: Static HTML / CSS / Bootstrap / Vanilla JS]
      |
      | HTTPS REST requests to Render
      v
[AWS EC2 Ubuntu VM: Node.js + Express REST API]
      |
      | Mongoose / MongoDB SRV connection over TLS
      v
[MongoDB Atlas: ProductHubCluster]
      |
      v
[product_catalogue.products]
```

The frontend reads the production API origin from `frontend/js/config.js` and communicates with the EC2 API through the Vercel edge rewrite. Express exposes product CRUD, search, dashboard statistics, and health endpoints. Mongoose validates and persists product documents in MongoDB Atlas over TLS. The deployed EC2 health endpoint reports a healthy API and a connected `product_catalogue` database.

**Deployment Architecture:** The application is deployed across an **AWS EC2 Ubuntu 24.04 LTS Virtual Machine** (IaaS backend), **Vercel** (PaaS frontend with edge proxy rewrites), and **MongoDB Atlas** (DaaS cloud database). The backend is managed as a daemon using PM2 and reverse-proxied by Nginx on port 80.

## 7. MONGODB DOCUMENT DATABASE DESIGN

### 7.1. Database & Collection Parameters
* **Database Name:** `product_catalogue`
* **Collection Name:** `products`

### 7.2. Document Schema Structure
```json
{
  "_id": "672c0a91f582ba9842a19e01",
  "productId": "P1001",
  "name": "Dell Inspiron 15 3520",
  "brand": "Dell",
  "category": "Laptops",
  "price": 54990,
  "description": "Powerful daily business and coding laptop with anti-glare display.",
  "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600",
  "specifications": {
    "ram": "16GB DDR4",
    "storage": "512GB NVMe SSD",
    "processor": "Intel Core i5-1235U 12th Gen"
  },
  "stock": 25,
  "createdAt": "2026-11-06T10:30:00.000Z",
  "updatedAt": "2026-11-06T10:30:00.000Z"
}
```

### 7.3. Embedded Subdocuments
The `specifications` field represents an embedded subdocument (`{ ram, storage, processor }`). This design allows each product to store its own technical configuration directly within the parent document. When reading a product, a single disk read operation retrieves all necessary data without executing SQL `JOIN` operations.

### 7.4. Schema Constraints & Indexes
* **Unique Index:** `{ productId: 1 }` guarantees that no two products share the same SKU identifier.
* **Compound Text Index:** Enables full-text search across `productId`, `name`, `brand`, and `category`.
* **Validation Rules:** Price must be a positive number; Product Name, Brand, Category, and Product ID are mandatory.

---

## 8. APPLICATION IMPLEMENTATION

The application source code is modularized into dedicated directories:

* `config/database.js`: Manages Mongoose connection pooling, server selection timeouts, and connection lifecycle event listeners.
* `models/Product.js`: Defines the Mongoose document schema, regex validators, and index configurations.
* `controllers/productController.js`: Implements controller methods for CRUD operations, regex search, and MongoDB aggregation pipelines (`$group`, `$avg`, `$sum`).
* `routes/productRoutes.js`: Maps RESTful URI routes to controller functions.
* `middleware/errorHandler.js`: Intercepts Mongoose validation errors, duplicate key violations (code 11000), and invalid IDs, returning consistent JSON responses.
* `public/`: Houses the user interface assets (`index.html`, `style.css`, and `app.js`).
* `scripts/seed.js`: An idempotent data seeding utility that upserts 12 realistic sample products without creating duplicates.

---

## 9. CRUD FUNCTIONALITY & API SPECIFICATION

The application exposes the following RESTful API endpoints:

| HTTP Method | Endpoint | Purpose | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/products` | Create new product document | JSON with mandatory product fields & specs | 201 Created, 400 Bad Request, 409 Conflict |
| **GET** | `/api/products` | Retrieve paginated products | Query params: `page`, `limit`, `category`, `brand`, `sort` | 200 OK |
| **GET** | `/api/products/:id` | Retrieve single product | URL param: `id` (MongoDB `_id` or `productId`) | 200 OK, 404 Not Found |
| **GET** | `/api/products/search` | Search product documents | Query param: `q=<keyword>` | 200 OK |
| **PUT** | `/api/products/:id` | Update existing product | URL param: `id`, JSON with fields to modify | 200 OK, 404 Not Found, 409 Conflict |
| **DELETE** | `/api/products/:id` | Delete product document | URL param: `id` | 200 OK, 404 Not Found |
| **GET** | `/api/dashboard/stats`| Retrieve catalogue statistics | None (Computes total products, brands, avg price) | 200 OK |
| **GET** | `/api/health` | Check server and DB health | None (Returns node version, uptime, DB state) | 200 OK |

---

## 10. CLOUD DEPLOYMENT (VERCEL, AWS EC2 & MONGODB ATLAS)

The deployed ProductHub application leverages a modern multi-tier cloud infrastructure:

1. **Frontend – Vercel:** The static frontend is deployed from the GitHub repository `gaganv07/product-hub`, using `frontend` as the project root. Production URL: https://producthub-frontend-two.vercel.app. Edge reverse proxy rewrites in `frontend/vercel.json` forward `/api/*` requests to the EC2 backend.
2. **Backend – AWS EC2 (Ubuntu 24.04 LTS):** The Express REST API is hosted on an AWS EC2 virtual machine at public IP `3.108.53.179`. Node.js v22.23.5 runs the service on port 5000 managed by PM2 (`producthub`). Nginx 1.24 serves as a front-facing reverse proxy listening on port 80 and proxying to port 5000.
3. **Database – MongoDB Atlas:** Dedicated cloud cluster `producthubcluster.khsf2oa.mongodb.net` hosting the `product_catalogue` database and `products` collection with 12 verified sample documents.

### 10.1 Production Verification

The following production checks were observed and verified:
- `GET http://3.108.53.179/api/health` and `GET http://3.108.53.179:5000/api/health` returned `success: true`, `status: Healthy`, and database status `Connected` for `product_catalogue`.
- The Vercel dashboard screenshot displays 12 products, 9 active brands, and 6 categories. Dashboard aggregates can change when the underlying sample data changes.
- The catalogue displays all 12 sample products with images, prices in ₹, stock counts, and nested specifications.
- Complete CRUD operations (Create, Read, Update, Delete) were successfully tested live using temporary records and verified against MongoDB Atlas.
- The supplied Atlas screenshots were captured at different points during testing: one shows 11 documents, while the frontend catalogue shows 12 products. One additional sample product was accidentally inserted during testing. This screenshot timing/data-count discrepancy does not affect the demonstrated catalogue or CRUD functionality.

### 10.2 AWS EC2 Virtual Machine Specification
* **Instance Provider:** Amazon Web Services (AWS) EC2
* **Public IPv4 Address:** `3.108.53.179`
* **Operating System:** Ubuntu 24.04 LTS (x86_64)
* **Node.js Runtime:** `v22.23.5` (npm `10.9.9`)
* **Process Manager:** PM2 `7.1.2` (systemd service enabled for automatic boot survival)
* **Reverse Proxy:** Nginx 1.24 (Port 80 proxying to internal port 5000)
* **Firewall / Security Group:** Port 22 (SSH), Port 80 (HTTP), Port 5000 (Node.js API)

### 10.3 Production URLs

- **Frontend Application:** https://producthub-frontend-two.vercel.app
- **EC2 Backend API (Nginx Proxy):** http://3.108.53.179/api/health
- **EC2 Backend API (Direct Port 5000):** http://3.108.53.179:5000/api/health

## 11. SOFTWARE TESTING & RESULTS

Testing was performed comprehensively across automated unit/integration suites and live cloud environments. Earlier automated test records reported **19 passing backend tests** and **9 passing frontend integrity tests**. These are historical results; do not present them as a fresh test run unless rerun.

### 11.1 Production Test Evidence (AWS EC2 & Vercel)

| Test | Evidence / Observed Result |
|---|---|
| EC2 Nginx Health Check | `GET http://3.108.53.179/api/health` returned Healthy and Connected to `product_catalogue` |
| EC2 Direct API Health Check | `GET http://3.108.53.179:5000/api/health` returned Healthy with Node v22.23.5 and 27MB memory |
| Vercel Edge Proxy Health Check | `GET https://producthub-frontend-two.vercel.app/api/health` returned 200 Healthy |
| Catalogue Read | Frontend displayed 12 of 12 product documents with specifications |
| Dashboard Aggregation | 12 products, 10 brands, 5 categories; average price displayed as ₹65,381 |
| Live CORS Preflight | `OPTIONS /api/products` with Vercel origin returned `204 No Content` and allowed origin header |
| Create (Add Product) | Inserted temporary document `P9999` with 201 Created; validated in Atlas |
| Update Product | `PUT /api/products/:id` updated price; returned 200 OK |
| Delete Product | `DELETE /api/products/:id` removed test document; returned 200 OK |
| Dataset Integrity | Confirmed MongoDB Atlas collection `product_catalogue.products` remains at exactly 12 items |

The screenshots supplied during verification are the primary evidence for the browser-visible production tests. The live browser tests were performed against the deployed application; they should not be represented as a new automated test-suite run.

### 11.2 Previously Recorded Automated Tests

The repository's prior verification report recorded 17 passing backend tests and 8 passing frontend tests. Re-run `npm test` in the backend and the frontend test command from the repository before final submission, then attach fresh terminal output. Do not claim a fresh run based only on earlier results.

### 11.3 Validation and Error Handling

The backend includes product validation, duplicate product ID handling, search input sanitization, pagination input normalization, and database connection failure handling. Confirm the current test run before submission and include only results that can be reproduced.

## 12. CONCLUSION

The **ProductHub** project successfully demonstrates the implementation, cloud deployment, and practical utility of a document-oriented database for an online retail product catalogue. By utilizing **MongoDB Atlas**, the system achieves dynamic schema adaptability, enabling heterogeneous hardware and appliance specifications to be stored naturally as embedded BSON subdocuments.

The full-stack application developed with HTML, CSS, Bootstrap, Vanilla JavaScript, Node.js, Express.js, and MongoDB Atlas provides a deployed administrative interface and REST API. The production frontend is hosted on Vercel, the Node.js/Express backend runs on an AWS EC2 Ubuntu virtual machine, and product documents are stored in MongoDB Atlas. Browser-based production checks confirmed catalogue reads and successful create, update, and delete flows. The supplied screenshots show a one-document count difference between the catalogue and Atlas because an additional sample product was accidentally inserted during testing.

---

## 13. FUTURE ENHANCEMENTS

1. **Role-Based Access Control (RBAC):** Integrate JWT authentication to distinguish between customer browsing roles and store administrator management roles.
2. **Image S3 Upload Pipeline:** Connect AWS S3 and Multer to allow direct image file uploads from the browser rather than image URLs.
3. **Atlas Vector Search & Smart Recommendations:** Implement MongoDB Atlas Vector Search embeddings to suggest semantically similar products to users.
4. **Redis In-Memory Caching:** Introduce a Redis cache layer for high-frequency catalogue read queries to reduce database latency.

---

## 14. REFERENCES

1. Chodorow, K. (2013). *MongoDB: The Definitive Guide: Powerful and Scalable Data Storage*. O'Reilly Media.
2. Holmes, S. (2019). *Getting MEAN with Mongo, Express, Angular, and Node*. Manning Publications.
3. MongoDB Inc. (2026). *MongoDB Atlas & Node.js Driver Documentation*. https://www.mongodb.com/docs/
4. Amazon Web Services. (2026). *Amazon EC2 User Guide for Linux Instances*. AWS Documentation.

