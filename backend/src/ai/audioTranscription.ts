import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

interface UserConnection {
  ws: WebSocket;
  gpt4oWs: WebSocket;
  userId: string;
  lastActivity: number;
}

class AudioTranscriptionServer {
  private wss: WebSocketServer;
  private connections: Map<string, UserConnection>;
  private readonly maxConnections: number;
  private readonly connectionTimeout: number;

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.connections = new Map();
    this.maxConnections = 1000; // 最大并发连接数
    this.connectionTimeout = 300000; // 连接超时时间（5分钟）

    this.initialize();
    this.startConnectionMonitoring();
  }

  private initialize() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // 检查并发连接数限制
        if (this.connections.size >= this.maxConnections) {
          ws.close(1013, '服务器已达到最大连接数限制');
          return;
        }

        // 生成唯一的连接ID
        const connectionId = uuidv4();
        const userId = this.getUserIdFromRequest(req); // 从请求中获取用户ID（需要实现认证）

        // 创建到 GPT-4o mini 的连接
        const gpt4oWs = await this.createGPT4OConnection();

        // 存储连接信息
        this.connections.set(connectionId, {
          ws,
          gpt4oWs,
          userId,
          lastActivity: Date.now()
        });

        console.log(`新用户连接 - ID: ${connectionId}, 当前连接数: ${this.connections.size}`);

        this.setupWebSocketHandlers(connectionId, ws, gpt4oWs);
      } catch (error) {
        console.error('处理新连接时发生错误:', error);
        ws.close(1011, '服务器内部错误');
      }
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

  private setupWebSocketHandlers(connectionId: string, ws: WebSocket, gpt4oWs: WebSocket) {
    // 处理来自客户端的音频数据
    ws.on('message', (data) => {
      try {
        if (gpt4oWs.readyState === WebSocket.OPEN) {
          gpt4oWs.send(data);
          this.updateLastActivity(connectionId);
        }
      } catch (error) {
        console.error(`处理音频数据错误 - 连接 ${connectionId}:`, error);
      }
    });

    // 处理来自 GPT-4o mini 的转录结果
    gpt4oWs.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        if (response.type === 'audio_transcription.completed') {
          ws.send(JSON.stringify({
            type: 'transcription',
            text: response.text
          }));
        }
      } catch (error) {
        console.error(`处理转录结果错误 - 连接 ${connectionId}:`, error);
      }
    });

    // 处理连接关闭
    ws.on('close', () => {
      this.cleanupConnection(connectionId);
    });

    // 处理错误
    ws.on('error', (error) => {
      console.error(`WebSocket 错误 - 连接 ${connectionId}:`, error);
      this.cleanupConnection(connectionId);
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
}

// 启动服务器
const server = new AudioTranscriptionServer();