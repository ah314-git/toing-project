/* data.js */

import express from 'express';
import UserData from '../models/UserData.js';

const router = express.Router();

// 유저 데이터 불러오기
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
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

// 유저 데이터 저장
router.post('/:userId', async (req, res) => {
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

export default router;
