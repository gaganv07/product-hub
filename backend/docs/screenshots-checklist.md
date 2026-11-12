# ProductHub – College Submission Screenshots Checklist

To complete your assignment submission, capture screenshots of the running system and place the image files in your college report or assignment zip folder under a `screenshots/` directory.

Use this checklist to ensure all 12 required screenshots are included:

---

## Required Screenshots Matrix

| # | Item Name | What to Display on Screen | How to Capture | Check |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Application Home Page** | Top navigation bar, brand banner, quick metrics, and database status indicator showing "Atlas Online". | Open `http://localhost:5000/#dashboard` (or EC2 public IP). | [ ] |
| **2** | **Product Dashboard** | The 4 metric cards (Total Products, Active Brands, Categories, Average Price) + Category distribution pills + Recently added table. | Scroll through `#dashboard` view. | [ ] |
| **3** | **Add Product Form** | Filled-out "Add New Product" form with Product ID, Name, Price, and Nested Specifications, showing the Live Document Preview card on the right. | Navigate to `#add-product` and type in test details. | [ ] |
| **4** | **Product Listing (Catalogue)** | Responsive grid of product cards showing images, badges, price in ₹, stock status, and specification pills. | Navigate to `#catalogue`. | [ ] |
| **5** | **Search Results** | Catalogue view with a search term entered (e.g. "Dell" or "MacBook") showing filtered matching products. | Type query in search bar and click "Search". | [ ] |
| **6** | **Update Operation** | "Update Product Document" modal pre-filled with existing data and modified values before saving. | Click the pencil edit icon on any product card. | [ ] |
| **7** | **Delete Confirmation** | "Confirm Deletion" modal dialog warning the user before removing the document from MongoDB Atlas. | Click the red trash icon on any product card. | [ ] |
| **8** | **MongoDB Atlas Collection** | MongoDB Atlas Web UI showing `product_catalogue_db` database and `products` collection with document count. | Log in to cloud.mongodb.com &rarr; Databases &rarr; Browse Collections. | [ ] |
| **9** | **Sample MongoDB Document** | Expanded JSON/BSON document view inside MongoDB Atlas (showing nested `specifications` object). | Click on any document in MongoDB Atlas collection view. | [ ] |
| **10**| **Database Connection Verification** | Terminal output of Node.js server startup showing `✅ MongoDB Connected successfully` or `npm run seed` completion. | Capture terminal console log output. | [ ] |
| **11**| **AWS EC2 Instance** | AWS EC2 Console showing running instance `ProductHub-WebServer` with Public IPv4 and Security Group rules. | Open AWS EC2 Console &rarr; Instances view. | [ ] |
| **12**| **Running Deployed Application** | Browser address bar showing the AWS EC2 Public IP or domain name with ProductHub fully loaded. | Navigate to `http://<EC2-PUBLIC-IP>` in your browser. | [ ] |

---

## Tips for Presentation & Report
* Ensure the browser address bar is visible in web screenshots to prove deployment.
* Use clear, high-resolution window captures (Alt + PrtScn on Windows).
* Label each figure clearly in your report (e.g., *Figure 4.1: Product Catalogue Grid View*).

