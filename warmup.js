/**
 * warmup.js - Azure App Service Warmup Script
 * 
 * Starts an HTTP server IMMEDIATELY (returns 200 to pass health checks)
 * while npm install runs in the background.
 * Once npm install completes, switches to the real server.js
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const wwwroot = '/home/site/wwwroot';

console.log('[WARMUP] Starting warmup server...');

// Start temporary HTTP server immediately so Azure health check passes
const warmupServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Zahrat Beesan - Installing dependencies, starting up...\n');
});

warmupServer.listen(PORT, () => {
  console.log(`[WARMUP] Health check server running on port ${PORT}`);
  
  // Check if node_modules/express already exists
  const expressPath = path.join(wwwroot, 'node_modules', 'express');
  if (fs.existsSync(expressPath)) {
    console.log('[WARMUP] express already installed, switching to main server...');
    switchToMainServer();
    return;
  }
  
  console.log('[WARMUP] Running npm install in background...');
  
  const install = spawn('npm', [
    'install',
    '--omit=dev',
    '--legacy-peer-deps',
    '--no-audit',
    '--no-fund'
  ], {
    cwd: wwwroot,
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('[WARMUP] npm install completed successfully!');
      switchToMainServer();
    } else {
      console.error(`[WARMUP] npm install failed with code ${code}`);
      // Still try to start server even if install failed
      switchToMainServer();
    }
  });
  
  install.on('error', (err) => {
    console.error('[WARMUP] npm install error:', err.message);
    switchToMainServer();
  });
});

function switchToMainServer() {
  console.log('[WARMUP] Closing warmup server and starting main server.js...');
  warmupServer.close(() => {
    console.log('[WARMUP] Warmup server closed. Loading server.js...');
    // Small delay to ensure port is released
    setTimeout(() => {
      try {
        require('./server.js');
      } catch (err) {
        console.error('[WARMUP] Failed to load server.js:', err.message);
        process.exit(1);
      }
    }, 500);
  });
}
