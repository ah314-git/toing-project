import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import User from './models/User.js'; // server/models/User.js 임포트
import bcrypt from 'bcrypt';
import UserData from './models/UserData.js'; // UserDara -> UserData로 수정

// ------------------------------------
// 초기 설정 및 미들웨어
// ------------------------------------
const app = express();
const PORT = process.env.PORT || 4000;
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json()); // JSON 본문 파싱

// ------------------------------------
// 데이터베이스 연결
// ------------------------------------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("오류: MONGO_URI가 설정되어 있지 않습니다.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB 연결 성공'))
        .catch(err => console.error('MongoDB 연결 오류:', err));
}

// ------------------------------------
// 라우트 정의 (모든 API 라우트)
// ------------------------------------

/** 1. 회원가입 API */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 이름 중복 확인
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 사용자 이름입니다.' });
        }

        // 비밀번호 해싱 및 새 사용자 생성
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: '회원가입 성공', userId: newUser._id });

    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

/** 2. 로그인 API */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. 사용자 이름으로 DB에서 사용자 찾기
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 2. 입력된 비밀번호와 해시된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 3. 로그인 성공 처리
        console.log(`로그인 성공: ${username}`);
        res.status(200).json({
            message: '로그인 성공',
            userId: user._id,
            username: user.username
        });

    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


/** 3. 아이디 중복 확인 API */
app.get('/api/auth/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // DB에서 사용자 찾기
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            // 사용 중인 아이디
            return res.status(200).json({ available: false, message: '이미 사용 중인 아이디입니다.' });
        } else {
            // 사용 가능한 아이디
            return res.status(200).json({ available: true, message: '사용 가능한 아이디입니다.' });
        }
    } catch (error) {
        console.error('아이디 중복 확인 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


/** 4. AI 응답 (일기 공감 및 요약) API */
app.post('/api/summary', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || messages.trim() === "") {
            return res.status(400).json({ text: '요약할 메시지 내용이 없습니다.' });
        }

        const systemInstruction = `
            당신은 사용자의 일상과 감정에 공감하고 응원하는 친근한 대화형 AI 비서입니다.
            당신의 역할은 사용자가 작성한 일기 기록이나 대화를 분석하여 대화 흐름을 잇는 것입니다.
            1. '요약' 대신 **'공감하는 응답'**에 초점을 맞추세요.
            2. 사용자가 피곤함, 슬픔 등을 표현했다면, 그 감정을 인정하고 긍정적인 응원 메시지를 덧붙이세요.
            3. 답변은 2~3줄의 간결한 일상 회화체로 작성하며, 기술적인 요약 말투는 절대 사용하지 마세요.
            4. 이전 기록과 현재 기록을 연결하여 사용자의 **생활 패턴을 이해하는 것처럼** 답변하세요.
            5. 답변은 오직 사용자에게 말을 거는 형식으로만 작성하세요.
        `;

        const fullPrompt = `${systemInstruction}\n\n--- 사용자의 새로운 기록 ---\n${messages}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ text: "서버 오류 (숨김 처리됨)" });
    }
});


// ------------------------------------
// 📅 데이터 관리 라우트 (/api/data) - **중첩 오류 수정 완료**
// ------------------------------------

/** 1. 사용자 데이터 불러오기 API */
app.get('/api/data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // UserData 모델 사용
        let userData = await UserData.findOne({ userId });

        if (!userData) {
            // 데이터가 없는 경우, 새로 생성하여 반환합니다. (최초 로그인 시)
            userData = new UserData({ userId });
            await userData.save();
        }

        // 💡 핵심 수정: MongoDB Map 객체를 일반 JavaScript 객체로 명시적으로 변환합니다.
        // Map.prototype.entries()를 배열로 만든 후 Object.fromEntries()로 객체로 변환합니다.
        const todos = userData.todosByDate ? Object.fromEntries(userData.todosByDate) : {};
        const messages = userData.messagesByDate ? Object.fromEntries(userData.messagesByDate) : {};

        // 클라이언트에게 투두와 메시지 데이터를 JSON 형태로 전송합니다.
        res.status(200).json({
            todosByDate: todos,
            messagesByDate: messages,
        });

    } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        res.status(500).json({ message: '데이터 로딩 중 서버 오류가 발생했습니다.' });
    }
});

/** 2. 사용자 데이터 저장 API */
app.post('/api/data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { todosByDate, messagesByDate } = req.body;

        // UserData 모델 사용
        // upsert: true는 문서가 없으면 새로 생성한다는 의미입니다.
        const userData = await UserData.findOneAndUpdate(
            { userId },
            {
                $set: {
                    todosByDate: todosByDate,
                    messagesByDate: messagesByDate
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: '데이터 저장 성공', data: userData });

    } catch (error) {
        console.error('데이터 저장 오류:', error);
        res.status(500).json({ message: '데이터 저장 중 서버 오류가 발생했습니다.' });
    }
});


// ------------------------------------
// ⚠️ 404 Not Found 핸들러 (모든 API 라우트 이후에 위치)
// ------------------------------------
app.use((req, res) => {
    // 404 응답을 클라이언트가 기대하는 JSON 형식으로 반환하여 'Unexpected token <' 오류 방지
    res.status(404).json({
        message: `요청하신 경로 (${req.originalUrl})를 찾을 수 없습니다. (404 Not Found)`,
        errorDetail: '정의된 API 라우트가 아닙니다.'
    });
});


// ------------------------------------
// 서버 실행
// ------------------------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});