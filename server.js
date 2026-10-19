
const http = require('http');
const fs = require('fs');
const path = require('path');
const client = require('prom-client');

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.join(__dirname, 'pages', 'Chaitanya');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'petpal_http_requests_total',
  help: 'Total HTTP requests received by PetPal',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function getFilePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  const requested = cleanPath === '/' ? '/index.html' : cleanPath;
  const filePath = path.resolve(BASE_DIR, `.${requested}`);

  return filePath.startsWith(BASE_DIR + path.sep)
    ? filePath
    : null;
}

const server = http.createServer(async (req, res) => {
  const route = req.url.split('?')[0];

  if (route === '/metrics') {
    try {
      const metrics = await register.metrics();
      res.writeHead(200, {
        'Content-Type': register.contentType
      });
      return res.end(metrics);
    } catch (error) {
      res.writeHead(500);
      return res.end('Unable to collect metrics');
    }
  }

  res.once('finish', () => {
    httpRequests.inc({
      method: req.method,
      route,
      status: String(res.statusCode)
    });
  });

  let filePath;

  try {
    filePath = getFilePath(req.url);
  } catch {
    res.writeHead(400, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    return res.end('400 Bad Request');
  }

  if (!filePath) {
    res.writeHead(403, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    return res.end('403 Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      return res.end(
        err.code === 'ENOENT' ? '404 Not Found' : '500 Server Error'
      );
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    res.end(content);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`PetPal running at http://localhost:${PORT}`);
  });
}

module.exports = server;
