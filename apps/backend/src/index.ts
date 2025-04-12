
import express from 'express';
import { setupVite } from './vite';
import { setupRoutes } from './routes';
import { setupStorage } from './storage';
import { setupWebSocketServer } from './websocket';
import { Server } from 'http';

const app = express();
const server = new Server(app);

async function main() {
  await setupStorage(app);
  await setupRoutes(app);
  
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  }
  
  const port = process.env.PORT || 5000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
  
  setupWebSocketServer(server);
}

main().catch(console.error);
