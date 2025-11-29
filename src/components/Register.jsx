import React, { useState, useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import "../css/Register.css";

const USERNAME_REGEX = /^[a-zA-Z0-9]{5,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const API_BASE_URL = "http://localhost:4000/api/auth";

export default function Register() {
    const { setCurrentMainView } = useAppStore();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isUsernameValid, setIsUsernameValid] = useState(null);
    const [isIdAvailable, setIsIdAvailable] = useState(null);
    const [isPasswordValid, setIsPasswordValid] = useState(null);
    const [isPasswordMatch, setIsPasswordMatch] = useState(null);

    const [terms, setTerms] = useState({ all: false, usage: false, service: false });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (username.length === 0) {
            setIsUsernameValid(null);
            setIsIdAvailable(null);
            return;
        }
        const isValid = USERNAME_REGEX.test(username);
        setIsUsernameValid(isValid);
        if (isValid) setIsIdAvailable(null);
        else setIsIdAvailable(false);
    }, [username]);

    useEffect(() => {
        if (password.length === 0) {
            setIsPasswordValid(null);
            return;
        }
        setIsPasswordValid(PASSWORD_REGEX.test(password));
    }, [password]);

    useEffect(() => {
        if (confirmPassword.length === 0) {
            setIsPasswordMatch(null);
            return;
        }
        setIsPasswordMatch(password === confirmPassword);
    }, [password, confirmPassword]);

    const handleCheckDuplicate = async () => {
        if (!isUsernameValid) {
            alert("아이디 형식을 먼저 확인해주세요.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/check-username/${username}`);
            const data = await response.json();
            if (!response.ok || !data.available) {
                setIsIdAvailable(false);
            } else {
                setIsIdAvailable(true);
                alert(`사용 가능한 아이디 (${username}) 입니다.`);
            }
        } catch (error) {
            console.error(error);
            setIsIdAvailable(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckAll = (e) => {
        const checked = e.target.checked;
        setTerms({ all: checked, usage: checked, service: checked });
    };

    const handleCheckTerm = (name) => (e) => {
        const newTerms = { ...terms, [name]: e.target.checked };
        setTerms({ ...newTerms, all: newTerms.usage && newTerms.service });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "회원가입에 실패했습니다.");
                return;
            }
            alert(`"${username}"님, 회원가입이 완료되었습니다!
로그인 화면으로 이동합니다.`);
            setCurrentMainView("Login");
        } catch (err) {
            console.error(err);
            alert("서버와의 통신에 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderUsernameValidationMessage = () => {
        if (isUsernameValid === null) return '아이디를 입력해주세요.';
        if (!isUsernameValid) return '❌ 5~20자의 영문 대소문자, 숫자만 사용 가능합니다.';
        if (isIdAvailable === true) return '✅ 사용 가능한 아이디입니다.';
        if (isIdAvailable === false) return '❌ 아이디 중복 확인이 필요하거나, 이미 사용 중인 아이디입니다.';
        return '아이디 형식이 올바릅니다. 중복 확인 버튼을 눌러주세요.';
    };

    const handleGoLogin = () => setCurrentMainView('Login');

    return (
        <div className="register-wrapper">
            {/* 로그인 화면으로 돌아가기 */}
            
            <button className="back-button" onClick={handleGoLogin}>
                ← 로그인으로 돌아가기
            </button>
            <div className="form-container">
                {/* 회원가입 */}
                <h2>회원가입</h2>
                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <div className="input-row">
                            <input
                                id="reg-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`input ${isUsernameValid === false ? "invalid" : ""}`}
                                disabled={isLoading}
                                placeholder="아이디"
                            />
                            <button
                                type="button"
                                className="check-duplicate-button"
                                onClick={handleCheckDuplicate}
                                disabled={!isUsernameValid || isLoading || isIdAvailable === true}
                            >
                                중복확인
                            </button>
                        </div>
                        <p className={`validation-message ${isUsernameValid && isIdAvailable !== false ? "" : "invalid"}`}>
                            {renderUsernameValidationMessage()}
                        </p>
                    </div>

                    <div className="input-group">
                        <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`input ${isPasswordValid === false ? "invalid" : ""}`}
                            disabled={isLoading}
                            placeholder="비밀번호"
                        />
                        {isPasswordValid !== null && (
                            <p className={`validation-message ${isPasswordValid ? "" : "invalid"}`}>
                                {isPasswordValid
                                    ? '✅ 비밀번호 형식이 올바릅니다.'
                                    : '❌ 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.'}
                            </p>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            id="reg-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`input ${isPasswordMatch === false ? "invalid" : ""}`}
                            disabled={isLoading}
                            placeholder="비밀번호 확인"
                        />
                        {isPasswordMatch !== null && (
                            <p className={`validation-message ${isPasswordMatch ? "" : "invalid"}`}>
                                {isPasswordMatch
                                    ? '✅ 비밀번호가 일치합니다.'
                                    : '❌ 비밀번호가 일치하지 않습니다.'}
                            </p>
                        )}
                    </div>

                    <div className="terms-section">
                        <div className="term-item total">
                            <label htmlFor="term-all">이용약관 전체동의</label>
                            <input
                                id="term-all"
                                type="checkbox"
                                checked={terms.all}
                                onChange={handleCheckAll}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="term-item">
                            <label htmlFor="term-usage">이용약관 동의 (필수)</label>
                            <input
                                id="term-usage"
                                type="checkbox"
                                checked={terms.usage}
                                onChange={handleCheckTerm('usage')}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="term-item">
                            <label htmlFor="term-service">서비스 이용 동의 (필수)</label>
                            <input
                                id="term-service"
                                type="checkbox"
                                checked={terms.service}
                                onChange={handleCheckTerm('service')}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="button"
                        disabled={
                            isLoading ||
                            !isUsernameValid ||
                            isIdAvailable !== true ||
                            !isPasswordValid ||
                            !isPasswordMatch ||
                            !terms.usage ||
                            !terms.service
                        }
                    >
                        가입하기
                    </button>

                </form>
            </div>
        </div>
    );
}
