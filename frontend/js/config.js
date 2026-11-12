/**
 * ProductHub - Frontend Configuration Module
 *
 * Provides client-side configuration for the ProductHub catalogue interface.
 * Configures the backend REST API base URL and connection options.
 *
 * ============================================================================
 * CONFIGURATION BEHAVIOR
 * ============================================================================
 * 1. RUNTIME OVERRIDE (Highest Priority):
 *    - window.PRODUCTHUB_CONFIG.API_BASE_URL (e.g. injected by deployment script)
 *    - localStorage.getItem('PRODUCTHUB_API_URL')
 *
 * 2. LOCAL DEVELOPMENT (localhost / 127.0.0.1):
 *    - Automatically targets 'http://localhost:5000'
 *
 * 3. PRODUCTION DEPLOYMENT (Non-localhost):
 *    - Uses configurable PRODUCTION_API_BASE_URL (default '' for same-origin
 *      Nginx reverse proxy, or set to your deployed backend API origin).
 *    - Localhost is never hardcoded as the production API address.
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

  var LOCAL_DEV_API_URL = 'http://localhost:5000';
  // Configure your production backend URL here or via window.PRODUCTHUB_CONFIG.API_BASE_URL.
  // Empty string ('') uses same-origin relative '/api/...' routes (e.g. behind Nginx).
  var PRODUCTION_API_BASE_URL = '';

  function resolveApiBaseUrl() {
    if (typeof window !== 'undefined') {
      if (window.PRODUCTHUB_CONFIG && typeof window.PRODUCTHUB_CONFIG.API_BASE_URL === 'string') {
        return window.PRODUCTHUB_CONFIG.API_BASE_URL;
      }
      try {
        var storedUrl = window.localStorage && window.localStorage.getItem('PRODUCTHUB_API_URL');
        if (storedUrl) {
          return storedUrl;
        }
      } catch (e) {
        // Ignore storage access errors in restricted contexts
      }

      var host = window.location && window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return LOCAL_DEV_API_URL;
      }
      return PRODUCTION_API_BASE_URL;
    }

    // Node.js test environment fallback
    return LOCAL_DEV_API_URL;
  }

  var config = {
    API_BASE_URL: resolveApiBaseUrl(),
    LOCAL_DEV_API_URL: LOCAL_DEV_API_URL,
    PRODUCTION_API_BASE_URL: PRODUCTION_API_BASE_URL,
    REQUEST_TIMEOUT_MS: 10000,
    APP_NAME: 'ProductHub',
    APP_VERSION: '1.0.0',
    DESCRIPTION: 'Cloud-Based Product Catalogue Frontend'
  };

  if (typeof Object.freeze === 'function') {
    Object.freeze(config);
  }

  return config;
});
