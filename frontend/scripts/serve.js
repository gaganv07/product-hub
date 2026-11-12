/**
 * ProductHub Frontend - Local Development Preview Server
 * Zero-dependency static file server using Node.js standard library.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Normalize URL path
  let safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT, safePath);

  // Security check: ensure path stays within ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ STARTUP ERROR: Port ${PORT} is already in use.`);
    console.error(`👉 If the ProductHub frontend server is already running, open http://localhost:${PORT}`);
    console.error(`👉 To stop the existing process on Windows PowerShell:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen).OwningProcess -Force`);
    console.error(`👉 Or run on another port: $env:PORT="3001"; npm start\n`);
    process.exit(1);
  }
  console.error('❌ Frontend server error:', err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 ProductHub Frontend Preview Server`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Serving:   ${ROOT}`);
  console.log('====================================================');
  console.log('Press Ctrl+C to stop.');
});

