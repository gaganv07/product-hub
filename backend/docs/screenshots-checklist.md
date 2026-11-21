# ProductHub – College Submission Screenshots Checklist

Capture genuine screenshots from the deployed application, AWS EC2, and MongoDB Atlas. Save them under a `screenshots/` directory and label each figure in the project report. Do not include credentials, connection strings, access tokens, or private keys.

## Required Evidence Checklist

| # | Screenshot Item | What It Must Show | Production Target | Status |
|---:|---|---|---|---|
| 1 | **Production Dashboard** | Browser address bar, dashboard metrics, connected database status | `https://producthub-frontend-two.vercel.app` | Verified Live |
| 2 | **Product Catalogue** | Vercel URL and 12 of 12 product cards with ₹ prices and stock badges | `https://producthub-frontend-two.vercel.app/#catalogue` | Verified Live |
| 3 | **Search & Filter Results** | Search keyword (e.g. "Dell") and category filter active | `https://producthub-frontend-two.vercel.app` | Verified Live |
| 4 | **Add Product Modal & Toast** | Add form and successful creation toast for a temporary test item | `https://producthub-frontend-two.vercel.app/#add-product` | Verified Live |
| 5 | **Edit Product Modal** | Updated product price / specifications and success notification | `https://producthub-frontend-two.vercel.app` | Verified Live |
| 6 | **Delete Product Confirmation** | Delete confirmation modal and success notification | `https://producthub-frontend-two.vercel.app` | Verified Live |
| 7 | **EC2 Nginx Health Endpoint** | `http://3.108.53.179/api/health` returning JSON (Healthy & Connected) | AWS EC2 (Port 80) | Verified Live |
| 8 | **EC2 Direct API Health Check** | `http://3.108.53.179:5000/api/health` returning JSON with Node v22 | AWS EC2 (Port 5000) | Verified Live |
| 9 | **AWS EC2 Terminal / PM2** | `pm2 status` showing `producthub` online, pid, uptime, memory | Ubuntu 24.04 LTS VM | Verified Live |
| 10 | **MongoDB Atlas Collection** | Atlas UI showing database `product_catalogue` and collection `products` (12 documents) | MongoDB Atlas Cloud | Verified Live |
| 11 | **Atlas Sample Document** | Expanded BSON/JSON document showing nested `specifications` subdocument | MongoDB Atlas Cloud | Verified Live |
| 12 | **Vercel Project Dashboard** | Deployment status READY, production domain `producthub-frontend-two.vercel.app` | Vercel Dashboard | Verified Live |

## Capture Instructions

- Keep the browser address bar visible for hosted application evidence.
- Capture full, readable pages at a consistent zoom level.
- Use a temporary product for create/update/delete demonstrations; ensure the sample dataset remains at 12 records after testing.
- Never capture `.env` files, passwords, or connection strings in terminal screenshots.
