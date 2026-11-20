# ProductHub – Current Production Deployment Guide

This document describes the deployment that is actually running now. ProductHub uses Vercel for the static frontend, Render for the Express API, and MongoDB Atlas for the document database.

## 1. Production topology

| Layer | Service | URL / configuration |
|---|---|---|
| Frontend | Vercel | https://producthub-frontend-two.vercel.app |
| Backend | Render web service `producthub-api` | https://producthub-api-da3l.onrender.com |
| Database | MongoDB Atlas | Project: `ProductHub-Production`; cluster: `ProductHubCluster` |
| Database / collection | MongoDB | `product_catalogue.products` |

The frontend production API base URL is configured in `frontend/js/config.js`. The Render service receives its database connection string through its environment configuration. Never commit `.env`, credentials, or a full MongoDB URI to GitHub.

## 2. Deploying the frontend on Vercel

1. Import the GitHub repository `gaganv07/product-hub` into Vercel.
2. Set the project root directory to `frontend`.
3. Confirm the production API origin in `frontend/js/config.js` points to `https://producthub-api-da3l.onrender.com`.
4. Deploy the production branch.
5. Open https://producthub-frontend-two.vercel.app and verify the dashboard, catalogue, product search, and connection indicator.

## 3. Deploying the Express API on Render

1. Create a Render **Web Service** from GitHub repository `gaganv07/product-hub`.
2. Set the service root directory to `backend`.
3. Select the Node runtime.
4. Use the install/build configuration required by the repository; the start command is `npm start`.
5. Configure environment variables in Render's Environment panel. At minimum:
   - `NODE_ENV=production`
   - `MONGODB_URI` = the MongoDB Atlas SRV URI targeting `product_catalogue`
   - `CORS_ORIGIN` = the deployed Vercel frontend origin, if required by the backend CORS configuration
   - `PORT` is assigned by Render; the server must listen on `process.env.PORT`
6. Deploy and inspect Render logs. Never paste secrets into source control or screenshots.
7. Verify:
   - Root: https://producthub-api-da3l.onrender.com
   - Health: https://producthub-api-da3l.onrender.com/api/health
   The health response should report a healthy server and a connected `product_catalogue` database.

## 4. MongoDB Atlas configuration

1. Use the Atlas project `ProductHub-Production` and active cluster `ProductHubCluster`.
2. Database: `product_catalogue`; collection: `products`.
3. Create a database user with the minimum required role. Prefer `readWrite` scoped only to `product_catalogue`; avoid `readWriteAnyDatabase`.
4. In Network Access, allow the Render service's outbound addresses as required by the current Render plan. If using Render's shared outbound ranges, add only the published ranges relevant to the service's region. Avoid leaving `0.0.0.0/0` enabled as a permanent production rule.
5. Store the URI only in Render's secret environment variable configuration.

## 5. Production acceptance tests

- Open the Vercel frontend and confirm the database status indicator is connected.
- Confirm the dashboard displays 12 products.
- Confirm catalogue displays 12 of 12 products.
- Search for a known item such as Dell.
- Create a temporary test product with a unique ID, update it, and delete it.
- Confirm the temporary item is gone and the sample catalogue remains at 12.
- Verify `/api/health` after deployment.
- Capture screenshots with the browser address bar visible, while excluding credentials and private configuration.

## 6. Current deployment limitations and pending EC2 path

**Important:** AWS EC2 has not been created. The earlier AWS account registration did not complete, so the project does not currently run on an Ubuntu VM. Do not describe the current production deployment as EC2, Nginx, or PM2 hosting.

If the assignment strictly requires an IaaS VM, the remaining work is:
1. Complete AWS account activation or use an approved cloud VM provider.
2. Launch Ubuntu 22.04/24.04 and restrict SSH to the administrator's IP.
3. Install Git, Node.js, and npm.
4. Deploy the backend repository to the VM and configure secrets outside source control.
5. Add the VM's stable outbound IP to Atlas Network Access.
6. Run the Express API with a process manager such as PM2.
7. Configure Nginx as a reverse proxy and enable HTTPS.
8. Test the VM-hosted API and update the frontend API origin only if migrating production traffic.
9. Capture the VM, security group, service, and application screenshots.

Do not create or expose cloud credentials, private SSH keys, or database passwords in project documentation.

## 7. Troubleshooting

- **API health is unavailable:** inspect Render deploy status and runtime logs.
- **Database reports disconnected:** verify the Render `MONGODB_URI`, Atlas database user privileges, and Atlas Network Access rules.
- **Frontend shows a network/CORS error:** verify the configured API origin and the backend CORS allowlist.
- **Catalogue count differs from 12:** inspect `product_catalogue.products` in Atlas before running any seed or delete operation. Back up/export current data before destructive changes.
