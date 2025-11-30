/* auth.js */


import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
router.get("/check-username/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const existingUser = await User.findOne({ username });
        return res.json({ available: !existingUser });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});


export default router;
