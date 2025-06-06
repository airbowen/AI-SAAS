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
  private connections: Map<string, UserConnection>;
  private readonly maxConnections: number;
  private readonly connectionTimeout: number;
  private prisma: PrismaClient;
  private readonly costPerMinute: number = 0.1;  // 每分钟计费金额
  private readonly heartbeatInterval = 30000; // 30秒心跳间隔
  private readonly maxConnectionsPerUser = 3;  // 每用户最大连接数

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.connections = new Map();
    this.maxConnections = 1000;
    this.connectionTimeout = 300000;
    this.prisma = new PrismaClient();

    this.initialize();
    this.startConnectionMonitoring();
    this.setupHeartbeat();
    this.setupRateLimiting();
  }

  private async getUserFromToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      // 先检查缓存
      const cachedUser = await getCachedUserInfo(decoded.userId);
      if (cachedUser) {
        return cachedUser;
      }
  
      // 缓存未命中，从数据库获取
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });
  
      if (user) {
        // 存入缓存
        await cacheUserInfo(decoded.userId, user);
      }
  
      return user;
    } catch (error) {
      return null;
    }
  }

  private async checkUserQuota(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.status !== 'active') {
      return false;
    }

    return user.balance > 0 && user.usedQuota < user.quotaLimit;
  }

  private async updateUserQuota(userId: string, duration: number): Promise<void> {
    const cost = (duration / 60) * this.costPerMinute;
    
    await this.prisma.$transaction(async (prisma: PrismaClient) => {
      // 更新用户余额和已使用配额
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: cost },
          usedQuota: { increment: duration / 60 }
        }
      });

      // 记录消费交易
      await prisma.transaction.create({
        data: {
          userId,
          type: 'consume',
          amount: cost,
          description: `Audio transcription service - ${duration} seconds`
        }
      });

      // 记录使用日志
      await prisma.usageLog.create({
        data: {
          userId,
          type: 'audio_transcription',
          duration,
          tokens: Math.floor(duration * 2), // 估算 token 消耗
          cost,
          status: 'success'
        }
      });
    });
  }

  private async initialize() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // 验证用户 Token
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
          ws.close(1008, '未提供认证信息');
          return;
        }

        const user = await this.getUserFromToken(token);
        if (!user) {
          ws.close(1008, '无效的认证信息');
          return;
        }

        // 检查用户配额和余额
        if (!await this.checkUserQuota(user.id)) {
          ws.close(1008, '配额不足或余额不足');
          return;
        }

        // 检查并发连接数限制
        if (this.connections.size >= this.maxConnections) {
          ws.close(1013, '服务器已达到最大连接数限制');
          return;
        }

        const connectionId = uuidv4();
        const gpt4oWs = await this.createGPT4OConnection();

        this.connections.set(connectionId, {
          ws,
          gpt4oWs,
          userId: user.id,
          lastActivity: Date.now(),
          audioStartTime: Date.now(),
          totalDuration: 0,
          totalTokens: 0
        });

        console.log(`新用户连接 - ID: ${connectionId}, 用户: ${user.id}`);

        this.setupWebSocketHandlers(connectionId, ws, gpt4oWs);
      } catch (error) {
        console.error('处理新连接时发生错误:', error);
        ws.close(1011, '服务器内部错误');
      }
    });
  }

  private async checkUserBalance(userId: string, duration: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
  
    if (!user) return false;
  
    const cost = (duration / 60) * this.costPerMinute;
    return user.balance >= cost;
  }
  
  private async updateUserBalance(userId: string, duration: number): Promise<void> {
    const cost = (duration / 60) * this.costPerMinute;
  
    await this.prisma.$transaction(async (prisma: PrismaClient) => {
      // 扣除余额
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: cost },
          usedQuota: { increment: duration / 60 }
        }
      });
  
      // 记录消费
      await prisma.transaction.create({
        data: {
          userId,
          type: 'consume',
          amount: -cost,
          description: `音频转写服务 ${duration} 秒`
        }
      });
  
      // 记录使用情况
      await prisma.usageLog.create({
        data: {
          userId,
          type: 'audio_transcription',
          duration,
          tokens: Math.floor(duration * 2), // 估算token使用量
          cost,
          status: 'success'
        }
      });
    });
  }
  
  // 在 setupWebSocketHandlers 方法中添加余额检查
  private setupWebSocketHandlers(connectionId: string, ws: WebSocket, gpt4oWs: WebSocket) {
    let audioChunkStartTime = Date.now();
    
    ws.on('message', async (data) => {
      try {
        const connection = this.connections.get(connectionId);
        if (!connection) return;
  
        // 检查用户余额
        if (!await this.checkUserBalance(connection.userId, connection.totalDuration)) {
          ws.close(1008, '余额不足');
          return;
        }
  
        // 检查用户配额和余额
        if (!await this.checkUserQuota(connection.userId)) {
          ws.close(1008, '配额不足或余额不足');
          return;
        }

        if (gpt4oWs.readyState === WebSocket.OPEN) {
          gpt4oWs.send(data);
          this.updateLastActivity(connectionId);

          // 更新音频时长（假设每个音频块是 20ms）
          const chunkDuration = (Date.now() - audioChunkStartTime) / 1000;
          connection.totalDuration += chunkDuration;
          audioChunkStartTime = Date.now();
        }
      } catch (error) {
        console.error(`处理音频数据错误 - 连接 ${connectionId}:`, error);
      }
    });

    gpt4oWs.on('message', async (data) => {
      try {
        const response = JSON.parse(data.toString());
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        if (response.type === 'audio_transcription.completed') {
          // 更新用户配额和计费
          await this.updateUserQuota(
            connection.userId,
            connection.totalDuration
          );

          ws.send(JSON.stringify({
            type: 'transcription',
            text: response.text
          }));

          // 重置计数器
          connection.totalDuration = 0;
          connection.totalTokens = 0;
        }
      } catch (error) {
        console.error(`处理转录结果错误 - 连接 ${connectionId}:`, error);
      }
    });

    ws.on('close', async () => {
      const connection = this.connections.get(connectionId);
      if (connection && connection.totalDuration > 0) {
        // 确保关闭连接时更新最后的使用记录
        await this.updateUserQuota(
          connection.userId,
          connection.totalDuration
        );
      }
      this.cleanupConnection(connectionId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket 错误 - 连接 ${connectionId}:`, error);
      this.cleanupConnection(connectionId);
    });
  }

  private async createGPT4OConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const gpt4oWs = new WebSocket(process.env.GPT4O_MINI_ENDPOINT!, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'audio/webm'
        }
      });

      gpt4oWs.on('open', () => {
        // 初始化 GPT-4o mini 会话
        gpt4oWs.send(JSON.stringify({
          type: 'session.update',
          session: {
            input_audio_format: 'webm',
            input_audio_transcription: {
              model: 'gpt-4o-mini-transcribe'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
              create_response: true
            }
          }
        }));
        resolve(gpt4oWs);
      });

      gpt4oWs.on('error', reject);
    });
  }

  private cleanupConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.gpt4oWs.close();
      this.connections.delete(connectionId);
      console.log(`连接关闭 - ID: ${connectionId}, 剩余连接数: ${this.connections.size}`);
    }
  }

  private updateLastActivity(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  private startConnectionMonitoring() {
    // 定期检查并清理不活跃的连接
    setInterval(() => {
      const now = Date.now();
      for (const [connectionId, connection] of this.connections.entries()) {
        if (now - connection.lastActivity > this.connectionTimeout) {
          console.log(`清理不活跃连接 - ID: ${connectionId}`);
          connection.ws.close(1000, '连接超时');
          this.cleanupConnection(connectionId);
        }
      }
    }, 60000); // 每分钟检查一次
  }

  private getUserIdFromRequest(req: any): string {
    // 这里需要实现用户认证逻辑
    // 可以从请求头或 cookie 中获取用户标识
    return req.headers['x-user-id'] || 'anonymous';
  }

  private setupHeartbeat() {
    setInterval(() => {
      this.connections.forEach((conn, id) => {
        if (Date.now() - conn.lastActivity > this.connectionTimeout) {
          conn.ws.close();
          this.connections.delete(id);
        } else {
          conn.ws.ping();
        }
      });
    }, this.heartbeatInterval);
  }

  private setupRateLimiting() {
    this.wss.on('connection', async (ws, req) => {
      const token = this.extractToken(req);
      if (!token) {
        ws.close();
        return;
      }

      const user = await this.getUserFromToken(token);
      if (!user) {
        ws.close();
        return;
      }

      // 检查用户连接数限制
      const userConnections = Array.from(this.connections.values())
        .filter(conn => conn.userId === user.id).length;

      if (userConnections >= this.maxConnectionsPerUser) {
        ws.close();
        return;
      }

      // ... 其余连接处理逻辑 ...
    });
  }

  // 优化 Token 计算逻辑
  private calculateTokens(duration: number): number {
    // 基于实际音频内容的复杂度估算 token
    const averageWordsPerMinute = 150;
    const averageTokensPerWord = 1.3;
    const durationInMinutes = duration / 60;
    return Math.ceil(durationInMinutes * averageWordsPerMinute * averageTokensPerWord);
  }
}

// 启动服务器
const server = new AudioTranscriptionServer();