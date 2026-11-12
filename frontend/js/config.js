/**
 * ProductHub - Frontend Configuration Module
 * 
 * Provides client-side configuration for the ProductHub catalogue interface.
 * Configures the backend REST API base URL and connection options.
 * 
 * ============================================================================
 * CONFIGURATION INSTRUCTIONS
 * ============================================================================
 * 1. BACKEND DEPLOYMENT PLACEHOLDER:
 *    By default, 'API_BASE_URL' is set to 'BACKEND_API_PLACEHOLDER'.
 *    Once your backend VM or container is launched, replace this placeholder with
 *    your backend host, for example:
 *      - AWS EC2:      'http://<YOUR_EC2_PUBLIC_IP>:5000'
 *      - Custom Domain: 'https://api.yourdomain.com'
 *      - Local Dev:     'http://localhost:5000'
 * 
 * 2. REVERSE PROXY / SAME ORIGIN:
 *    If your frontend and backend are served from the same domain/origin via Nginx:
 *    Set 'API_BASE_URL: ''' (an empty string).
 *    All calls will automatically use relative paths like '/api/products'.
 * 
 * 3. RUNTIME OVERRIDE WITHOUT REBUILD:
 *    You can also override the API URL at runtime in the browser console or via an
 *    inline script tag before loading config.js:
 *      window.PRODUCTHUB_CONFIG = { API_BASE_URL: 'http://<EC2-IP>:5000' };
 *    Or via localStorage:
 *      localStorage.setItem('PRODUCTHUB_API_URL', 'http://<EC2-IP>:5000');
 * ============================================================================
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js / CommonJS environment (for automated tests)
    module.exports = factory();
  } else {
    // Browser global environment
    root.CONFIG = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Read runtime overrides if available
  var runtimeOverride = (typeof window !== 'undefined' && window.PRODUCTHUB_CONFIG && window.PRODUCTHUB_CONFIG.API_BASE_URL)
    ? window.PRODUCTHUB_CONFIG.API_BASE_URL
    : (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('PRODUCTHUB_API_URL'))
      ? window.localStorage.getItem('PRODUCTHUB_API_URL')
      : null;

  var config = {
    /**
     * Backend REST API Base URL
     * Default: 'BACKEND_API_PLACEHOLDER'
     * Replace with your deployed backend URL (e.g. 'http://<EC2_PUBLIC_IP>:5000')
     */
    API_BASE_URL: runtimeOverride || 'BACKEND_API_PLACEHOLDER',

    /**
     * Request Timeout in Milliseconds
     */
    REQUEST_TIMEOUT_MS: 10000,

    /**
     * Application Metadata
     */
    APP_NAME: 'ProductHub',
    APP_VERSION: '1.0.0',
    DESCRIPTION: 'Cloud-Based Product Catalogue Frontend'
  };

  if (typeof Object.freeze === 'function') {
    Object.freeze(config);
  }

  return config;
});

