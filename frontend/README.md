# ProductHub – Frontend Application

**ProductHub** is a responsive, cloud-based product catalogue and inventory management frontend interface. It is designed to consume RESTful APIs backed by a document-oriented database (MongoDB Atlas) to manage heterogeneous retail products with flexible specification schemas.

* **Domain:** Retail / E-Commerce
* **Assignment:** Cloud Computing Assignment 3
* **Developers:**
  * **Deviprasad** – Frontend Developer & UI/UX Designer
  * **Gagan Gowda** – Backend Developer & Database Engineer
* **Technology Stack:** HTML5, CSS3, Bootstrap 5.3 (CDN), Vanilla JavaScript (ES6+), Bootstrap Icons

---

## 1. Project Directory Structure

```text
D:\producthub-frontend/
├── index.html                   # Main single-page application entry point
├── package.json                 # Frontend scripts and metadata
├── README.md                    # Project documentation and usage guide
├── .gitignore                   # Standard frontend ignore rules
├── css/
│   └── style.css                # Custom UI styling, pulse animations, and responsive layout
├── js/
│   ├── config.js                # API endpoint configuration and environment handler
│   └── app.js                   # Client logic, state management, DOM rendering, and API calls
├── scripts/
│   └── serve.js                 # Zero-dependency local preview server
├── tests/
│   └── frontend.test.js         # Automated frontend integrity and configuration tests
└── docs/
    └── deployment-guide.md      # Deployment guide for S3, Nginx, Vercel, Netlify & GitHub Pages
```

---

## 2. Backend API Configuration

The frontend communicates with the ProductHub Node.js/Express backend via REST APIs. The API base URL is decoupled from application code and managed through `js/config.js`.

### How to Configure the Backend API

Open `js/config.js`:

```javascript
const config = {
  // Replace 'BACKEND_API_PLACEHOLDER' with your deployed backend address:
  API_BASE_URL: 'BACKEND_API_PLACEHOLDER',
  ...
};
```

| Deployment Scenario | Recommended `API_BASE_URL` Setting | Example Value |
| :--- | :--- | :--- |
| **Local Development** | Your local backend port | `'http://localhost:5000'` |
| **AWS EC2 Backend** | Your EC2 instance public IP on port 5000 | `'http://13.232.xxx.xxx:5000'` |
| **Custom Domain / SSL** | Production API domain | `'https://api.yourdomain.com'` |
| **Same-Origin / Nginx Proxy** | Empty string (routes relative to current host) | `''` |
| **Pre-Deployment / Testing** | Keep default placeholder | `'BACKEND_API_PLACEHOLDER'` |

### Runtime Overrides (Without Modifying Files)

You can override `API_BASE_URL` at runtime without altering code:

1. **Via Browser LocalStorage (Developer Tools Console):**
   ```javascript
   localStorage.setItem('PRODUCTHUB_API_URL', 'http://localhost:5000');
   location.reload();
   ```

2. **Via Window Global (Before config.js loads):**
   ```html
   <script>
     window.PRODUCTHUB_CONFIG = { API_BASE_URL: 'http://<BACKEND-IP>:5000' };
   </script>
   ```

---

## 3. Running the Frontend Locally

This frontend requires **no build step** (no Webpack, Vite, or Babel needed).

### Option A: Using the Built-In Preview Server (Recommended)

Requires Node.js (v18+):

```bash
npm run serve
# Or: npm start
```

Open your browser at: **`http://localhost:3000`**

### Option B: Using Any Static Server

```bash
# Python 3
python -m http.server 3000

# NPM http-server
npx http-server -p 3000
```

---

## 4. Running Automated Frontend Tests

ProductHub includes an automated frontend verification suite using the Node.js native test runner (`node:test`).

```bash
npm test
```

### Test Coverage:
* **TC-F01:** Essential file structure and asset presence.
* **TC-F02:** Strict backend code and secret exclusion (no `server.js`, controllers, `.env`).
* **TC-F03:** Configuration module export and `BACKEND_API_PLACEHOLDER` validation.
* **TC-F04:** API routing via `getApiUrl()` across all `fetch()` calls.
* **TC-F05:** Asset link ordering in `index.html` (`config.js` loaded before `app.js`).
* **TC-F06:** Presence of all critical DOM element IDs required for UI interaction.
* **TC-F07:** CSS pulse indicator animations for 3-state database connectivity.
* **TC-F08:** Complete absence of AI branding, names, or terminology.

---

## 5. Key Frontend Features

1. **Dashboard & Analytics:**
   * Live aggregate metrics: Total Products, Active Brands, Categories, Average Price.
   * Visual category distribution pills for quick filtering.
   * Recent products summary table with direct view/edit/delete actions.
2. **Product Catalogue Browser:**
   * Responsive Bootstrap 5 grid layout with high-resolution image cards.
   * Real-time search by keyword across Name, Brand, and Product ID.
   * Category and brand dropdown filters.
   * Multi-directional price and date sorting (`price-asc`, `price-desc`, `newest`, `oldest`).
   * Dynamic pagination controls.
3. **Product Management (CRUD):**
   * **Add Product:** Form validation with live real-time card preview before submission.
   * **View Details:** Modal with formatted attributes, nested specifications, and raw BSON/JSON viewer.
   * **Edit Product:** In-place updates for prices, stock, descriptions, and hardware specifications.
   * **Delete Product:** Safe confirmation dialog to prevent accidental deletion.
4. **Cloud Database Health Component:**
   * Clean 3-state connectivity badge (**Connected**, **Connecting**, **Disconnected**).
   * Detailed system diagnostic modal displaying Node.js engine, platform, uptime, and memory heap usage.

