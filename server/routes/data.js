import express from 'express';
import UserData from '../models/UserData.js';

const router = express.Router();

// 유저 데이터 불러오기 (전체)
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

// 유저 데이터 전체 저장
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

// -----------------------------
// TODOLIST
// -----------------------------
router.post("/:userId/todo", async (req, res) => {
    const { userId } = req.params;
    const { date, todo } = req.body; // todo = { id, text, done }
    try {
        let userData = await UserData.findOne({ userId });
        if (!userData) userData = new UserData({ userId, todosByDate: {} });

        if (!userData.todosByDate.has(date)) {
            userData.todosByDate.set(date, []);
        }

        const todos = userData.todosByDate.get(date);
        todos.push(todo);
        userData.todosByDate.set(date, todos);
        await userData.save();

        res.status(200).json({ message: "저장 완료", todos: todos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 특정 날짜 투두 불러오기
router.get("/:userId/todo/:date", async (req, res) => {
    const { userId, date } = req.params;
    try {
        const userData = await UserData.findOne({ userId });
        const todos = userData?.todosByDate.get(date) || [];
        res.json({ todos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// -----------------------------
// JOURNAL
// -----------------------------

// 날짜별 메시지 저장
router.post("/:userId/message", async (req, res) => {
    const { userId } = req.params;
    const { date, message } = req.body; // message = { id, text, time, type }

    try {
        let userData = await UserData.findOne({ userId });
        if (!userData) userData = new UserData({ userId, messagesByDate: {} });

        if (!userData.messagesByDate.has(date)) {
            userData.messagesByDate.set(date, []);
        }

        const msgs = userData.messagesByDate.get(date);
        msgs.push(message);
        userData.messagesByDate.set(date, msgs);
        await userData.save();

        res.status(200).json({ message: "저장 완료", messages: msgs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 특정 날짜 메시지 불러오기
router.get("/:userId/message/:date", async (req, res) => {
    const { userId, date } = req.params;
    try {
        const userData = await UserData.findOne({ userId });
        const msgs = userData?.messagesByDate.get(date) || [];
        res.json({ messages: msgs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});

export default router;
