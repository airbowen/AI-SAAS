import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// 添加 JWT payload 类型定义
interface JwtPayload {
  userId: string;
  // 其他可能的 payload 字段
}

interface UserConnection {
  ws: WebSocket;
  gpt4oWs: WebSocket;
  userId: string;
  lastActivity: number;
  audioStartTime: number;      // 记录音频开始时间
  totalDuration: number;       // 累计音频时长
  totalTokens: number;         // 累计消耗的 tokens
}

class AudioTranscriptionServer {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket>;
  private readonly heartbeatInterval = 30000; // 30秒心跳间隔

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.connections = new Map();
    this.setupWebSocket();
    this.setupHeartbeat();
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      const userId = await this.authenticateUser(req);
      if (!userId) {
        ws.close();
        return;
      }

      // 存储连接
      this.connections.set(userId, ws);

      ws.on('message', (data) => {
        // 处理消息
      });

      ws.on('close', () => {
        this.connections.delete(userId);
      });
    });
  }

  private setupHeartbeat() {
    setInterval(() => {
      this.connections.forEach((ws, userId) => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        } else {
          this.connections.delete(userId);
        }
      });
    }, this.heartbeatInterval);
  }

  private async authenticateUser(req: any): Promise<string | null> {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return null;

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      return decoded.userId;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
}