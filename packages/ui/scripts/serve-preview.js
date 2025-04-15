#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3456;
const PREVIEW_DIR = path.join(__dirname, '../preview');
const DIST_DIR = path.join(__dirname, '../dist');

// Ensure the dist directory exists and CSS is built
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.css'))) {
  console.log('Building CSS...');
  exec('pnpm build', { cwd: path.join(__dirname, '..') }, (error) => {
    if (error) {
      console.error('Error building CSS:', error);
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  const server = http.createServer((req, res) => {
    let filePath = req.url === '/' 
      ? path.join(PREVIEW_DIR, 'index.html')
      : path.join(__dirname, '..', req.url);
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
  
  server.listen(PORT, () => {
    console.log(`UI Component Preview running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
    
    // Open the browser
    const url = `http://localhost:${PORT}`;
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${command} ${url}`);
  });
}
