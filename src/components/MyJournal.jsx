import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useAppStore } from "../stores/useAppStore";
import { toDay } from "../utils/date";

// ------------------------------------
// 스타일 정의: 저널 및 메시지 (styled-components)
// ------------------------------------

// 저널 전체 레이아웃을 감싸는 컨테이너
const JournalWrapper = styled.div`
    // 뷰포트 높이에서 고정된 상하 요소 크기를 뺀 나머지 높이 설정
    height: calc(100vh - 200px);
    // 배경색 설정
    background: #c5c5c5ff;
    // 상단 마진
    margin-top: 100px;
    // Flexbox 레이아웃 적용
    display: flex;
    // 내용을 수직으로 정렬 (메시지 영역, 입력 영역)
    flex-direction: column;
`;
// 메시지가 표시되는 스크롤 영역
const Messages = styled.div`
    // 배경색 설정
    background: #fff;
    // 남은 공간을 모두 차지하도록 설정
    flex: 1;
    // 너비 100%
    width: 100%;
    // 내용이 넘치면 스크롤바 표시
    overflow-y: auto;
    // 상하 패딩
    padding: 16px 0;
    // Flexbox 레이아웃
    display: flex;
    // 내용을 수직으로 정렬
    flex-direction: column;
    // 메시지 행 사이 간격
    gap: 10px;
`;
// 단일 메시지(버블 + 시간)를 감싸는 행
const MessageRow = styled.div`
    // Flexbox 레이아웃
    display: flex;
    // 버블과 시간을 정렬
    gap: 8px;
    // 요소들을 아래쪽으로 정렬
    align-items: flex-end;
    // 메시지 타입('user' 또는 'ai')에 따라 좌우 정렬 결정
    justify-content: ${p => (p.type === "user" ? "flex-end" : "flex-start")};
`;
// 메시지 텍스트가 담긴 말풍선 스타일
const Bubble = styled.div`
    // 최대 너비 제한
    max-width: 70%;
    // 내부 패딩
    padding: 16px;
    // 모서리를 둥글게 (말풍선 모양)
    border-radius: 100px;
    // 타입에 따라 배경색 설정 (user는 회색, ai는 파란색 계열)
    background: ${p => (p.type === "user" ? "#e6e6e6" : "#dbefffff")};
    // 텍스트 색상
    color: #111;
    // 폰트 크기
    font-size: 16px;
`;
// 메시지 전송 시간 텍스트 스타일
const Time = styled.div`
    // 폰트 크기
    font-size: 11px;
    // 텍스트 색상
    color: #777;
    // 타입에 따라 마진 설정 (user는 왼쪽에, ai는 오른쪽에 시간 표시)
    margin: ${p => (p.type === "user" ? "0 8px 0 0" : "0 0 0 8px")};
`;
// 텍스트 입력 및 버튼을 포함하는 하단 영역
const InputArea = styled.div`
    // 스크롤 시 하단에 고정
    position: sticky;
    // 하단 위치 0
    bottom: 0;
    // 배경색 설정
    background: #fff;
    // Flexbox 레이아웃
    display: flex;
    // 내부 패딩
    padding: 40px 16px;
    // 요소들을 수직 가운데 정렬
    align-items: center;
    
    // 입력 영역 상단의 그림자 효과를 위한 가상 요소
    &::before {
        // 필수 속성
        content: "";
        // 절대 위치 설정
        position: absolute;
        // 위치 조정
        top: -6px;
        left: 0;
        // 너비 100%
        width: 100%;
        // 높이 6px
        height: 6px;
        // 이 요소로는 마우스 이벤트 발생 안 함
        pointer-events: none;
        // 상단 메시지 목록과의 경계에 부드러운 그림자 효과 추가
        background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.08),
            rgba(0,0,0,0)
        );
    }
`;
// 메시지 입력을 위한 텍스트 영역 스타일
const TextInput = styled.textarea`
    // 남은 공간을 모두 차지
    flex: 1;
    // 높이 100%
    height: 100%;
    // 내부 패딩
    padding: 8px;
    // 테두리 제거
    border: none;
    // 사용자가 크기 조절 불가
    resize: none;
    // 포커스 시 아웃라인 제거
    outline: none;
    // 폰트 크기
    font-size: 16px;
`;

// 전송 및 AI 요약 버튼 스타일
const Btn = styled.button`
    // 내부 패딩
    padding: 8px 16px;
    // 모서리 둥글게
    border-radius: 16px;
    // 테두리 제거
    border: none;
    // 마우스 오버 시 포인터 변경
    cursor: pointer;
    // primary prop에 따라 배경색 설정 (파란색 또는 회색)
    background: ${p => (p.primary ? "#3b82f6" : "#e6e6e6")};
    // primary prop에 따라 텍스트 색상 설정 (흰색 또는 어두운 회색)
    color: ${p => (p.primary ? "white" : "#222")};
`;

// ------------------------------------
// 유틸리티 함수
// ------------------------------------

// Date 객체로부터 'HH:MM' 형식의 시간 문자열을 반환하는 함수
function formatTime(date = new Date()) {
    // 시(hour)와 분(minute)을 추출하고, 두 자리 숫자가 아닐 경우 앞에 '0'을 채움
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// ------------------------------------
// MyJournal 컴포넌트
// ------------------------------------
export default function MyJournal() {
    // Zustand 스토어에서 상태(선택 날짜, 메시지 목록)와 액션(메시지 추가) 가져오기
    const { selectedDate, addMessage, messagesByDate } = useAppStore();
    
    // 선택된 날짜를 'YYYY-MM-DD' 키로 변환
    const dateKey = toDay(selectedDate);
    // 해당 날짜의 메시지 목록을 가져오거나, 없으면 빈 배열 사용
    const list = messagesByDate?.[dateKey] || [];
    // 텍스트 입력 필드의 내용을 관리하는 상태
    const [text, setText] = useState("");
    // AI 요약 중인지 여부를 나타내는 상태
    const [isAiLoading, setIsAiLoading] = useState(false);
    // 메시지 목록의 스크롤 위치를 제어하기 위한 ref
    const scrollRef = useRef(null);
    // 텍스트 입력 필드에 포커스를 주기 위한 ref
    const inputRef = useRef(null);

    // [이펙트] 메시지 목록(list)의 길이가 변경될 때마다 실행
    useEffect(() => {
        // 스크롤 요소 참조
        const box = scrollRef.current;
        // 요소가 존재하면
        if (box) {
            // 스크롤을 가장 아래(최신 메시지)로 이동
            box.scrollTop = box.scrollHeight;
        }
    }, [list.length]); // list.length가 변경될 때 (새 메시지 추가 시) 재실행

    // [함수] 메시지 전송 처리 로직
    const sendMessage = () => {
        // 입력된 텍스트의 앞뒤 공백을 제거
        const value = text.trim();
        // 내용이 없으면 전송하지 않고 종료
        if (!value) return;

        // 전역 상태에 새 사용자 메시지 추가
        addMessage(dateKey, {
            id: Date.now().toString(), // 고유 ID 생성
            text: value, // 입력된 텍스트
            time: formatTime(), // 현재 시간
            type: "user" // 메시지 타입은 'user'
        });

        // 입력 필드 초기화
        setText("");
        // 입력 필드에 다시 포커스
        inputRef.current?.focus();
    };

    // [함수] 키보드 입력 시 이벤트 처리
    const handleKeyDown = e => {
        // Enter 키를 눌렀고 Shift 키는 누르지 않았을 때
        if (e.key === "Enter" && !e.shiftKey) {
            // 기본 동작(줄바꿈) 방지
            e.preventDefault();
            // 메시지 전송 함수 호출
            sendMessage();
        }
    };

    // [함수] AI 요약 요청 처리 로직
    const handleAiSummary = async () => {
        // 마지막으로 AI가 응답한 메시지의 인덱스를 찾음
        const lastAiIndex = list.findLastIndex(m => m.type === "ai");
        // 마지막 AI 응답 이후의 모든 사용자 메시지만 필터링하여 텍스트만 추출
        const messagesToSend = list
            .slice(lastAiIndex + 1) // 마지막 AI 응답 다음 메시지부터 슬라이스
            .filter(m => m.type === "user") // 사용자 메시지만 선택
            .map(m => m.text); // 메시지 텍스트만 추출

        // 추출된 사용자 메시지들을 특정 구분자(--- 분리 ---)로 합침
        const userMsgs = messagesToSend.join("\n\n--- 분리 ---\n\n");

        // 보낼 사용자 메시지가 없으면 함수 종료
        if (!userMsgs) return;

        // AI 로딩 상태를 true로 설정
        setIsAiLoading(true);

        try {
            // 로컬 서버의 AI 요약 API에 요청 전송
            const res = await fetch("http://localhost:4000/api/summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // JSON 타입 명시
                },
                body: JSON.stringify({ messages: userMsgs }) // 합쳐진 사용자 메시지를 body에 담아 전송
            });

            // 서버 응답을 JSON으로 파싱
            const data = await res.json();
            
            // HTTP 상태 코드가 성공(2xx)이 아닐 경우
            if (!res.ok) {
                // 콘솔에 오류 기록 후 종료 (사용자에게는 표시 안 함)
                console.error("서버 응답 오류 (숨김):", data.text || "응답 없음");
                return;
            }

            // 받은 AI 응답 텍스트를 채팅 목록에 추가
            addMessage(dateKey, {
                id: "ai-" + Date.now().toString(), // 고유 ID 생성
                text: data.text || "AI가 응답을 생성하지 못했습니다.", // AI 응답 텍스트
                time: formatTime(), // 현재 시간
                type: "ai" // 메시지 타입은 'ai'
            });

        } catch (err) {
            // API 호출 자체에서 오류 발생 시 (네트워크 등)
            console.error("AI Summary API Error (숨김):", err);
            // 오류가 발생해도 사용자에게 메시지 출력 없이 종료
        } finally {
            // 로딩 상태를 false로 해제 (성공 또는 실패 여부와 관계없이)
            setIsAiLoading(false);
        }
    };

    // 컴포넌트 렌더링
    return (
        <JournalWrapper>
            {/* 메시지 출력 영역 */}
            <Messages ref={scrollRef}>
                {/* 현재 날짜의 메시지 목록을 순회하며 렌더링 */}
                {list.map(m => (
                    // 메시지 행 (타입에 따라 정렬이 다름)
                    <MessageRow key={m.id} type={m.type}>
                        {/* AI 메시지일 경우에만 시간 표시 (왼쪽에) */}
                        {m.type === "ai" && <Time type={m.type}>{m.time}</Time>}
                        {/* 메시지 말풍선 */}
                        <Bubble type={m.type}>{m.text}</Bubble>
                        {/* 사용자 메시지일 경우에만 시간 표시 (오른쪽에) */}
                        {m.type === "user" && <Time type={m.type}>{m.time}</Time>}
                    </MessageRow>
                ))}
            </Messages>

            {/* 입력 영역 */}
            <InputArea>
                {/* 텍스트 입력 필드 */}
                <TextInput
                    ref={inputRef} // 포커스 제어를 위한 ref
                    value={text} // 상태와 바인딩
                    onChange={e => setText(e.target.value)} // 입력값 변경 핸들러
                    onKeyDown={handleKeyDown} // 키보드 이벤트 핸들러
                    placeholder="일상을 기록하세요"
                />

                {/* AI 요약 및 전송 버튼 컨테이너 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* AI 요약 버튼 */}
                    <Btn onClick={handleAiSummary} disabled={isAiLoading}>
                        {/* 로딩 상태에 따라 버튼 텍스트 변경 */}
                        {isAiLoading ? "요약중..." : "AI 요약"}
                    </Btn>
                    {/* 전송 버튼 */}
                    <Btn 
                        primary // 주요 버튼 스타일 적용
                        onClick={sendMessage} 
                        // 입력 필드에 내용이 없으면 비활성화
                        disabled={text.trim().length === 0}
                    >
                        전송
                    </Btn>
                </div>
            </InputArea>
        </JournalWrapper>
    );
}