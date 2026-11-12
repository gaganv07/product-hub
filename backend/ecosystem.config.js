/**
 * PM2 Process Manager Configuration File for ProductHub
 * Used for AWS EC2 Ubuntu Linux Production Deployment
 */

module.exports = {
  apps: [
    {
      name: 'producthub',
      script: 'server.js',
      cwd: '/home/ubuntu/ProductHub',
      instances: 1, // Single instance for t2.micro / t3.small; set to 'max' for multi-core instances
      autorestart: true,
      watch: false, // Do not watch files in production
      max_memory_restart: '350M', // Auto-restart if memory exceeds 350MB (safe for 1GB RAM VM)
      restart_delay: 3000, // Wait 3s before restarting on crash to prevent crash loops
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};

