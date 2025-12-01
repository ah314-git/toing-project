import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 4000;

// -----------------------------
// 1. 미들웨어 순서 조정
// -----------------------------
app.use(cors());
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
app.use(express.static(path.resolve('./dist')));


// -----------------------------
// 4. SPA fallback (미들웨어 방식으로 경로 파싱 오류 우회)
// -----------------------------
app.use((req, res) => {

    if (!req.path.startsWith('/api')) {
        return res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
    res.status(404).json({ message: 'API endpoint not found' });
});

// -----------------------------
// 5. 서버 시작
// -----------------------------
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// -----------------------------
// 6. MongoDB 연결
// -----------------------------
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 오류:', err));