// server.js (개선 코드: 대화, 누적, 성격 반영)

import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 4000; 
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json());

app.post('/api/summary', async (req, res) => {
    try {
        // MyJournal에서 보낸 새로운 메시지들을 받습니다.
        const { messages } = req.body; 
        
        if (!messages || messages.trim() === "") {
            // 요약할 내용이 없다면 400을 보내지만, 프론트엔드가 이를 처리하여 사용자에게 표시하지 않음
            return res.status(400).json({ text: '요약할 메시지 내용이 없습니다.' });
        }

        /* 4. 성격 및 대화 컨셉 반영을 위한 시스템 지침 (System Instruction)
         Gemini 모델은 복잡한 역할 설정을 위한 System Instruction 기능을 제공합니다.
         (참고: @google/genai SDK는 models.generateContent의 contents 필드에 모든 프롬프트 내용을 담아 지시를 수행합니다.)
        */
        const systemInstruction = `
            당신은 사용자의 일상과 감정에 공감하고 응원하는 친근한 대화형 AI 비서입니다.
            당신의 역할은 사용자가 작성한 일기 기록이나 대화를 분석하여 대화 흐름을 잇는 것입니다.
            1. '요약' 대신 **'공감하는 응답'**에 초점을 맞추세요.
            2. 사용자가 피곤함, 슬픔 등을 표현했다면, 그 감정을 인정하고 긍정적인 응원 메시지를 덧붙이세요. (예: "평소보다 늦게 주무셔서 피곤하실 수 있어요. 힘내봐요!")
            3. 답변은 2~3줄의 간결한 일상 회화체로 작성하며, 기술적인 요약 말투는 절대 사용하지 마세요.
            4. 이전 기록과 현재 기록을 연결하여 사용자의 **생활 패턴을 이해하는 것처럼** 답변하세요.
            5. 답변은 오직 사용자에게 말을 거는 형식으로만 작성하세요.
        `;

        // 2. 누적 대화 처리를 위해 'messages'를 전체 기록으로 간주합니다.
        // MyJournal에서 이미 이전 AI 답변 이후의 새 메시지만 보내도록 필터링 했기 때문에,
        // 이 메시지들은 AI에게 '새로운 기록'으로 간주될 것입니다.
        const fullPrompt = `${systemInstruction}\n\n--- 사용자의 새로운 기록 ---\n${messages}`;

        // Gemini 모델 호출
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt, 
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        // 서버 측 오류가 발생하더라도 프론트엔드에서 메시지를 표시하지 않도록 조치
        res.status(500).json({ text: "서버 오류 (숨김 처리됨)" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} - AI Summary Endpoint Active`);
});