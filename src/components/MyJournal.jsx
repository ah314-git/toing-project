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
  const handleAiSummary = () => {
    const userMsgs = list
      .filter(m => m.type === "user")
      .map(m => m.text)
      .reverse()
      .join("\n")

    if (!userMsgs) return

    setIsAiLoading(true)

    setTimeout(() => {
      addMessage(dateKey, {
        id: "ai-" + Date.now().toString(),
        text: "오늘 하루도 고생 많으셨어요",
        time: formatTime(),
        type: "ai"
      })
      setIsAiLoading(false)
    }, 900)
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
