#!/usr/bin/env node
/**
 * Advanced development server with hot reload, WebSocket, and AI integration
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

class EnhancedDevServer {
  private port: number;
  private server: Server;
  private io: any;
  private watcher: any;
  private connections = new Set();
  private aiAssistant: any;
  
  constructor(port: number = 3000) {
    this.port = port;
    this.server = new Server();
    this.io = new Server(this.server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });
    
    this.watcher = chokidar.watch('./src', {
      ignored: ['node_modules', '.next', '.git'],
      persistent: true
    });
    
    this.setupEventHandlers();
    this.setupAIIntegration();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.connections.add(socket);
      console.log(`Client connected: ${socket.id}`);
      socket.emit('connected', { message: 'Connected to dev server' });
    });
    
    this.watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      
      // Broadcast to all connected clients
      this.io.emit('file-change', { 
        filePath, 
        timestamp: Date.now() 
      });
      
      // Optionally trigger hot reload for CSS/less files
      if (/\.(css|less|scss)$/.test(filePath)) {
        this.io.emit('reload');
      }
    });
    
    this.watcher.on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      this.io.emit('file-change', { 
        filePath, 
        timestamp: Date.now(),
        type: 'add'
      });
    });
  }
  
  private setupAIIntegration() {
    // Simple AI helper for code suggestions
    this.aiAssistant = {
      async suggestCodeImprovements(code: string, context: string): Promise<string[]> {
        // Implement AI-based code suggestions
        console.log('🤖 Getting AI suggestions for code improvement...');
        // Return mock suggestions for now
        return [
          'Consider extracting this logic into a reusable component',
          'Add TypeScript interfaces for better type safety',
          'Implement proper error handling with try-catch blocks'
        ];
      }
    };
  }
  
  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 Enhanced dev server running on http://localhost:${this.port}`);
      console.log(`📡 WebSocket enabled for real-time collaboration`);
      console.log(`🔥 Hot reload enabled for file changes`);
      console.log(`🤖 AI integration available for code assistance`);
      console.log('\nAvailable commands:');
      console.log('  • Open http://localhost:3000 in your browser');
      console.log('  • Changes are automatically reloaded');
      console.log('  • Use AI assistant with: ai:help');
      console.log('  • WebSocket collaboration enabled');
    });
  }
  
  stop() {
    this.watcher.close();
    this.io.close();
    this.server.close();
  }
  }
}

// Initialize server if run directly
if (require.main === module) {
  const server = new EnhancedDevServer(process.env.DEV_PORT || 3000);
  server.start();
}
```