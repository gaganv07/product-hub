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

ProductHub follows a 3-tier architectural model:

```
[ Web Browser (Client) ]
         │ (HTTP / HTTPS REST Requests)
         ▼
[ AWS EC2 Virtual Machine ]
   ├─ Nginx Reverse Proxy (Port 80)
   └─ Node.js + Express Server (Port 5000, Managed by PM2)
         │ (TLS 1.3 Encrypted Mongoose Connection)
         ▼
[ MongoDB Atlas Cloud Cluster ]
   └─ Database: product_catalogue_db (Collection: products)
```

### Architectural Highlights:
1. **Client Tier:** The single-page application interface interacts with backend endpoints asynchronously using the browser `fetch()` API. Live preview listeners update UI cards in real time as administrators input product details.
2. **Application Tier:** Express middleware intercepts requests for CORS, JSON body parsing, and request logging. Controllers encapsulate business logic and interact with Mongoose models.
3. **Data Tier:** MongoDB Atlas stores documents in binary BSON format on WiredTiger storage. Replica set nodes guarantee high availability, and compound text indexes support rapid text searching.

---

## 7. MONGODB DOCUMENT DATABASE DESIGN

### 7.1. Database & Collection Parameters
* **Database Name:** `product_catalogue_db`
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

## 10. CLOUD DEPLOYMENT (AWS EC2 & MONGODB ATLAS)

ProductHub is architected for cloud hosting on **AWS EC2**:

1. **Virtual Machine Provisioning:** An EC2 `t2.micro` instance running **Ubuntu 22.04 LTS** was provisioned with inbound security group rules allowing ports 22 (SSH), 80 (HTTP), 443 (HTTPS), and 5000 (direct app access).
2. **Environment Configuration:** Node.js (v22 LTS), npm, and Git were installed via the official NodeSource repository.
3. **MongoDB Atlas Whitelisting:** The EC2 public IP was whitelisted in MongoDB Atlas Network Access, and database user credentials with read/write privileges were generated.
4. **Process Management with PM2:** The application was placed under **PM2** supervision to provide automatic restarts upon system reboots or runtime faults.
5. **Reverse Proxy with Nginx:** Nginx was configured on port 80 to reverse proxy incoming HTTP traffic to `http://localhost:5000`, securing internal ports and preparing the system for SSL termination.

---

## 11. SOFTWARE TESTING & RESULTS

A thorough automated test suite and live HTTP auditor were constructed using the Node.js native test runner and Supertest. All **17 automated unit/integration tests** and all **18 live end-to-end audit tests** passed with a **100% success rate**.

### 11.1. Technical Audit & Defect Remediation:
* **BUG-01 (Regex Injection Prevention):** User search strings with special regex characters (e.g. parentheses or plus signs) are automatically sanitized using `escapeRegex()`, preventing regular expression compilation crashes.
* **BUG-02 (Pagination Sanitization):** Non-numeric query parameters (`page=abc`) are safely defaulted to valid integers, avoiding `NaN` database query errors.
* **BUG-03 (Strict Validation):** Product creation and updates enforce non-negative prices and strict SKU formatting (`/^[A-Za-z0-9_-]+$/`), returning HTTP 400 Bad Request.
* **BUG-04 (Atlas Database Enforcement & Fail-Safe Handling):** Strict enforcement of the dedicated MongoDB Atlas database (`product_catalogue_db`). Connection attempts fail safely without data leakage; clear HTTP 503 Service Unavailable responses and masked server logs are provided when Atlas is unreachable.

### 11.2. Automated Test Results Summary:
* **TC-00 (Health Check):** Confirmed application health and connected database state (HTTP 200).
* **TC-01 (Add Valid Product):** Confirmed document creation with nested specifications (HTTP 201).
* **TC-02 (Missing Fields):** Confirmed rejection of invalid payloads missing required attributes (HTTP 400).
* **TC-03 (Duplicate Prevention):** Confirmed rejection of duplicate product IDs with HTTP 409 Conflict.
* **TC-04 (Retrieve Catalogue):** Confirmed retrieval of all documents with pagination metadata (HTTP 200).
* **TC-05 to TC-07 (Search Operations):** Verified keyword search across name, brand, and product ID.
* **TC-08 to TC-09 (Update Operations):** Verified updates to existing records and 404 error handling for non-existent records.
* **TC-10 to TC-11 (Delete Operations):** Verified permanent deletion from MongoDB and 404 error handling.
* **TC-12 (Aggregation Pipeline):** Verified mathematical calculation of average prices and category distributions.
* **TC-13 (Special Regex Search):** Verified query sanitization on regex special characters.
* **TC-14 to TC-15 (Input Constraints):** Verified rejection of negative prices and malformed product identifiers.
* **TC-16 (Pagination Defense):** Verified graceful fallback when non-numeric pagination arguments are passed.

---

## 12. CONCLUSION

The **ProductHub** project successfully demonstrates the implementation, cloud deployment, and practical utility of a document-oriented database for an online retail product catalogue. By utilizing **MongoDB Atlas**, the system achieves dynamic schema adaptability, enabling heterogeneous hardware and appliance specifications to be stored naturally as embedded BSON subdocuments.

The full-stack application developed with Node.js, Express.js, and Bootstrap 5 provides a modern administrative interface coupled with robust RESTful APIs. Automated test executions validated every mandatory CRUD operation, and the AWS EC2 production deployment architecture provides high availability, fault tolerance, and cloud scalability.

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

