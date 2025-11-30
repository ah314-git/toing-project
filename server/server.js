import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import UserData from './models/UserData.js';

const app = express();
const PORT = process.env.PORT || 4000;
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MONGO_URI가 설정되어 있지 않습니다.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB 연결 성공'))
        .catch(err => console.error('MongoDB 연결 오류:', err));
}

// 회원가입
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: '이미 존재하는 사용자 이름입니다.' });

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: '회원가입 성공', userId: newUser._id });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });

        res.status(200).json({ message: '로그인 성공', userId: user._id, username: user.username });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 아이디 중복 확인
app.get('/api/auth/check-username/:username', async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.params.username });
        res.status(200).json({ available: !existingUser });
    } catch (error) {
        console.error('아이디 중복 확인 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// AI 일기 프롬프트
app.post('/api/summary', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages?.trim()) return res.status(400).json({ text: '요약할 메시지 없음' });

        const systemInstruction = `
            당신은 사용자의 일상과 감정에 공감하는 친근한 AI 친구 입니다.
            사용자가 작성한 일기 기록을 분석하고 2~3줄의 회화체로 공감 응답을 작성하세요.
        `;
        const fullPrompt = `${systemInstruction}\n--- 사용자의 새로운 기록 ---\n${messages}`;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
        res.json({ text: response.text });
    } catch (error) {
        console.error('Gemini API 오류:', error);
        res.status(500).json({ text: "서버 오류" });
    }
});

// 사용자 데이터 불러오기
app.get('/api/data/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        let userData = await UserData.findOne({ userId });

        if (!userData) {
            userData = new UserData({ userId });
            await userData.save();
        }

        const todos = userData.todosByDate ? Object.fromEntries(userData.todosByDate) : {};
        const messages = userData.messagesByDate ? Object.fromEntries(userData.messagesByDate) : {};

        res.status(200).json({ todosByDate: todos, messagesByDate: messages });
    } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        res.status(500).json({ message: '데이터 로딩 오류' });
    }
});

// 사용자 데이터 저장
app.post('/api/data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { todosByDate, messagesByDate } = req.body;

        const userData = await UserData.findOneAndUpdate(
            { userId },
            { $set: { todosByDate, messagesByDate } },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: '데이터 저장 성공', data: userData });
    } catch (error) {
        console.error('데이터 저장 오류:', error);
        res.status(500).json({ message: '데이터 저장 오류' });
    }
});

// 404 처리
app.use((req, res) => {
    res.status(404).json({ message: `경로 ${req.originalUrl}를 찾을 수 없습니다.` });
});

// 서버 실행
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
