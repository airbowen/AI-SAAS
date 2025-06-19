interface WebSocketOptions {
  onOpen?: () => void;
  onMessage?: (event: MessageEvent<any>) => void;
  onError?: (error: Error) => void;
  tencentCloudSecretId?: string;
  tencentCloudSecretKey?: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private url: string, private options: WebSocketOptions) {}

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      // 发送腾讯云认证信息
      if (this.options.tencentCloudSecretId && this.options.tencentCloudSecretKey) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          secretId: this.options.tencentCloudSecretId,
          secretKey: this.options.tencentCloudSecretKey
        }));
      }
      this.options.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      this.options.onMessage?.(event);
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.handleReconnect();
    };

    this.ws.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      this.options.onError?.(new Error('WebSocket connection error'));
    };
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.options.onError?.(new Error('Maximum reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    await new Promise(resolve => setTimeout(resolve, delay));
    this.connect();
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (data instanceof Blob) {
        // 如果是音频数据，直接发送
        this.ws.send(data);
      } else {
        // 其他数据转为 JSON 字符串
        this.ws.send(JSON.stringify(data));
      }
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  close() {
    this.stopHeartbeat();
    this.ws?.close();
  }
}