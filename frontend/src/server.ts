import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
const USE_HTTPS = (process.env.FRONTEND_HTTPS || '').toLowerCase() === '1' || (process.env.FRONTEND_HTTPS || '').toLowerCase() === 'true';
const SSL_CERT_PATH = process.env.FRONTEND_SSL_CERT_PATH;
const SSL_KEY_PATH = process.env.FRONTEND_SSL_KEY_PATH;

// Serve static site from Restaurent directory
const projectRoot = path.resolve(__dirname, '../../');
const staticDir = path.resolve(projectRoot, 'Restaurent');

app.use('/assets', express.static(path.join(staticDir, 'assets')));
app.use('/favicon.svg', express.static(path.join(staticDir, 'favicon.svg')));

// Dedicated pages
app.get('/menu', (_req: any, res: any) => res.sendFile(path.join(staticDir, 'menu.html')));
app.get('/coupon', (_req: any, res: any) => res.sendFile(path.join(staticDir, 'coupon.html')));
app.get('/admin', (_req: any, res: any) => res.sendFile(path.join(staticDir, 'index.html')));
app.get('/thank-you', (_req: any, res: any) => res.sendFile(path.join(staticDir, 'index.html')));

// Proxy API to Rust backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'warn'
}));

// Health
app.get('/health', (_req: any, res: any) => res.json({ ok: true }));

// Serve index.html for root and any non-API path
app.get('*', (_req: any, res: any) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

if (USE_HTTPS && SSL_CERT_PATH && SSL_KEY_PATH && fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  const credentials = {
    cert: fs.readFileSync(SSL_CERT_PATH),
    key: fs.readFileSync(SSL_KEY_PATH)
  };
  https.createServer(credentials, app).listen(PORT, HOST, () => {
    console.log(`Frontend server running on https://${HOST}:${PORT}`);
    console.log(`Proxying /api -> ${BACKEND_URL}`);
  });
} else {
  if (USE_HTTPS) {
    console.warn('[frontend] HTTPS requested but cert or key missing; falling back to HTTP');
  }
  http.createServer(app).listen(PORT, HOST, () => {
    console.log(`Frontend server running on http://${HOST}:${PORT}`);
    console.log(`Proxying /api -> ${BACKEND_URL}`);
  });
}


