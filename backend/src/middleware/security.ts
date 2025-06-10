import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';
import sqlstring from 'sqlstring';

// 速率限制中间件
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100个请求
  message: '请求过于频繁，请稍后再试'
});

// SQL注入防护
export function sqlInjectionProtection(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object') return sqlstring.escape(obj);
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[key] = sanitize(obj[key]);
      return acc;
    }, {});
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
}

// 敏感数据加密
export function encryptSensitiveData(req: Request, res: Response, next: NextFunction) {
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);

  const encrypt = (text: string): string => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  };

  if (req.body.sensitiveData) {
    req.body.sensitiveData = encrypt(req.body.sensitiveData);
  }
  next();
}

// 导出安全中间件
export const securityMiddleware = [
  helmet(), // 设置各种 HTTP 头以增加安全性
  csrf({ cookie: true }), // CSRF 保护
  rateLimiter,
  sqlInjectionProtection,
  encryptSensitiveData
];