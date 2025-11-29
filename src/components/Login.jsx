import React, { useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import "../css/Login.css";

const API_BASE_URL = "http://localhost:4000/api/auth";

export default function Login() {
    const { setCurrentMainView, login } = useAppStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!username || !password) {
            setFormError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                alert(`환영합니다, ${data.username}님!`);
                await login(data.userId, data.username);
            } else {
                setFormError(data.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
            }

        } catch (err) {
            console.error("로그인 API 호출 오류:", err);
            setFormError("서버와의 통신에 문제가 발생했습니다. 서버 실행 상태를 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoRegister = () => setCurrentMainView('Register');
    const handleGoHome = () => setCurrentMainView('Home');

    return (
        <div className="login-wrapper">
            <div className="login-form">
                <h2 className="login-logo" onClick={handleGoHome} style={{ cursor: 'pointer' }}>TOING</h2>
                <form onSubmit={handleLogin}>

                    <div className="input-group">
                        <input
                            className="input"
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            placeholder="아이디"
                        />
                    </div>

                    <div className="input-group">
                        <input
                            className="input"
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="비밀번호"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                        <div>
                            <input type="checkbox" id="saveId" />
                            <label htmlFor="saveId">아이디 저장</label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button type="button" className="link-button">아이디·비밀번호 찾기</button>
                            <span>|</span>
                            <button type="button" className="link-button" onClick={handleGoRegister} style={{ color: '#337AF7' }}>회원가입</button>

                        </div>
                    </div>

                    <div style={{ minHeight: '24px', marginTop: '16px' }}>
                        {formError && <div className="error-message">{formError}</div>}
                    </div>

                    <button className="login-button" type="submit" disabled={isLoading}>
                        로그인
                    </button>
                </form>
            </div>
        </div >
    );
}

