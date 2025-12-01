/* Header.jsx */

import React from "react";
import { useAppStore } from "../stores/useAppStore";
import "../css/Header.css";
import Logo from "../assets/logo.svg"; // import 추가

export default function Header() {
    const { 
        toggleSettings, 
        setCurrentMainView, 
        currentUserId, 
        currentUsername, 
        logout,
        fontFamily
    } = useAppStore();

    const handleAccountClick = () => {
        if (currentUserId) {
            if(window.confirm(`${currentUsername}님, 정말 로그아웃 하시겠어요?`)){
                logout();
            }
        } else {
            setCurrentMainView('Login');
        }
    };

    return (
        <header className="header-wrapper">
            <img 
                className="header-logo" 
                src={Logo} // import한 이미지 사용
                alt="로고" 
                style={{ cursor: "pointer" }}
                onClick={() => setCurrentMainView("Home")} 
            />
            <div className="button-wrapper" style={{ fontFamily }}>
                <button
                    className="action-button"
                    onClick={handleAccountClick}
                    style={{ fontFamily }}
                >
                    {currentUserId ? `로그아웃` : '로그인'}
                </button>
                <button
                    className="action-button primary"
                    onClick={toggleSettings}
                    style={{ fontFamily }}
                >
                    설정
                </button>
            </div>
        </header>
    );
}
