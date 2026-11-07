/**
 * Lightweight Local Development Server
 * Scholar Q&A Website
 * Serves static files with correct MIME types and clean URLs.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Normalize request URL
  const cleanUrl = req.url.split('?')[0].split('#')[0];
  let relativePath = cleanUrl === '/' ? '/index.html' : cleanUrl;
  
  // Clean URL support: if /topics, serve /topics.html
  if (!path.extname(relativePath) && !relativePath.endsWith('/')) {
    if (fs.existsSync(path.join(ROOT, relativePath + '.html'))) {
      relativePath += '.html';
    }
  }

  let filePath = path.join(ROOT, relativePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Not Found
      const notFoundPath = path.join(ROOT, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(` Scholar Q&A Website running at: http://localhost:${PORT}`);
  console.log(` - Home:      http://localhost:${PORT}/index.html`);
  console.log(` - Biography: http://localhost:${PORT}/biography.html`);
  console.log(` - Q&A Index: http://localhost:${PORT}/topics.html`);
  console.log(` - Contact:   http://localhost:${PORT}/contact.html`);
  console.log(` - Donate:    http://localhost:${PORT}/donate.html`);
  console.log(`====================================================`);
});

