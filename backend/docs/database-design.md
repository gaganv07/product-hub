# ProductHub – MongoDB Document Database Design

## 1. Database Identification & Parameters

* **Database Service:** MongoDB Atlas (Cloud Document Database)
* **Database Name:** `product_catalogue`
* **Primary Collection:** `products`
* **Object Data Modeling (ODM):** Mongoose 8.x
* **Storage Engine:** WiredTiger Document Storage Engine

---

## 2. Why a Document-Oriented Database for Product Catalogues?

In modern e-commerce systems, products possess highly heterogeneous and constantly evolving technical specifications:
* A **Laptop** requires RAM, storage type, processor clock speed, and screen resolution.
* A **Smartphone** requires camera megapixels, battery capacity, 5G band support, and SIM type.
* A **Headphone** requires driver size, frequency response, battery endurance, and noise cancellation type.
* A **Vacuum Cleaner** requires motor wattage, suction pressure (Pascals), and dustbin capacity.

### Contrast: Relational (RDBMS) vs. Document-Oriented (MongoDB)

| Criteria | Relational Databases (RDBMS: MySQL / PostgreSQL) | Document Database (MongoDB Atlas) |
| :--- | :--- | :--- |
| **Schema Rigidity** | Rigid tabular schemas; schema alterations (`ALTER TABLE`) lock tables. | Flexible, polymorphic JSON/BSON documents accommodate diverse specs. |
| **Handling Attributes** | Requires Entity-Attribute-Value (EAV) anti-pattern or dozens of nullable columns. | Natural nested subdocuments (`specifications: { ram, storage, processor }`). |
| **Query Performance** | Demands complex multi-table `JOIN` statements across products, brands, and spec tables. | Single document read query retrieves all product attributes in $O(1)$ time. |
| **Horizontal Scalability** | Challenging and complex to shard across distributed commodity nodes. | Native horizontal sharding and replica sets built into MongoDB architecture. |

---

## 3. Product Document Schema Specification

### 3.1. Field Definitions & Data Types

| Field Name | BSON / Mongoose Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated, Primary Key | Unique 12-byte BSON identifier assigned by MongoDB. |
| `productId` | `String` | Required, Unique, Uppercase, Trimmed | Business identifier (e.g. `P1001`), indexed uniquely. |
| `name` | `String` | Required, MinLength: 2, Trimmed | Full commercial title of the product. |
| `brand` | `String` | Required, Trimmed | Manufacturer / brand name (e.g. Dell, Apple, Sony). |
| `category` | `String` | Required, Trimmed | Product classification (e.g. Laptops, Smartphones). |
| `price` | `Number` | Required, Min: 0 | Selling price in Indian Rupees (₹). |
| `description` | `String` | Optional, Default: `""` | Detailed description and features. |
| `image` | `String` | Optional, URL format | Public HTTPS URL for the product photograph. |
| `specifications` | `Embedded Subdocument` | Schema `{ ram, storage, processor }` | Nested technical specifications object. |
| `specifications.ram` | `String` | Optional, Default: `"N/A"` | Installed memory (e.g. `16GB DDR5`). |
| `specifications.storage`| `String` | Optional, Default: `"N/A"` | Storage capacity and type (e.g. `512GB NVMe SSD`). |
| `specifications.processor`| `String`| Optional, Default: `"N/A"` | CPU or chipset (e.g. `Intel Core i7-13700H`). |
| `stock` | `Number` | Required, Min: 0, Default: `0` | Available warehouse inventory count. |
| `createdAt` | `Date` | Timestamp (Automated) | ISO date string of document creation. |
| `updatedAt` | `Date` | Timestamp (Automated) | ISO date string of last document update. |

---

## 4. Indexing Strategy

To guarantee rapid query response times as the catalogue grows to tens of thousands of items:

1. **Unique Key Index:**
   ```javascript
   { productId: 1 }, { unique: true }
   ```
   Prevents duplicate SKU or catalogue codes across the collection.

2. **Compound Text Search Index:**
   ```javascript
   {
     productId: "text",
     name: "text",
     brand: "text",
     category: "text"
   }
   ```
   Enables high-performance keyword searches across all core descriptive fields.

3. **Category & Price Compound Index:**
   ```javascript
   { category: 1, price: 1 }
   ```
   Optimizes filtered browsing and sorted pricing queries.

---

## 5. Sample MongoDB BSON / JSON Documents

### Example 1: Laptop Document (Full Specifications)
```json
{
  "_id": "672c0a91f582ba9842a19e01",
  "productId": "P1001",
  "name": "Dell Inspiron 15 3520",
  "brand": "Dell",
  "category": "Laptops",
  "price": 54990,
  "description": "Powerful daily business and coding laptop with high refresh rate display and anti-glare screen.",
  "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600",
  "specifications": {
    "ram": "16GB DDR4",
    "storage": "512GB NVMe SSD",
    "processor": "Intel Core i5-1235U 12th Gen"
  },
  "stock": 25,
  "createdAt": "2026-11-06T10:30:00.000Z",
  "updatedAt": "2026-11-06T10:30:00.000Z",
  "__v": 0
}
```

### Example 2: Smartphone Document
```json
{
  "_id": "672c0a91f582ba9842a19e04",
  "productId": "P1004",
  "name": "Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "category": "Smartphones",
  "price": 129999,
  "description": "Titanium exterior with 200MP camera system, built-in S Pen, and advanced mobile productivity features.",
  "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
  "specifications": {
    "ram": "12GB LPDDR5X",
    "storage": "512GB UFS 4.0",
    "processor": "Snapdragon 8 Gen 3 for Galaxy"
  },
  "stock": 15,
  "createdAt": "2026-11-06T10:32:00.000Z",
  "updatedAt": "2026-11-06T10:32:00.000Z",
  "__v": 0
}
```

---

## 6. Mongoose ODM Validation & Error Handling Code

```javascript
// Validation in models/Product.js
productId: {
  type: String,
  required: [true, 'Product ID is required'],
  unique: true,
  trim: true,
  uppercase: true,
  match: [/^[A-Za-z0-9_-]+$/, 'Product ID can only contain letters, numbers, hyphens, and underscores']
},
price: {
  type: Number,
  required: [true, 'Price is required'],
  min: [0, 'Price must be a positive number or zero']
}
```

When an invalid or duplicate document is submitted:
* MongoDB code `11000` is caught by `middleware/errorHandler.js` returning HTTP `409 Conflict` with human-readable messaging.
* Missing mandatory fields trigger `ValidationError`, returning HTTP `400 Bad Request`.

