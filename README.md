# ProductHub – Cloud-Based Product Catalogue

**ProductHub** is a full-stack, cloud-ready Product Catalogue and Inventory Management System built with a decoupled frontend and backend architecture backed by **MongoDB Atlas** (document-oriented database).

* **Repository:** `https://github.com/gaganv07/product-hub.git`
* **Domain:** Retail / E-Commerce
* **Team Members:**
  * **Deviprasad** – Frontend Developer & UI/UX Designer
  * **Gagan Gowda** – Backend Developer & Database Engineer

---

## 1. Repository Structure

```text
product-hub/
├── README.md                    # Root project overview and setup instructions
├── .gitignore                   # Root ignore rules (node_modules, .env, logs)
├── frontend/                    # Standalone Static Frontend (HTML5, CSS3, Bootstrap 5, JS)
│   ├── index.html               # Single-Page Application entry point
│   ├── package.json             # Frontend scripts (serve, test)
│   ├── css/style.css            # Custom theme and responsive styles
│   ├── js/
│   │   ├── config.js            # Configurable Backend API Base URL
│   │   └── app.js               # Client state, REST integration, and DOM rendering
│   ├── scripts/serve.js         # Zero-dependency static preview server
│   ├── tests/frontend.test.js   # Frontend integrity & configuration tests
│   └── docs/deployment-guide.md # Static hosting guide (S3, Nginx, Vercel, Netlify)
└── backend/                     # Node.js + Express.js + Mongoose REST API
    ├── server.js                # Express application entry point
    ├── package.json             # Backend dependencies and scripts
    ├── .env.example             # Environment variable template (copy to .env)
    ├── ecosystem.config.js      # PM2 production process configuration
    ├── config/database.js       # MongoDB Atlas connection manager (product_catalogue)
    ├── models/Product.js        # Mongoose Product schema with embedded specifications
    ├── controllers/             # CRUD, search, and dashboard aggregation controllers
    ├── routes/                  # Express REST API routes (/api/products)
    ├── middleware/              # Centralized error handler
    ├── scripts/                 # DB verification, audit, and EC2 deployment scripts
    ├── tests/api.test.js        # Automated API & MongoDB integration tests
    └── docs/                    # Architecture, database design, and project report
```

---

## 2. Prerequisites

* **Node.js:** v18+ or v22 LTS
* **npm:** v9+
* **MongoDB Atlas:** An active MongoDB Atlas cluster with your client IP whitelisted in **Network Access**

---

## 3. Running the Backend (`backend/`)

1. **Navigate to the backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string:
   ```bash
   cp .env.example .env
   ```
   Edit `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/product_catalogue?retryWrites=true&w=majority&appName=ProductHub
   ```
   > **Note:** The backend enforces the dedicated database name `product_catalogue`. Never commit `.env` to Git.

3. **Verify MongoDB Atlas connectivity:**
   ```bash
   npm run verify:db
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # Backend API runs at: http://localhost:5000
   # Health check:        http://localhost:5000/api/health
   ```

5. **Run backend automated tests:**
   ```bash
   npm test
   ```

---

## 4. Running the Frontend (`frontend/`)

1. **Configure the Backend API URL:**
   Open `frontend/js/config.js` and update `API_BASE_URL` from `'BACKEND_API_PLACEHOLDER'` to your backend URL:
   ```javascript
   API_BASE_URL: 'http://localhost:5000' // Or your deployed EC2/API domain
   ```
   *(If served behind an Nginx reverse proxy on the same domain, set `API_BASE_URL: ''`.)*

2. **Start the frontend preview server:**
   ```bash
   cd frontend
   npm start
   # Frontend runs at: http://localhost:3000
   ```

3. **Run frontend automated tests:**
   ```bash
   cd frontend
   npm test
   ```

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Application & MongoDB Atlas connection status (`Connected`, `Connecting`, `Disconnected`) |
| `GET` | `/api/dashboard/stats` | Aggregated metrics (total products, brands, categories, average price, recent items) |
| `GET` | `/api/products` | List products with pagination, category/brand filters, and sorting |
| `GET` | `/api/products/search?q=` | Case-insensitive keyword search across name, brand, and productId |
| `GET` | `/api/products/:id` | Retrieve a single product document |
| `POST` | `/api/products` | Create a new product document |
| `PUT` | `/api/products/:id` | Update an existing product document |
| `DELETE` | `/api/products/:id` | Delete a product document |

