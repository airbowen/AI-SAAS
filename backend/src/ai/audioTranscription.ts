import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface UserConnection {
  ws: WebSocket;
  userId: string;
  lastActivity: number;
}

class AudioTranscriptionServer {
  private wss: WebSocketServer;
  private connections: Map<string, UserConnection>;
  private readonly heartbeatInterval = 30000;
  private prisma: PrismaClient;

  constructor() {
    // 使用环境变量中的端口
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    this.wss = new WebSocketServer({ port });
    this.connections = new Map();
    this.prisma = new PrismaClient();
    this.setupWebSocket();
    this.setupHeartbeat();
    
    console.log(`WebSocket server started on port ${port}`);
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      const userId = await this.authenticateUser(req);
      if (!userId) {
        ws.close(1008, 'Authentication failed');
        return;
      }

      const connection: UserConnection = {
        ws,
        userId,
        lastActivity: Date.now()
      };

      this.connections.set(userId, connection);
      console.log(`User ${userId} connected. Total connections: ${this.connections.size}`);

      ws.on('message', async (data) => {
        try {
          connection.lastActivity = Date.now();
          // 处理音频数据
          const response = { type: 'feedback', message: '收到音频数据' };
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
        }
      });

      ws.on('close', () => {
        this.connections.delete(userId);
        console.log(`User ${userId} disconnected. Remaining connections: ${this.connections.size}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        this.connections.delete(userId);
      });
    });
  }

  private setupHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      this.connections.forEach((connection, userId) => {
        if (now - connection.lastActivity > this.heartbeatInterval * 2) {
          console.log(`Closing inactive connection for user ${userId}`);
          connection.ws.close(1000, 'Connection timeout');
          this.connections.delete(userId);
        } else if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.ping();
        }
      });
    }, this.heartbeatInterval);
  }

  private async authenticateUser(req: any): Promise<string | null> {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return null;

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      return decoded.userId;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
}

// 创建服务器实例
const server = new AudioTranscriptionServer();