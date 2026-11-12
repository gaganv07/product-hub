# ProductHub – Comprehensive AWS EC2 & MongoDB Atlas Cloud Deployment Guide

This production guide provides complete, step-by-step instructions for deploying **ProductHub** on an **Amazon Web Services (AWS) EC2 Ubuntu Linux Virtual Machine** connected to **MongoDB Atlas Cloud**.

---

## 1. Cloud Architecture & Infrastructure Prerequisites

* **AWS Free Tier Eligible Virtual Machine:** `t2.micro` (1 vCPU, 1 GB RAM) or `t3.small` (2 vCPUs, 2 GB RAM).
* **Operating System:** Ubuntu Server 22.04 LTS (Jammy Jellyfish) or 24.04 LTS (Noble Numbat) 64-bit (x86).
* **Storage:** 15 GB – 30 GB General Purpose SSD (gp3 EBS volume).
* **Cloud Database:** MongoDB Atlas (M0 Free Tier or Dedicated Cluster).
* **Process Manager:** PM2 with systemd persistence.
* **Reverse Proxy & Web Server:** Nginx 1.18+ with HTTP/2 and Gzip compression.
* **SSL/TLS Security:** Let's Encrypt automated certificates via Certbot.

---

## 2. AWS EC2 Security Group Configuration

Create or update an EC2 Security Group (e.g. `producthub-security-group`) with the following strict network rules:

### Inbound Security Rules

| Type | Protocol | Port Range | Source | Description / Justification |
| :--- | :---: | :---: | :---: | :--- |
| **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Secure terminal administration via RSA/ED25519 key pair. |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Public web traffic routed to Nginx reverse proxy. |
| **HTTPS**| TCP | `443`| `0.0.0.0/0` | Encrypted web traffic with TLS/SSL. |
| **Custom TCP** | TCP | `5000` | Restricted / Optional | Direct testing port. Blocked in production (Nginx reverse proxies internally). |

### Outbound Security Rules

| Type | Protocol | Port Range | Destination | Description / Justification |
| :--- | :---: | :---: | :---: | :--- |
| **All Traffic** | All | `All` | `0.0.0.0/0` | Required for APT updates, npm installs, Certbot challenges, and outbound MongoDB Atlas SRV traffic (Port `27017`). |

---

## 3. MongoDB Atlas Cluster Configuration

Before launching the EC2 instance, configure network access and security in MongoDB Atlas:

### Step 3.1: Create Dedicated Database User
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Security** &rarr; **Database Access** &rarr; **Add New Database User**.
3. **Authentication Method:** Password.
4. **Username:** `producthub_admin`.
5. **Password:** Generate a secure alphanumeric password (avoid special characters like `@`, `:`, `/` in passwords or URL-encode them).
6. **User Privileges:** `Read and write to any database` (Built-in Role).
7. Click **Add User**.

### Step 3.2: Configure Atlas Network Access (IP Whitelist)
1. Navigate to **Security** &rarr; **Network Access** &rarr; **Add IP Address**.
2. **Options:**
   * **Recommended for Elastic IP:** Enter `<YOUR_EC2_ELASTIC_IP>/32` (restricts database access strictly to your EC2 instance).
   * **Initial Setup / Dynamic IP:** Enter `0.0.0.0/0` (Allow Access from Anywhere) with description `AWS EC2 WebServer Access`.
3. Click **Confirm** and wait 30–60 seconds for cluster state to update to `Active`.

### Step 3.3: Obtain Cluster Connection String
1. Navigate to **Deployment** &rarr; **Database** &rarr; Click **Connect** on your cluster.
2. Select **Drivers** (Node.js).
3. Copy the standard SRV connection string:
   ```text
   mongodb+srv://producthub_admin:<password>@cluster0.abcde.mongodb.net/product_catalogue?retryWrites=true&w=majority
   ```

---

## 4. Launching & Connecting to AWS EC2 Ubuntu Instance

### Step 4.1: Launch Instance
1. Open the **AWS Management Console** &rarr; **EC2** &rarr; **Launch Instance**.
2. **Name:** `ProductHub-WebServer`.
3. **AMI:** `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`.
4. **Instance Type:** `t2.micro` (or `t3.small`).
5. **Key Pair:** Select your `.pem` key pair (e.g. `producthub-key.pem`).
6. **Network Settings:** Select the security group created in Section 2.
7. Click **Launch Instance**.

### Step 4.2: Connect via SSH
On your local computer (Linux, macOS, or Windows PowerShell):
```bash
# Set file permissions (Linux/macOS)
chmod 400 producthub-key.pem

# Connect to the EC2 VM
ssh -i "producthub-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 5. Provisioning Ubuntu Environment (Exact Linux Commands)

Execute the following commands sequentially inside the EC2 terminal:

```bash
# 1. Update system package repositories
sudo apt update && sudo apt upgrade -y

# 2. Install essential system utilities and Git
sudo apt install -y curl git build-essential ufw net-tools

# 3. Add NodeSource Node.js 22.x LTS repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# 4. Install Node.js (includes npm)
sudo apt install -y nodejs

# 5. Verify Node.js and npm versions
node -v   # Expected: v22.x.x
npm -v    # Expected: 10.x.x+
git --version

# 6. Install PM2 process manager globally
sudo npm install -g pm2

# 7. Install Nginx web server
sudo apt install -y nginx
```

---

## 6. Cloning & Configuring ProductHub

```bash
# 1. Clone repository to standard application directory
git clone https://github.com/<your-github-username>/ProductHub.git /home/ubuntu/ProductHub

# 2. Enter project directory
cd /home/ubuntu/ProductHub

# 3. Install production dependencies (skips devDependencies for fast, clean install)
npm install --omit=dev

# 4. Create production environment file (.env)
cp .env.example .env
nano .env
```

### Production `.env` File Content:
```env
# Production Environment Settings
PORT=5000
NODE_ENV=production

# MongoDB Atlas Cluster URI (Replace with your actual Atlas credentials)
MONGODB_URI=mongodb+srv://producthub_admin:YourRealPassword123@cluster0.abcde.mongodb.net/product_catalogue?retryWrites=true&w=majority
```
*(Press `Ctrl + O`, `Enter` to write changes, and `Ctrl + X` to exit nano)*.

---

## 7. Seeding Sample Product Documents into MongoDB Atlas

Populate the database with the initial 12 sample product documents:
```bash
cd /home/ubuntu/ProductHub
npm run seed
```

**Expected Console Output:**
```text
🌱 Starting ProductHub database seeding process...
📡 Connecting to MongoDB Atlas cluster...
✅ MongoDB Atlas Connected: cluster0-shard-00-00.abcde.mongodb.net
📁 Database Name: product_catalogue
📦 Loaded 12 sample products from sample-products.json
➕ Added new product: [P1001] Dell Inspiron 15 3520
...
🎉 Seeding completed successfully!
   - Total Products in MongoDB Atlas: 12
```

---

## 8. PM2 Process Management Configuration

ProductHub includes an optimized [`ecosystem.config.js`](file:///d:/cloudcomputing/ecosystem.config.js) that configures memory caps, restart delays, and log paths.

```bash
# 1. Start application with PM2 using production environment
cd /home/ubuntu/ProductHub
pm2 start ecosystem.config.js --env production

# 2. Check process status
pm2 status

# 3. View live server logs
pm2 logs producthub --lines 20

# 4. Configure PM2 to restart automatically on system reboot
pm2 startup systemd
```
*(Copy and execute the `sudo env PATH=$PATH...` command generated in your terminal)*

```bash
# 5. Save the current process list
pm2 save
```

---

## 9. Nginx Reverse Proxy Configuration

Nginx receives incoming port 80/443 traffic and forwards it internally to `http://127.0.0.1:5000`.

### Step 9.1: Copy Nginx Configuration File
```bash
# Copy the provided configuration to sites-available
sudo cp /home/ubuntu/ProductHub/docs/nginx-producthub.conf /etc/nginx/sites-available/producthub

# Enable site by creating symlink in sites-enabled
sudo ln -s /etc/nginx/sites-available/producthub /etc/nginx/sites-enabled/

# Remove default Nginx welcome page
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration syntax
sudo nginx -t
# Output must show: syntax is ok and test is successful

# Restart Nginx service
sudo systemctl restart nginx
```

---

## 10. Configure Ubuntu UFW Firewall

Ensure local firewall protection on Ubuntu:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 11. (Optional) Domain & SSL/TLS Encryption with Let's Encrypt

If pointing a custom domain (e.g. `catalogue.yourcollege.edu`) to the EC2 Elastic IP:

```bash
# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain and install SSL certificate automatically
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Test automatic certificate renewal
sudo certbot renew --dry-run
```

---

## 12. Post-Deployment Verification Checklist

Once deployment is complete, navigate to `http://<YOUR_EC2_PUBLIC_IP>` in your browser and verify:

* [ ] **Dashboard Load:** Confirms top database indicator says **"Atlas Online"** with a green pulse dot.
* [ ] **Catalogue Rendering:** All 12 sample product cards display images, prices in ₹, stock badges, and nested specifications.
* [ ] **Search Verification:** Searching for `"Dell"` or `"Snapdragon"` returns matching items from MongoDB Atlas.
* [ ] **Add Product (Create):** Create a new product (e.g. `P2001`, `Test Laptop`, `₹45000`). Verify instant appearance in catalogue.
* [ ] **Edit Product (Update):** Edit product `P2001`, change price to `₹42000`, save and verify update in database.
* [ ] **Delete Product (Delete):** Delete product `P2001`, confirm deletion modal, verify record is removed.
* [ ] **Health Endpoint:** Access `http://<YOUR_EC2_PUBLIC_IP>/api/health` directly to view uptime, system memory, and database host.

---

## 13. Production Diagnostic & Troubleshooting Runbook

### Issue 1: `querySrv ENOTFOUND` or DNS Resolution Failure
* **Cause:** The EC2 VM's DNS resolver cannot resolve MongoDB Atlas SRV records.
* **Resolution:** Edit `/etc/resolv.conf` or netplan to include Google public DNS:
  ```bash
  sudo resolvectl dns eth0 8.8.8.8 8.8.4.4
  ```

### Issue 2: `MongoServerError: bad auth : authentication failed`
* **Cause:** Incorrect username or password in `.env`.
* **Resolution:** Verify username and password in MongoDB Atlas &rarr; Database Access. Avoid special characters like `@` or `#` in the password, or URL-encode them (`%40` for `@`).

### Issue 3: `MongooseServerSelectionError: connection timed out`
* **Cause:** EC2 instance IP is not whitelisted in MongoDB Atlas Network Access.
* **Resolution:** Add EC2 IP in Atlas &rarr; Network Access &rarr; Add IP Address (`0.0.0.0/0` or `<EC2_IP>/32`).

### Issue 4: Port 5000 In Use
* **Command:** `sudo lsof -i :5000` or `sudo kill -9 <PID>`.

---

## 14. Routine Maintenance Cheat Sheet

```bash
# Check PM2 process status
pm2 status

# Tail live application logs
pm2 logs producthub

# Restart Node.js application
pm2 restart producthub

# Monitor CPU and memory usage in real time
pm2 monit

# Inspect Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Pull updates and redeploy with single command
./scripts/deploy-ec2.sh
```
