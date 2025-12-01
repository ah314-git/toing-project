/* server/server.js */

import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// -----------------------------
// 1. 미들웨어
// -----------------------------
app.use(cors({
  origin: ['https://toing-project.onrender.com'] // 프론트엔드 도메인
}));
app.use(express.json());

// -----------------------------
// 2. API 라우트
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/summary', aiRoutes);

// -----------------------------
// 3. 정적 파일 (React build)
// -----------------------------
app.use(express.static(resolve(__dirname, '../dist')));

// SPA 대응: React 라우팅
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, '../dist', 'index.html'));
});

// -----------------------------
// 4. MongoDB 연결 및 서버 시작
// -----------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB 연결 오류:', err));
