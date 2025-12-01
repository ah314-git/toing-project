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


console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 오류:', err));

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/summary', aiRoutes);
app.use((req, res) => res.status(404).json({ message: '경로를 찾을 수 없습니다.' }));


app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve('./dist')));
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});