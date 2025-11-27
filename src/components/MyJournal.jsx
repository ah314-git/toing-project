import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useAppStore } from "../stores/useAppStore"
import { toDay } from "../utils/date"



const JournalWrapper = styled.div`
  height: calc(100vh - 200px);
  background: #c5c5c5ff;
  margin-top: 100px;
  display: flex;
  flex-direction: column;
`
const Messages = styled.div`
  background: #fff;
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const MessageRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: ${p => (p.type === "user" ? "flex-end" : "flex-start")};
`
const Bubble = styled.div`
  max-width: 100%;
  padding: 16px;
  border-radius: 100px;
  background: ${p => (p.type === "user" ? "#e6e6e6" : "#dbefffff")};
  color: #111;
  font-size: 16px;
`
const Time = styled.div`
  font-size: 11px;
  color: #777;
  margin: ${p => (p.type === "user" ? "0 8px 0 0" : "0 0 0 8px")};
`
const InputArea = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  display: flex;
  padding: 40px 16px;
  align-items: center;
  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 0;
    width: 100%;
    height: 6px;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.08),
      rgba(0,0,0,0)
    );
  }
`
const TextInput = styled.textarea`
  flex: 1;
  height: 100%;
  padding: 8px;
  border: none;
  resize: none;
  outline: none;
  font-size: 16px;
`

const Btn = styled.button`
  padding: 8px 16px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  background: ${p => (p.primary ? "#3b82f6" : "#e6e6e6")};
  color: ${p => (p.primary ? "white" : "#222")};
`

/* 시간 */
function formatTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}



export default function MyJournal() {

  const { selectedDate, addMessage, messagesByDate } = useAppStore()
  const dateKey = toDay(selectedDate)
  const list = messagesByDate?.[dateKey] || []
  const [text, setText] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)


  /* 스크롤 */
  useEffect(() => {
    const box = scrollRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [list.length])


  /* 메시지 관련 */
  const sendMessage = () => {
    const value = text.trim()
    if (!value) return

    addMessage(dateKey, {
      id: Date.now().toString(),
      text: value,
      time: formatTime(),
      type: "user"
    })

    setText("")
    inputRef.current?.focus()
  }

  /* Enter 전송, Shift+Enter 줄바꿈 */
  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }





/* AI 요약 */
const handleAiSummary = async () => {
    // 1. 현재 대화 목록 (list)에서 가장 최근 AI 답변을 찾습니다.
    // 'ai' 타입 메시지가 있는 경우, 그 이후의 메시지만 요약 대상으로 삼습니다.
    const lastAiIndex = list.findLastIndex(m => m.type === "ai");

    // 2. 서버로 보낼 메시지들을 필터링합니다.
    const messagesToSend = list
        // 마지막 AI 답변 다음 인덱스부터 시작하거나, AI 답변이 없으면 전체 메시지부터 시작
        .slice(lastAiIndex + 1)
        .filter(m => m.type === "user") // 오직 사용자가 보낸 메시지만 포함
        .map(m => m.text); 

    // 3. 메시지 순서를 AI가 이해하기 쉽도록 (최신 메시지가 먼저 오도록) 역순으로 합칩니다.
    const userMsgs = messagesToSend.join("\n\n--- 분리 ---\n\n");

    if (!userMsgs) {
        // 이미 답변이 완료된 상태거나, 요약할 새 메시지가 없는 경우
        return; // 👈 3번 요구사항 반영: 메시지 출력 없이 조용히 종료
    }

    setIsAiLoading(true);

    try {
        const res = await fetch("http://localhost:4000/api/summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: userMsgs }) 
        });

        const data = await res.json();
        
        // 4. 서버 오류 시 응답 메시지 출력 없이 조용히 종료 (3번 요구사항 반영)
        if (!res.ok) {
            console.error("서버 응답 오류 (숨김):", data.text || "응답 없음");
            return;
        }

        // 5. 받은 응답을 채팅 목록에 추가
        addMessage(dateKey, {
            id: "ai-" + Date.now().toString(),
            text: data.text || "AI가 응답을 생성하지 못했습니다.", 
            time: formatTime(),
            type: "ai"
        });

    } catch (err) {
        console.error("AI Summary API Error (숨김):", err);
        // 연결 오류 시에도 사용자에게 메시지 출력 없이 조용히 종료 (3번 요구사항 반영)
    } finally {
        setIsAiLoading(false);
    }
}









  return (
    <JournalWrapper>
      <Messages ref={scrollRef}>
        {list.map(m => (
          <MessageRow key={m.id} type={m.type}>
            {m.type === "ai" && <Time type={m.type}>{m.time}</Time>}
            <Bubble type={m.type}>{m.text}</Bubble>
            {m.type === "user" && <Time type={m.type}>{m.time}</Time>}
          </MessageRow>
        ))}
      </Messages>

      <InputArea>
        <TextInput
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="일상을 기록하세요"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn onClick={handleAiSummary} disabled={isAiLoading}>
            {isAiLoading ? "요약중..." : "AI 요약"}
          </Btn>
          <Btn primary onClick={sendMessage}>전송</Btn>
        </div>
      </InputArea>
    </JournalWrapper>
  )





}
