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
10. [Cloud Deployment (AWS EC2 & MongoDB Atlas)](#10-cloud-deployment-aws-ec2--mongodb-atlas)
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
4. **Deploy to AWS Cloud Infrastructure:** Configure an AWS EC2 Ubuntu Linux VM with Nginx reverse proxy and PM2 process management connected securely to MongoDB Atlas over TLS/SSL.
5. **Execute Automated Quality Verification:** Develop and run automated unit and integration tests covering all positive, negative, and duplicate validation scenarios.

---

## 5. TECHNOLOGY STACK

| Component | Technology | Version | Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | HTML5, CSS3, Bootstrap | 5.3.3 | Provides responsive mobile-first UI components, modal dialogues, and clean aesthetic. |
| **Client Scripting** | Vanilla JavaScript (ES6+) | Modern | Eliminates heavy framework dependencies; provides fast reactive previews and DOM manipulation. |
| **Backend Runtime** | Node.js | v20 / v22 / v24 | High-throughput asynchronous event-driven JavaScript engine ideal for I/O-intensive APIs. |
| **Web Framework** | Express.js | 4.21.x | Lightweight, unopinionated routing and middleware architecture for RESTful services. |
| **Database** | MongoDB Atlas | 7.x / 8.x | Managed cloud NoSQL document database offering automated failover, replication, and sharding. |
| **Object Data Modeling**| Mongoose | 8.9.x | Enforces schema validation, type casting, default values, and query middleware. |
| **Process Manager** | PM2 | Latest | Production process manager for Node.js ensuring continuous uptime, auto-restart, and log rotation. |
| **Web Server / Proxy** | Nginx | 1.18+ | High-performance reverse proxy handling port forwarding (80 &rarr; 5000) and SSL termination. |
| **Cloud Hosting** | AWS EC2 (Ubuntu 22.04 LTS)| t2.micro / t3.small | Industry-standard cloud virtual machine offering reliable compute and isolated security groups. |
| **Testing Harness** | Node Test Runner & Supertest | Built-in | Native, fast automated testing verifying HTTP response codes and database states. |

---

## 6. SYSTEM ARCHITECTURE

ProductHub uses a three-tier, decoupled architecture. The production frontend is hosted by Vercel, the REST API is hosted as a Node.js web service on Render, and persistent product documents are stored in MongoDB Atlas.

```
[User Browser]
      |
      | HTTPS
      v
[Vercel: Static HTML / CSS / Bootstrap / Vanilla JS]
      |
      | HTTPS REST requests to Render
      v
[Render: Node.js + Express REST API]
      |
      | Mongoose / MongoDB SRV connection over TLS
      v
[MongoDB Atlas: ProductHubCluster]
      |
      v
[product_catalogue.products]
```

The frontend reads the production API origin from `frontend/js/config.js`. Express exposes product CRUD, search, dashboard statistics, and health endpoints. Mongoose validates and persists product documents in Atlas. The deployed health endpoint reports a healthy API and a connected `product_catalogue` database.

**Deployment distinction:** AWS EC2 was not provisioned because AWS account registration remained incomplete. The running implementation uses Render for the backend and Vercel for the frontend. Do not describe the current deployment as EC2-hosted. If the course rubric explicitly requires a virtual machine, EC2 deployment remains a separate outstanding requirement.

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

## 10. CLOUD DEPLOYMENT (VERCEL, RENDER & MONGODB ATLAS)

The deployed ProductHub application uses three cloud services:

1. **Frontend – Vercel:** The static frontend is deployed from the GitHub repository `gaganv07/product-hub`, using `frontend` as the project root. Production URL: https://producthub-frontend-two.vercel.app
2. **Backend – Render:** The Express API is deployed as the Render web service `producthub-api`. Production URL: https://producthub-api-da3l.onrender.com. The service runs on Render's assigned port (observed as `10000`) and uses production environment variables configured in the Render dashboard.
3. **Database – MongoDB Atlas:** The Atlas project `ProductHub-Production` contains the active cluster `ProductHubCluster`. The application database is `product_catalogue` and the collection is `products`.

### 10.1 Production Verification

The following production checks were observed during deployment:
- The Render root endpoint returned the ProductHub Backend REST API running message.
- `GET /api/health` returned `success: true`, `status: Healthy`, and database status `Connected` for `product_catalogue`.
- The Vercel dashboard displayed 12 products, 10 active brands, and 5 categories.
- The catalogue displayed all 12 products.
- Frontend notifications confirmed successful update, delete, and re-add operations. The deleted Logitech sample product was restored and its description, image, and nested processor specification were corrected in Atlas.
- Atlas was queried after correction and the collection count was verified as 12.

### 10.2 EC2 Requirement Status

An AWS EC2 instance was **not created**. AWS account registration was not completed, so no EC2 public IP, SSH configuration, Ubuntu VM, Nginx, or PM2 deployment exists. The current Vercel + Render deployment is operational, but it does not satisfy a strict assignment requirement for an IaaS virtual machine. Confirm with the faculty whether managed cloud hosting is acceptable. If EC2 is mandatory, provision an Ubuntu instance and deploy the backend there before claiming that requirement is complete.

### 10.3 Production URLs

- Frontend: https://producthub-frontend-two.vercel.app
- Backend root: https://producthub-api-da3l.onrender.com
- Backend health: https://producthub-api-da3l.onrender.com/api/health

## 11. SOFTWARE TESTING & RESULTS

Testing was performed at multiple levels. Earlier project verification recorded 17 passing backend automated tests and 8 passing frontend tests. A prior live API CRUD verification also exercised create, retrieve, search, dashboard statistics, update, delete, and not-found behavior. The production deployment was subsequently checked through the public Render health endpoint and the Vercel interface.

### 11.1 Production Test Evidence

| Test | Evidence / observed result |
|---|---|
| API root | Render returned the ProductHub API running response |
| Database health | `/api/health` returned Healthy and Connected to `product_catalogue` |
| Catalogue read | Frontend displayed 12 of 12 product documents |
| Dashboard aggregation | 12 products, 10 brands, 5 categories; average price displayed as ₹65,381 |
| Update | Frontend success notification confirmed a product update |
| Delete | Frontend success notification and catalogue count decrease from 12 to 11 |
| Restore/create | Frontend success notification; count returned to 12 |
| Data correction | Atlas record `P1009` corrected; frontend showed restored description and image |

The screenshots supplied during verification are the primary evidence for the browser-visible production tests. The live browser tests were performed against the deployed application; they should not be represented as a new automated test-suite run.

### 11.2 Previously Recorded Automated Tests

The repository's prior verification report recorded 17 passing backend tests and 8 passing frontend tests. Re-run `npm test` in the backend and the frontend test command from the repository before final submission, then attach fresh terminal output. Do not claim a fresh run based only on earlier results.

### 11.3 Validation and Error Handling

The backend includes product validation, duplicate product ID handling, search input sanitization, pagination input normalization, and database connection failure handling. Confirm the current test run before submission and include only results that can be reproduced.

## 12. CONCLUSION

The **ProductHub** project successfully demonstrates the implementation, cloud deployment, and practical utility of a document-oriented database for an online retail product catalogue. By utilizing **MongoDB Atlas**, the system achieves dynamic schema adaptability, enabling heterogeneous hardware and appliance specifications to be stored naturally as embedded BSON subdocuments.

The full-stack application developed with HTML, CSS, Bootstrap, Vanilla JavaScript, Node.js, Express.js, and MongoDB Atlas provides a deployed administrative interface and REST API. Production hosting currently uses Vercel and Render. Browser-based production checks confirmed catalogue reads and successful create, update, and delete flows, with the sample dataset restored to 12 products. AWS EC2 deployment has not been completed and must not be claimed as part of the current deployment.

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

