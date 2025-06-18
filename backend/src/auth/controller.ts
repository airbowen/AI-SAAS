import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { redis } from '../config/redis';
import { SendCodeInput, VerifyCodeInput } from './types';

const prisma = new PrismaClient();

// 生成6位随机验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码
export async function sendCode(req: Request, res: Response) {
  try {
    const { phone, countryCode }: SendCodeInput = req.body;

    // 检查是否频繁发送
    const lastSentTime = await redis.get(`sms:lastSent:${countryCode}${phone}`);
    if (lastSentTime && Date.now() - parseInt(lastSentTime) < 60000) {
      return res.status(429).json({ error: '请等待60秒后再试' });
    }

    const code = generateVerificationCode();
    
    // 将验证码存入 Redis，5分钟过期
    await redis.setex(`sms:code:${countryCode}${phone}`, 300, code);
    // 记录发送时间
    await redis.set(`sms:lastSent:${countryCode}${phone}`, Date.now().toString());

    // 开发环境直接返回验证码
    if (process.env.NODE_ENV === 'development') {
      return res.json({ message: '验证码已发送', code });
    }

    // 腾讯云短信发送
    const tencentcloud = require("tencentcloud-sdk-nodejs");
    const SmsClient = tencentcloud.sms.v20210111.Client;
    
    const client = new SmsClient({
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: "ap-guangzhou",
      profile: {
        signMethod: "TC3-HMAC-SHA256",
        httpProfile: {
          reqMethod: "POST",
          reqTimeout: 30,
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    });

    const params = {
      SmsSdkAppId: process.env.TENCENT_SMS_SDK_APPID,
      SignName: process.env.TENCENT_SMS_SIGN,
      TemplateId: process.env.TENCENT_SMS_TEMPLATE_ID,
      TemplateParamSet: [code],
      PhoneNumberSet: [`${countryCode}${phone}`],  // 使用传入的区号
    };

    const result = await client.SendSms(params);
    
    if (result.SendStatusSet[0].Code === "Ok") {
      res.json({ message: '验证码已发送' });
    } else {
      throw new Error(result.SendStatusSet[0].Message);
    }

  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
}

// 验证码登录
export async function verifyCode(req: Request, res: Response) {
  try {
    const { phone, countryCode, code }: VerifyCodeInput = req.body;

    // 获取存储的验证码
    const storedCode = await redis.get(`sms:code:${countryCode}${phone}`);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: '验证码错误或已过期' });
    }

    // 验证成功后删除验证码
    await redis.del(`sms:code:${countryCode}${phone}`);

    // 查找或创建用户
    let user = await prisma.user.findUnique({ 
      where: { 
        phone_countryCode: {
          phone,
          countryCode
        }
      } 
    });
    if (!user) {
      user = await prisma.user.create({
        data: { 
          phone,
          countryCode
        }
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('验证码登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
}