
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'http';
import WebSocket from 'ws';
import authRoutes from './auth/routes';
import billingRoutes from './billing/routes';
import { monitorMiddleware } from './middleware/monitor';
import { AudioHandler } from './ai/websocket/audioHandler';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Interview Helper SaaS API');
});

app.use('/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use(monitorMiddleware);

const server = new Server(app);
const wss = new WebSocket.Server({ server });
const audioHandler = new AudioHandler();

wss.on('connection', (ws) => {
  console.log('WebSocket 客户端已连接');

  ws.on('message', async (data) => {
    if (data instanceof Buffer) {
      await audioHandler.handleAudioData(ws, data);
    } else {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('解析消息错误:', error);
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket 客户端已断开');
  });

  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
