import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({});

// AI 일기 공감/요약
router.post('/', async (req, res) => {
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

export default router;
