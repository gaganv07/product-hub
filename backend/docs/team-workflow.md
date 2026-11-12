# ProductHub – Team Collaboration & Git Integration Workflow

**Project Title:** ProductHub – Cloud-Based Product Catalogue  
**Course Assignment:** Cloud Computing / Database Technologies (Assignment 3)  
**Repository Branch Strategy:** Feature-Branch Workflow with Central Integration Branch (`dev`)

---

## 1. Team Roles & File Ownership Matrix

To maintain clean separation of concerns and avoid merge conflicts, team members work on isolated feature branches and strictly own their corresponding files:

```
ProductHub/
│
├── public/                          <-- FRONTEND (Deviprasad)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
│
├── config/database.js               <-- BACKEND (Gagan Gowda)
├── controllers/productController.js  <-- BACKEND (Gagan Gowda)
├── models/Product.js                <-- BACKEND (Gagan Gowda)
├── routes/productRoutes.js          <-- BACKEND (Gagan Gowda)
├── middleware/errorHandler.js       <-- BACKEND (Gagan Gowda)
├── server.js                        <-- BACKEND (Gagan Gowda)
├── tests/api.test.js                <-- BACKEND (Gagan Gowda)
├── scripts/                         <-- BACKEND (Gagan Gowda)
│   ├── seed.js
│   ├── audit.js
│   └── verify-db.js
│
├── docs/                            <-- SHARED (Both Developers)
│   ├── api-contract.md
│   ├── team-workflow.md
│   ├── architecture.md
│   ├── database-design.md
│   └── deployment-guide.md
└── package.json                     <-- SHARED (Coordinated Changes)
```

### 1.1. Deviprasad – Frontend Developer
* **Assigned Branch:** `feature/frontend`
* **Owned Files:** `public/index.html`, `public/css/style.css`, `public/js/app.js`
* **Key Responsibilities:**
  * Admin dashboard UI components and metrics display.
  * Responsive Bootstrap 5 grid layout and product cards.
  * Add Product & Edit Product forms with live document preview.
  * Real-time search, category/brand filters, and price sorting.
  * Product details modal and delete confirmation dialogues.
  * Frontend asynchronous API integration using the fetch API.
* **Non-Negotiable Rule:** The frontend must consume data exclusively from backend REST APIs (`/api/products`). Static arrays or localStorage must never be used as product stores.

### 1.2. Gagan Gowda – Backend Developer
* **Assigned Branch:** `feature/backend`
* **Owned Files:** `config/database.js`, `controllers/productController.js`, `models/Product.js`, `routes/productRoutes.js`, `middleware/errorHandler.js`, `server.js`, `tests/`, `scripts/`
* **Key Responsibilities:**
  * Node.js & Express.js REST API routes and controllers.
  * MongoDB Atlas connectivity, SSL/TLS handshake, and connection pooling.
  * Mongoose product schema with embedded specifications.
  * CRUD handlers, regex-safe search, and aggregation pipelines.
  * Input sanitization, error middleware, and HTTP status codes.
  * Automated testing suite (`npm test`) and audit scripts (`npm run audit`).
* **Non-Negotiable Rule:** MongoDB Atlas is the official production cloud database. The backend must require Atlas in production (`NODE_ENV=production`) and clearly disclose provider state in `/api/health`.

---

## 2. Git Branch Strategy

```mermaid
gitGraph
    commit id: "Initial Release"
    branch dev
    checkout dev
    commit id: "Integration baseline"
    
    branch feature/frontend
    checkout feature/frontend
    commit id: "feat(ui): catalogue cards"
    commit id: "feat(ui): reactive preview"
    
    checkout dev
    branch feature/backend
    checkout feature/backend
    commit id: "feat(api): regex sanitization"
    commit id: "test(api): edge-cases"
    
    checkout dev
    merge feature/backend id: "PR #1: Backend merge"
    merge feature/frontend id: "PR #2: Frontend merge"
    commit id: "test: verify dev integration"
    
    checkout main
    merge dev id: "Release v1.1.0 to Production"
```

### Branch Definitions
1. **`main` (Protected Production Branch):**
   * Represents clean, verified, production-ready code deployed on the AWS EC2 instance.
   * Direct commits to `main` are strictly forbidden. Only merges from `dev` are permitted after complete test verification.
2. **`dev` (Shared Integration Branch):**
   * Acts as the staging branch where frontend and backend feature branches integrate.
   * Integration testing (`npm test` and `npm run audit`) is executed on `dev`.
3. **`feature/frontend` (Deviprasad):**
   * Isolated branch for UI changes, styles, and client scripts.
4. **`feature/backend` (Gagan Gowda):**
   * Isolated branch for API routes, database schemas, and server-side logic.

---

## 3. Git Commands Guide for Developers

### 3.1. Deviprasad's Daily Workflow (Frontend)

```bash
# 1. Switch to your feature branch
git checkout feature/frontend

# 2. Sync with latest integration branch (dev)
git fetch origin
git merge dev

# 3. Work on your assigned frontend files (public/*)
# ... make edits in index.html, style.css, or app.js ...

# 4. Check changes
git status

# 5. Stage and commit with descriptive conventional commit message
git add public/
git commit -m "feat(ui): enhance mobile responsive product grid"

# 6. Push to GitHub
git push origin feature/frontend

# 7. Create Pull Request on GitHub: feature/frontend -> dev
```

### 3.2. Gagan Gowda's Daily Workflow (Backend)

```bash
# 1. Switch to your feature branch
git checkout feature/backend

# 2. Sync with latest integration branch (dev)
git fetch origin
git merge dev

# 3. Work on your assigned backend files (controllers, models, routes, tests)
# ... make edits in productController.js, Product.js, etc. ...

# 4. Run automated tests before committing
npm test
npm run audit

# 5. Stage and commit
git add controllers/ models/ routes/ tests/
git commit -m "feat(api): optimize aggregation pipeline for category stats"

# 6. Push to GitHub
git push origin feature/backend

# 7. Create Pull Request on GitHub: feature/backend -> dev
```

---

## 4. Commit Naming Conventions

Both developers follow the Conventional Commits standard:

* `feat(scope):` New feature implementation (e.g. `feat(ui): add live document preview`).
* `fix(scope):` Bug fix (e.g. `fix(api): escape special regex characters in search`).
* `docs(scope):` Documentation additions/updates (e.g. `docs(api): update contract with error envelopes`).
* `test(scope):` Adding or updating test cases (e.g. `test(api): add negative price rejection test`).
* `refactor(scope):` Code improvement without changing external behavior.

---

## 5. Pull Request (PR) & Integration Protocol

### 5.1. PR Creation Rules
1. Never open a PR directly into `main`. All feature PRs target `dev`.
2. Target: `feature/frontend` &rarr; `dev` OR `feature/backend` &rarr; `dev`.
3. PR description must link any addressed task and state what files were modified.

### 5.2. Pre-Merge Checklist
Before merging a PR into `dev`:
* [ ] No changes to files owned by the other developer unless mutually agreed upon.
* [ ] No hardcoded database credentials or secret `.env` keys present in the diff.
* [ ] All 17 automated tests pass (`npm test`).
* [ ] All 18 live audit checks pass (`npm run audit`).
* [ ] Peer review approved by the other team member.

### 5.3. Promoting `dev` to `main` (Production Release)
Once `dev` has passed all tests and verified locally:
```bash
git checkout dev
npm test
npm run audit

# Switch to main and merge dev
git checkout main
git merge dev --ff-only
git push origin main
```

---

## 6. Conflict Resolution Procedure

If a conflict occurs when merging `dev` into a feature branch:

```bash
# 1. On your feature branch, pull dev
git checkout feature/frontend
git fetch origin
git merge origin/dev

# 2. If Git reports CONFLICT:
git status

# 3. Open the conflicted files in your editor (e.g. package.json)
# Look for standard conflict markers:
# <<<<<<< HEAD (Your changes)
# =======
# >>>>>>> dev (Incoming changes)

# 4. Resolve the conflicting lines, save the file
# 5. Stage the resolved file and commit
git add package.json
git commit -m "chore: resolve merge conflict with dev"

# 6. Verify tests still pass
npm test

# 7. Push resolved branch
git push origin feature/frontend
```

---

## 7. Database Verification & Environment Distinction

ProductHub strictly separates its database environments:

| Environment | Database Engine | Database Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Development** | MongoDB Atlas Cloud Cluster | `product_catalogue` | Live cloud database connection configured via server-side `.env`. |
| **Automated Testing** | Isolated Test MongoDB | `product_catalogue_test` | Ephemeral test sandbox created and destroyed during `npm test`. |
| **Production Cloud** | MongoDB Atlas Cloud Cluster | `product_catalogue` | Multi-AZ cloud cluster used when deployed on AWS EC2. Strictly required in production mode. |

### Verifying MongoDB Atlas Cloud Connection
To prove your application is connected to MongoDB Atlas (without exposing passwords):

```bash
npm run verify:db
```

**Expected Atlas Success Output:**
```text
====================================================
🔍 PRODUCTHUB DATABASE CONNECTIVITY VERIFICATION
====================================================

📌 Environment Mode:    development
📌 Configured URI:      mongodb+srv://student_admin:********@cluster0.abcde.mongodb.net/product_catalogue?retryWrites=true&w=majority

📡 Attempting secure TLS/SSL handshake with MongoDB Atlas...
✅ MongoDB Atlas Connection Verified successfully in 184ms!

----------------------------------------------------
📊 ATLAS CLUSTER DIAGNOSTIC SUMMARY:
----------------------------------------------------
   Cluster Host:       cluster0-shard-00-00.abcde.mongodb.net
   Database Name:      product_catalogue
   MongoDB Version:    v7.0.14
   Network Latency:    184ms
   Collections in DB:  products
   Products Count:     12 documents in collection 'products'
----------------------------------------------------

🎉 VERIFICATION RESULT: PROVED CONNECTED TO MONGODB ATLAS CLOUD.
```

