import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import { toDay } from "../utils/date";
import "../css/MyJournal.css";

export default function MyJournal() {
    const {
        selectedDate,
        addMessage,
        messagesByDate,
        updateMessage,
        deleteMessage,
        timeFormat,
        showTime,
        fontFamily,
        fontSize
    } = useAppStore();

    const dateKey = toDay(selectedDate);
    const list = messagesByDate?.[dateKey] || [];

    const [text, setText] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [menu, setMenu] = useState(null);
    const [editMessageId, setEditMessageId] = useState(null);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const box = scrollRef.current;
        if (box) box.scrollTop = box.scrollHeight;
    }, [list.length]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menu && !e.target.closest(".context-menu")) {
                setMenu(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menu]);

    const sendMessage = () => {
        const value = text.trim();
        if (!value) return;

        if (editMessageId) {
            updateMessage(dateKey, editMessageId, value);
            setEditMessageId(null);
        } else {
            addMessage(dateKey, {
                id: Date.now().toString(),
                text: value,
                time: new Date(),
                type: "user"
            });
        }

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
                time: new Date(),
                type: "ai"
            });
        } catch (err) {
            console.error("AI Summary API Error:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

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

    const handleEdit = (id, text) => {
        setEditMessageId(id);
        setText(text);
        setMenu(null);
        inputRef.current?.focus();
    };

    const handleDelete = (id) => {
        deleteMessage(dateKey, id);
        setMenu(null);
        if (editMessageId === id) {
            setEditMessageId(null);
            setText("");
        }
    };

    return (
        <div className="journal-wrapper" style={{ fontFamily, fontSize }}>
            <div className="messages" ref={scrollRef}>
                {list.map(m => (
                    <div
                        key={m.id}
                        className={`message-row ${m.type}`}
                        style={{ fontFamily, fontSize }}
                        onContextMenu={e => {
                            e.preventDefault();
                            setMenu({ x: e.pageX, y: e.pageY, id: m.id, type: m.type, text: m.text });
                        }}
                    >
                        {m.type === "user" && showTime && (
                            <div className="time user-time">{formatTime(m.time)}</div>
                        )}
                        <div className={`bubble ${m.type}`}>{m.text}</div>
                        {m.type === "ai" && showTime && (
                            <div className="time ai-time">{formatTime(m.time)}</div>
                        )}
                    </div>
                ))}
            </div>

            {menu && (
                <div
                    className="context-menu"
                    style={{ top: menu.y, left: menu.x, fontFamily, fontSize }}
                >
                    {menu.type === "user" && (
                        <div onClick={() => handleEdit(menu.id, menu.text)}>수정</div>
                    )}
                    <div onClick={() => handleDelete(menu.id)}>삭제</div>
                </div>
            )}

            <div className="input-area" style={{ fontFamily, fontSize }}>
                <textarea
                    ref={inputRef}
                    className="text-input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="일상을 기록하세요"
                    style={{ fontFamily, fontSize }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                        className="btn secondary"
                        onClick={handleAiSummary}
                        disabled={isAiLoading}
                        style={{ fontFamily, fontSize }}
                    >
                        {isAiLoading ? "요약중..." : "AI 요약"}
                    </button>
                    <button
                        className="btn primary"
                        onClick={sendMessage}
                        disabled={text.trim().length === 0}
                        style={{ fontFamily, fontSize }}
                    >
                        {editMessageId ? "수정 완료" : "전송"}
                    </button>
                </div>
            </div>
        </div>
    );
}
