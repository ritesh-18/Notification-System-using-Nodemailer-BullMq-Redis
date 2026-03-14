const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND = 'http://localhost:7777';

// Proxy all /api/* requests to the backend (strips /api prefix)
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  })
);

// Serve static files from this directory
app.use(express.static(__dirname));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✦ Frontend  →  http://localhost:${PORT}`);
  console.log(`  ✦ Backend   →  ${BACKEND}`);
  console.log(`  ✦ Dashboard →  ${BACKEND}/admin/queues\n`);
});
