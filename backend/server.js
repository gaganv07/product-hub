const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const { getDashboardStats } = require('./controllers/productController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// Health Check API
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const isConnected = dbStatus === 1;

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    application: 'ProductHub - Cloud-Based Product Catalogue',
    status: isConnected ? 'Healthy' : 'Database Unavailable',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: statusMap[dbStatus] || 'Disconnected',
      name: 'product_catalogue_db'
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  });
});

// Dashboard Statistics Route
app.get('/api/dashboard/stats', getDashboardStats);

// Product REST API Routes
app.use('/api/products', productRoutes);

// Fallback for non-API routes (serves index.html if present, else API status)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found.`,
      error: 'Not Found'
    });
  }
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).json({
    success: true,
    application: 'ProductHub Backend REST API',
    message: 'API server is running. Use /api/health or /api/products endpoints.'
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
// Only start listening if executed directly and not under a test harness
if (require.main === module && process.env.NODE_ENV !== 'test') {
  connectDB().then((conn) => {
    if (!conn && process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start server: MongoDB Atlas connection failed in production mode.');
      process.exit(1);
    }

    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 ProductHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🌐 Local Web URL: http://localhost:${PORT}`);
      console.log(`🩺 Health API:    http://localhost:${PORT}/api/health`);
      console.log(`📦 Products API:  http://localhost:${PORT}/api/products`);
      console.log(`====================================================`);
    });

    // Handle port collisions and startup errors gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n====================================================`);
        console.error(`❌ STARTUP ERROR: Port ${PORT} is already in use.`);
        console.error(`====================================================`);
        console.error(`👉 Another instance of ProductHub (or another process) is already listening on port ${PORT}.`);
        console.error(`👉 Action required:`);
        console.error(`   - To stop the existing instance on Windows:`);
        console.error(`     1. Find PID: (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess`);
        console.error(`     2. Stop it:  Stop-Process -Id <PID> -Force`);
        console.error(`   - Or start on an alternate port:`);
        console.error(`     PowerShell:  $env:PORT="5001"; npm start`);
        console.error(`     CMD:         set PORT=5001 && npm start`);
        console.error(`     Linux/macOS: PORT=5001 npm start`);
        console.error(`====================================================\n`);
        process.exit(1);
      } else {
        console.error(`❌ Server startup error:`, err.message);
        process.exit(1);
      }
    });
  }).catch((err) => {
    console.error(`❌ Database startup error:`, err.message);
    process.exit(1);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down ProductHub server gracefully...`);
    if (server) {
      server.close(async () => {
        console.log('HTTP server stopped.');
        const { disconnectDB } = require('./config/database');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

module.exports = { app, server };

