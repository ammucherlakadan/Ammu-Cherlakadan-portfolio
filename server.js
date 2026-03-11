/**
 * server.js — Portfolio dev server for Ammu Cherlakadan
 * Zero dependencies. Run with:  node server.js
 *
 * Serves static files AND a tiny /api/images endpoint so the
 * gallery auto-loads whatever is in each images/ subfolder.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = 3456;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css',
  '.js':    'application/javascript',
  '.json':  'application/json',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.png':   'image/png',
  '.webp':  'image/webp',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.webp', '.WEBP']);

// ── Security: keep all paths inside ROOT ──────────────────────
function isSafe(p) {
  return p.startsWith(ROOT + path.sep) || p === ROOT;
}

const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname);

  // ── API: list images in a folder ──────────────────────────
  if (pathname === '/api/images') {
    const folder = parsed.query.folder;
    if (!folder) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing ?folder= parameter');
      return;
    }

    const folderPath = path.join(ROOT, folder);
    if (!isSafe(folderPath)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end('[]');
        return;
      }

      // Only return image files, sorted alphabetically
      const images = files
        .filter(f => IMAGE_EXTENSIONS.has(path.extname(f)))
        .sort((a, b) => a.localeCompare(b));

      res.writeHead(200, {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':               'no-cache',
      });
      res.end(JSON.stringify(images));
    });
    return;
  }

  // ── Static file serving ───────────────────────────────────
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);

  if (!isSafe(filePath)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // If path looks like a directory, try index.html inside it
  if (!path.extname(filePath)) filePath = path.join(filePath, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + pathname);
      return;
    }
    const ext         = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✦ Portfolio server running');
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
  console.log('  Drop images into any images/ subfolder and refresh —');
  console.log('  the gallery updates automatically. No edits needed.');
  console.log('');
});
