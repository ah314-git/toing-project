import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import { toDay } from "../utils/date";
import "../css/MyJournal.css";

export default function MyJournal() {
    const {
        selectedDate,
        addMessage,
        messagesByDate,
        timeFormat,
        showTime
    } = useAppStore();

    const dateKey = toDay(selectedDate);
    const list = messagesByDate?.[dateKey] || [];

    const [text, setText] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const box = scrollRef.current;
        if (box) box.scrollTop = box.scrollHeight;
    }, [list.length]);

    const sendMessage = () => {
        const value = text.trim();
        if (!value) return;

        addMessage(dateKey, {
            id: Date.now().toString(),
            text: value,
            time: new Date(), // Date 객체로 저장
            type: "user"
        });

        setText("");
        inputRef.current?.focus();
    };

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleAiSummary = async () => {
        const lastAiIndex = list.findLastIndex(m => m.type === "ai");
        const messagesToSend = list
            .slice(lastAiIndex + 1)
            .filter(m => m.type === "user")
            .map(m => m.text);
        const userMsgs = messagesToSend.join("\n\n--- 분리 ---\n\n");
        if (!userMsgs) return;

        setIsAiLoading(true);
        try {
            const res = await fetch("http://localhost:4000/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: userMsgs })
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("서버 응답 오류:", data.text || "응답 없음");
                return;
            }

            addMessage(dateKey, {
                id: "ai-" + Date.now().toString(),
                text: data.text || "AI가 응답을 생성하지 못했습니다.",
                time: new Date(), // Date 객체로 저장
                type: "ai"
            });
        } catch (err) {
            console.error("AI Summary API Error:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

    // 시간 포맷 함수
    const formatTime = (time) => {
        if (!time) return "";
        const date = time instanceof Date ? time : new Date(time);
        if (timeFormat === '12h') {
            let hours = date.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`;
        } else {
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
    };


    return (
        <div className="journal-wrapper">
            <div className="messages" ref={scrollRef}>
                {list.map(m => (
                    <div key={m.id} className={`message-row ${m.type}`}>
                        {m.type === "user" && showTime && (
                            <div className={`time user-time`}>{formatTime(m.time)}</div>
                        )}
                        <div className={`bubble ${m.type}`}>{m.text}</div>
                        {m.type === "ai" && showTime && (
                            <div className={`time ai-time`}>{formatTime(m.time)}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="input-area">
                <textarea
                    ref={inputRef}
                    className="text-input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="일상을 기록하세요"
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                        className="btn secondary"
                        onClick={handleAiSummary}
                        disabled={isAiLoading}
                    >
                        {isAiLoading ? "요약중..." : "AI 요약"}
                    </button>
                    <button
                        className="btn primary"
                        onClick={sendMessage}
                        disabled={text.trim().length === 0}
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}
