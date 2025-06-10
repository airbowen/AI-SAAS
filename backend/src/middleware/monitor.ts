import { Request, Response, NextFunction } from 'express';
import prometheus from 'prom-client';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',     // 单个文件最大 20MB
      maxFiles: '14d',    // 保留 14 天的日志
      zippedArchive: true // 压缩旧日志文件
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});

const metrics = {
  httpRequestDuration: new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  }),
  aiRequestLatency: new prometheus.Histogram({
    name: 'ai_request_latency_seconds',
    help: 'Latency of AI API requests',
    labelNames: ['endpoint', 'status']
  }),
  activeConnections: new prometheus.Gauge({
    name: 'websocket_active_connections',
    help: 'Number of active WebSocket connections'
  }),
  userTokensUsed: new prometheus.Counter({
    name: 'user_tokens_used_total',
    help: 'Total number of tokens used by users',
    labelNames: ['user_id']
  })
};

export function monitorMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  // 记录请求日志
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip
  });

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    // 记录响应日志
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: durationInSeconds
    });

    // 更新 Prometheus 指标
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(durationInSeconds);
  });

  next();
}

export { metrics, logger };