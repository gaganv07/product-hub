# ProductHub – 3 to 5 Minute College Demonstration Script

**Project Title:** Product Catalogue Using Document Database (ProductHub)  
**Team Members:** Deviprasad & Gagan Gowda  
**Course:** Cloud Computing / Database Technologies (Assignment 3)

---

## 🎯 Demonstration Guide (Step-by-Step)

### 0:00 – 0:45 | Introduction & Objective (Speaker: Deviprasad)
> "Good morning / afternoon respected professors and classmates.
> 
> Today, my teammate Gagan Gowda and I are presenting **ProductHub**, a cloud-based Product Catalogue Management System built using a **Document-Oriented Database — MongoDB Atlas** — and deployed on an **AWS EC2 Ubuntu Linux Virtual Machine**.
> 
> **Why did we choose MongoDB over traditional SQL?**
> In modern e-commerce, every product has different technical specifications. A laptop has RAM, storage, and CPU; a smartphone has camera megapixels and battery size; headphones have driver sizes.
> In a traditional SQL database like MySQL, handling these requires creating dozens of empty columns or complex multiple table joins. With MongoDB's **BSON document format**, we store nested specifications cleanly inside a single document without complex schema alterations."

---

### 0:45 – 1:30 | Architecture & MongoDB Atlas Connectivity (Speaker: Gagan Gowda)
> "Let's examine our application architecture:
> 1. Our frontend is a responsive administrative interface built with **HTML5, Bootstrap 5, and JavaScript**.
> 2. The backend is an **Express.js and Node.js REST API server**.
> 3. The cloud database is **MongoDB Atlas**, hosted on a managed cloud cluster.
> 4. The server runs on an **AWS EC2 Ubuntu Linux VM** managed by **PM2** for zero downtime and reverse-proxied by **Nginx**.
> 
> As you can see at the top of our screen, the database status banner indicates **'Online & Connected'**. When we click the **Database Health** button, it shows live stats directly from the MongoDB connection: database name `product_catalogue`, host cluster address, Node.js runtime version, and memory usage."

---

### 1:30 – 2:30 | Live CRUD Demonstration (Speaker: Deviprasad)

#### 1. Viewing Catalogue & Dashboard
> "On our **Dashboard**, we see real-time aggregated metrics computed directly from MongoDB Atlas:
> - Total Products: 12
> - Active Brands: 8
> - Categories: 5
> - Catalogue Average Price: ₹62,490
> 
> We also have a live category breakdown where clicking any category filters our catalogue."

#### 2. Adding a Product Document (CREATE)
> "Now, let's navigate to **Add Product**.
> I will enter:
> - Product ID: `P1015`
> - Name: `Asus ROG Zephyrus G14`
> - Brand: `Asus`
> - Category: `Laptops`
> - Price: `149999`
> - Stock: `12`
> - Nested Specifications: RAM `32GB DDR5`, Storage `1TB SSD`, Processor `AMD Ryzen 9 8945HS`.
> 
> Notice our **Live Document Preview** on the right side updates in real time as we type.
> When I click **'Save to MongoDB Atlas'**, the backend validates the fields, inserts the document into our MongoDB Atlas collection, and displays a green confirmation toast."

---

### 2:30 – 3:30 | Search, Filter, Update & Delete (Speaker: Gagan Gowda)

#### 3. Real-Time Search & Filtering (READ)
> "Now let's go to the **Product Catalogue**.
> You can see our newly created Asus ROG laptop appears immediately in the grid.
> In the search bar, I can search by product name, brand, or ID. For instance, typing **'Dell'** instantly filters to Dell products. Searching by **'1TB'** filters by nested storage specifications.
> We also have category filters, brand filters, price sorting, and pagination."

#### 4. Updating a Product Document (UPDATE)
> "To demonstrate an update, I will click the edit icon on our new Asus laptop.
> Let's change the price from ₹1,49,999 to ₹1,39,999 and upgrade the RAM to `64GB DDR5`.
> Clicking **'Update in MongoDB'** sends a `PUT` request. The record updates in Atlas, and the catalogue reflects the new price and specification immediately."

#### 5. Deleting a Product Document (DELETE)
> "Finally, let's demonstrate delete.
> When I click the delete button, a **confirmation modal** appears to prevent accidental deletions.
> Clicking **'Yes, Delete Document'** sends a `DELETE` request to our API. The document is permanently removed from the MongoDB collection, and our catalogue refreshes."

---

### 3:30 – 4:00 | Cloud Deployment & Testing Verification (Speaker: Deviprasad)
> "Behind the scenes, we also built an automated test suite.
> Running `npm test` executes **13 automated test cases** covering valid insertions, duplicate ID prevention, missing field rejections, search queries, update validations, and deletions with a **100% pass rate**.
> 
> In conclusion, ProductHub demonstrates how a document-oriented database like MongoDB simplifies e-commerce catalogue management, eliminating complex joins while providing cloud scalability on AWS EC2.
> 
> Thank you, and we welcome any questions!"

---

## 💡 Quick Answers to Likely Viva / Examiner Questions

**Q1: Why did you choose MongoDB Atlas instead of MySQL?**  
*Answer:* MySQL requires predefined column schemas. E-commerce products have contrasting specifications (e.g. laptops have RAM/CPU, while appliances have wattage/capacity). MongoDB's BSON document model allows us to embed these nested specifications directly into each document without altering schemas or running expensive multi-table joins.

**Q2: How do you prevent duplicate Product IDs?**  
*Answer:* In our Mongoose schema, `productId` is defined with `unique: true`. Additionally, our controller explicitly performs a pre-check query before insertion, and MongoDB error code `11000` is caught by our centralized error middleware to return an HTTP `409 Conflict`.

**Q3: How does search work?**  
*Answer:* The search endpoint `/api/products/search?q=` uses case-insensitive MongoDB regular expressions across `productId`, `name`, `brand`, `category`, and nested fields like `specifications.processor`. Furthermore, we created a compound text index on the collection for high-performance keyword indexing.

**Q4: How does the application run continuously on AWS EC2?**  
*Answer:* We use **PM2** (Process Manager 2), which runs the Node.js server as a background service, auto-restarts the app on crashes or VM reboots, and manages logs. **Nginx** sits in front as a reverse proxy, forwarding standard web traffic from port 80 to port 5000.

