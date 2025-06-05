
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './auth/routes';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Interview Helper SaaS API');
});

app.use('/auth', authRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
