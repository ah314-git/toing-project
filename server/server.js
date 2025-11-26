// server.js (AI 요약 기능에 맞춰 재작성된 코드)

import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// 2. 초기 설정: MyJournal의 요구사항(포트 4000) 반영
const app = express();
const PORT = process.env.PORT || 4000; 

// Gemini API 초기화
const ai = new GoogleGenAI({});

// 3. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 4. API 경로 정의: MyJournal의 요구사항(/api/summary) 반영
app.post('/api/summary', async (req, res) => {
    try {
        // MyJournal에서 보낼 데이터 이름인 'messages'를 받습니다.
        const { messages } = req.body; 
        
        if (!messages || messages.trim() === "") {
            return res.status(400).json({ text: '요약할 메시지 내용이 없습니다.' });
        }

        // Gemini 모델에게 전달할 전체 프롬프트 구성
        // *사용자 지침*: 친근한 어투와 핵심 요약을 명시
        const instruction = "다음은 사용자가 기록한 일기 또는 대화 내용입니다. 이 내용을 분석하여 핵심 주제와 감정을 친절하고 간결한 문장으로 요약해 주세요: ";
        const fullPrompt = instruction + "\n\n--- 기록 ---\n" + messages;

        // Gemini 모델 호출
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt, 
        });

        // 결과 반환: MyJournal이 기대하는 { text: "..." } 형태로 반환
        res.json({ text: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        // 클라이언트 오류 처리를 위해 MyJournal의 응답 형식에 맞춰 에러 메시지 전송
        res.status(500).json({ text: "서버 오류가 발생했거나, AI 통신에 실패했습니다." });
    }
});

// 5. 서버 실행
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} - AI Summary Endpoint Active`);
});