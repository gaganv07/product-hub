# ProductHub – Production Deployment Guide

This guide details the verified production deployment of **ProductHub**, running on a decoupled cloud architecture across **Vercel**, an **AWS EC2 Ubuntu Virtual Machine**, and **MongoDB Atlas**.

---

## 1. Production Topology

| Tier | Cloud Service | Host / URL / Port | Role & Configuration |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | [https://producthub-frontend-two.vercel.app](https://producthub-frontend-two.vercel.app) | Static SPA hosting with edge reverse-proxy rewrites |
| **Edge Proxy** | Vercel (`vercel.json`) | `/api/:path*` ➔ `http://3.108.53.179/api/:path*` | Server-side proxy eliminating browser Mixed Content blocking |
| **Web Server / Reverse Proxy** | Nginx 1.24 (AWS EC2) | `http://3.108.53.179` (Port 80) | Reverse proxy forwarding HTTP traffic to local port 5000 |
| **Backend API** | Node.js / Express (AWS EC2) | `http://3.108.53.179:5000` (Port 5000) | REST API managed by PM2 service `producthub` |
| **Database** | MongoDB Atlas | `producthubcluster.khsf2oa.mongodb.net` | Managed cloud replica set (TLS Port 27017) |
| **Database & Collection** | MongoDB Atlas | Database: `product_catalogue` / Collection: `products` | 12 verified sample product documents |

---

## 2. AWS EC2 Ubuntu Virtual Machine Setup

### 2.1 Instance Specifications
* **Operating System:** Ubuntu 24.04 LTS (GNU/Linux 6.8.0-1017-aws x86_64)
* **Public IPv4 Address:** `3.108.53.179`
* **Node.js Runtime:** `v22.23.5`
* **Package Manager:** npm `10.9.9`
* **Process Manager:** PM2 `7.1.2`
* **SSH Access:** `ssh -i <key.pem> ubuntu@3.108.53.179`

### 2.2 Environment Configuration (`backend/.env`)
The backend reads its credentials from `/home/ubuntu/product-hub/backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@producthubcluster.khsf2oa.mongodb.net/product_catalogue?retryWrites=true&w=majority
CORS_ORIGIN=https://producthub-frontend-two.vercel.app
```
*(Credentials and passwords are strictly kept out of Git via `.gitignore`.)*

---

## 3. PM2 Process Management on EC2

The Express server runs as a background daemon managed by PM2:

* **Configuration file:** `backend/ecosystem.config.js`
* **Service script:** `server.js` (`cwd: __dirname`)
* **Systemd integration:** Configured to survive machine reboots via `pm2-ubuntu.service`.

### Standard PM2 Management Commands:
```bash
# Check status of running backend processes
pm2 status

# View live application logs (output & errors)
pm2 logs producthub --lines 50

# Restart backend process
pm2 restart producthub

# Save running process list for automated reboot startup
pm2 save
```

---

## 4. Nginx Reverse Proxy Configuration

Nginx acts as the front-facing web server on port 80, buffering and forwarding requests to the internal Node.js port 5000:

* **Site configuration:** `/etc/nginx/sites-available/producthub`
* **Enabled symlink:** `/etc/nginx/sites-enabled/producthub`

```nginx
upstream producthub_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://producthub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    location /api/health {
        proxy_pass http://producthub_backend/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
}
```

---

## 5. Vercel Frontend Deployment & Proxy Rewrites

The static frontend is hosted on Vercel from the repository `gaganv07/product-hub` with **Root Directory** set to `frontend`.

### 5.1 Configuration (`frontend/js/config.js`)
* `LOCAL_DEV_API_URL`: `'http://localhost:5000'`
* `PRODUCTION_API_BASE_URL`: `'http://3.108.53.179:5000'`
* When loaded over HTTPS on Vercel (`vercel.app`), the client automatically makes same-origin relative `/api/...` requests to eliminate browser Mixed Content blocking.

### 5.2 Edge Rewrite Configuration (`frontend/vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://3.108.53.179/api/:path*"
    }
  ]
}
```

---

## 6. HTTPS Architecture & Practical Options

### 6.1 The Mixed Content Challenge
Modern browsers (Chrome, Edge, Firefox, Safari) enforce strict Mixed Content policies: an HTTPS frontend (`https://...`) is forbidden from initiating insecure HTTP (`http://...`) requests directly.

### 6.2 Implemented Solution: Vercel HTTPS Edge Reverse Proxy
The verified architecture routes client requests over HTTPS to Vercel's edge, which proxies the request to EC2:
`Browser (HTTPS) ➔ Vercel Edge Proxy (HTTPS) ➔ Nginx on EC2 (HTTP:80) ➔ Express (HTTP:5000) ➔ MongoDB Atlas (TLS)`

### 6.3 Direct HTTPS on EC2 (Optional Future Path)
If direct HTTPS to EC2 is required without the Vercel proxy rewrite:
1. **Assign a Custom Domain:** Point a domain name (e.g., `api.yourdomain.com`) to `3.108.53.179` via DNS A-record.
2. **Obtain a TLS Certificate:** Free certificate via Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```
3. **Nginx SSL Configuration:** Certbot configures port 443 with automated certificate renewal.
*(Note: Let's Encrypt does not issue certificates for raw IP addresses or AWS default `.compute.amazonaws.com` hostnames.)*

---

## 7. Security & Firewall Rules

1. **EC2 Security Group:**
   - **Port 22 (SSH):** Administrator access.
   - **Port 80 (HTTP):** Inbound web traffic for Nginx reverse proxy.
   - **Port 5000:** Node.js Express direct port.
2. **MongoDB Atlas Network Access:**
   - EC2 Public IP (`3.108.53.179`) is whitelisted in Atlas Network Access.
3. **Express CORS Rules:**
   - Validates `http://localhost:3000`, `https://producthub-frontend-two.vercel.app`, and project preview subdomains (`^product-?hub(-[a-z0-9_-]+)*\.vercel\.app$`).
