# ProductHub Frontend – Cloud Deployment Guide

This guide details how to deploy the static frontend interface of **ProductHub** to various production cloud environments and connect it to your backend API.

---

## 1. Architecture Overview

```text
  [ User Browser ]
         │
         ▼
  ┌───────────────────────────────────────────────┐
  │         Static Frontend Hosting               │
  │   (AWS S3 + CloudFront / GitHub Pages / Nginx)│
  │                                               │
  │   • index.html                                │
  │   • css/style.css                             │
  │   • js/config.js (Points to Backend API)      │
  │   • js/app.js                                 │
  └───────────────────────┬───────────────────────┘
                          │
                          │ REST API (JSON)
                          ▼
  ┌───────────────────────────────────────────────┐
  │        Backend Application Server             │
  │           (AWS EC2 Ubuntu VM)                 │
  │                                               │
  │   • Node.js / Express.js (Port 5000)          │
  │   • Nginx Reverse Proxy (Port 80/443)         │
  └───────────────────────┬───────────────────────┘
                          │
                          │ TLS Handshake (Port 27017)
                          ▼
  ┌───────────────────────────────────────────────┐
  │          Database Storage Tier                │
  │        (MongoDB Atlas Cloud Cluster)          │
  │                                               │
  │   • Database: product_catalogue_db            │
  │   • Collection: products                      │
  └───────────────────────────────────────────────┘
```

---

## 2. Option A: AWS S3 + CloudFront Static Hosting (Production Grade)

### Step 1: Create an Amazon S3 Bucket
1. Open the **Amazon S3 Console** > **Create bucket**.
2. Bucket name: e.g. `producthub-frontend-<your-name>`.
3. Uncheck **Block all public access** (acknowledge warning).
4. Enable **Static website hosting**:
   * Index document: `index.html`
   * Error document: `index.html`

### Step 2: Configure Bucket Policy
Add the following bucket policy under **Permissions** > **Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::producthub-frontend-<your-name>/*"
    }
  ]
}
```

### Step 3: Configure API Endpoint
In `js/config.js`, set `API_BASE_URL` to your backend EC2 public IP or domain:

```javascript
API_BASE_URL: 'http://<YOUR_EC2_PUBLIC_IP>:5000'
```

### Step 4: Upload Frontend Assets
Using AWS CLI or S3 Web Console:

```bash
aws s3 sync d:/producthub-frontend s3://producthub-frontend-<your-name> --exclude ".git/*" --exclude "node_modules/*"
```

---

## 3. Option B: Nginx Web Server on Ubuntu EC2 (Unified Single-Host)

If hosting both frontend and backend on the same EC2 instance:

### Step 1: Deploy Files to EC2 Web Root
```bash
sudo mkdir -p /var/www/producthub
sudo cp -r /home/ubuntu/producthub-frontend/* /var/www/producthub/
sudo chown -R www-data:www-data /var/www/producthub
sudo chmod -R 755 /var/www/producthub
```

### Step 2: Configure Nginx Reverse Proxy
In this setup, `js/config.js` should have `API_BASE_URL: ''` (empty string) because Nginx handles routing:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/producthub;
    index index.html;

    # Serve static frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy backend API requests
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Option C: Vercel or Netlify Deployment

Both Vercel and Netlify natively host static frontend applications with zero server configuration.

### Vercel:
1. Install CLI: `npm i -g vercel`
2. Run in project directory: `vercel`
3. Set environment override or update `js/config.js` with your backend URL.

### Netlify:
1. Drag and drop the `producthub-frontend` folder into Netlify Drop ([app.netlify.com/drop](https://app.netlify.com/drop)).
2. Update `js/config.js` with your backend URL.

---

## 5. Option D: GitHub Pages Deployment

1. Create a GitHub repository (e.g. `producthub-frontend`).
2. Push the files to branch `main`.
3. In repository **Settings** > **Pages**:
   * Source: `Deploy from a branch`
   * Branch: `main` / `/(root)`
4. Set `API_BASE_URL` in `js/config.js` to your backend URL (must use HTTPS if GitHub Pages is served over HTTPS to avoid Mixed Content restrictions).

---

## 6. Backend CORS Configuration Checklist

When the frontend is hosted on a separate domain/origin from the backend, the backend server must allow CORS requests:

1. In the backend (`server.js`), CORS is enabled using:
   ```javascript
   const cors = require('cors');
   app.use(cors()); // Allows cross-origin requests from frontend
   ```
2. For restricted production origins, specify:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type']
   }));
   ```

