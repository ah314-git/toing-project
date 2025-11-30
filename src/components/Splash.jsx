// Splash.jsx
import React from "react";
import "../css/Splash.css";

export default function Splash() {
    return (
        <div className="splash-wrapper">
            <div className="splash-text">일상을 기록하다, 투잉</div>
            <img className="splash-logo" src="/logo.svg" alt="로고" />
        </div>
    );
}
