import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
// 전역 상태 관리를 위한 Zustand 스토어 임포트
import { useAppStore } from "../stores/useAppStore";

// ------------------------------------
// 스타일 정의: 투두 리스트 (styled-components)
// ------------------------------------

// 투두 리스트 전체를 감싸는 컨테이너
const TodoWrapper = styled.div`
    // 배경색
    background: #fff;
    // 모서리 둥글게
    border-radius: 8px;
    // 테두리 설정
    border: 2px solid #ddd;
    // 너비 100%
    width: 100%;
`;
// 커스텀 체크박스 스타일 정의
const TodoCheckbox = styled.input.attrs({ type: "checkbox" })`
    // 브라우저 기본 스타일 제거
    appearance: none;
    // 너비와 높이 설정
    width: 20px;
    height: 20px;
    // 테두리 색상 (파란색)
    border: 2px solid #257cff;
    // 마우스 커서 변경
    cursor: pointer;
    // 체크 표시를 위한 위치 설정
    position: relative;

    // 체크되었을 때 스타일
    &:checked {
        // 배경색 변경
        background-color: #257cff;
    }

    // 체크되었을 때 체크 표시 (✓) 추가
    &:checked::after {
        // 내용으로 '✓' 사용
        content: "✓";
        // 텍스트 색상
        color: white;
        // 폰트 크기
        font-size: 14px;
        // 위치를 절대값으로 설정
        position: absolute;
        // 위치 조정
        top: -3px;
        left: 3px;
    }
`;
// 할 일 목록 (ul) 스타일
const TodoList = styled.ul`
    // 리스트 마커 제거
    list-style: none;
    // 내부 패딩
    padding: 16px;
    // 기본 마진 제거
    margin: 0;
`;
// 개별 할 일 항목 (li) 스타일
const Item = styled.li`
    // Flexbox 레이아웃
    display: flex;
    // 요소들을 수직 가운데 정렬
    align-items: center;
    // 요소들을 양 끝으로 분산 정렬
    justify-content: space-between;
    // 상하 패딩
    padding: 6px 0;
    // 모서리 둥글게
    border-radius: 6px;
    
    // 마우스 호버 시 배경색 변경
    &:hover {
        background: #fafafa;
    }
`;
// 할 일 텍스트 스타일
const Text = styled.span`
    // 왼쪽 마진
    margin-left: 8px;
    // 남은 공간을 모두 차지
    flex: 1;
    // done prop에 따라 취소선 및 회색 텍스트 적용
    ${(p) => (p.done ? "text-decoration: line-through; color: #999;" : "")}
`;

// 인라인 수정 및 추가 시 사용되는 input 스타일
const InputInline = styled.input`
    // 남은 공간을 모두 차지
    flex: 1;
    // 마진 설정
    margin: 16px;
    // 내부 패딩
    padding: 6px;
`;
// 마우스 오른쪽 클릭 시 나타나는 컨텍스트 메뉴 스타일
const ContextMenu = styled.div`
    // 뷰포트에 고정
    position: fixed;
    // 배경색
    background: white;
    // 테두리
    border: 1px solid #ddd;
    // 그림자 효과
    box-shadow: 0 4px 12px rgba(0,0,0,0.01);
    // 다른 요소 위에 표시되도록 z-index 설정
    z-index: 1000;
    // 내부 패딩
    padding: 6px;
`;


// ------------------------------------
// MyTodo 컴포넌트
// ------------------------------------
export default function MyTodo() {
    // Zustand 스토어에서 상태와 액션 가져오기
    const {
        selectedDate, // 현재 선택된 날짜
        todosByDate, // 날짜별 할 일 목록 객체
        addTodo, // 할 일 추가 액션
        toggleTodoDone, // 할 일 완료/미완료 토글 액션
        editTodo, // 할 일 수정 액션
        deleteTodo, // 할 일 삭제 액션
    } = useAppStore();

    // 할 일 추가 입력 필드 표시 여부 상태
    const [isAdding, setIsAdding] = useState(false);
    // 새로 추가할 할 일 텍스트 상태
    const [input, setInput] = useState("");
    // 현재 수정 중인 할 일의 ID 상태
    const [editingId, setEditingId] = useState(null);
    // 컨텍스트 메뉴 표시 정보 상태 { x, y, id }
    const [menu, setMenu] = useState(null);
    // 드래그 중인 할 일의 ID 상태
    const [draggingId, setDraggingId] = useState(null);
    // 할 일 추가 입력 필드에 포커스를 주기 위한 ref
    const inputRef = useRef(null);
    // 현재 선택된 날짜의 할 일 목록을 가져오거나, 없으면 빈 배열 사용
    const list = todosByDate[selectedDate] || [];

    // [이펙트] selectedDate가 변경될 때마다 실행 (날짜 이동 시)
    useEffect(() => {
        // 모든 로컬 상태 초기화
        setInput("");
        setIsAdding(false);
        setEditingId(null);
        setMenu(null);
    }, [selectedDate]); // 선택된 날짜가 변경될 때 재실행

    // [함수] 할 일 추가 모드 활성화 및 입력 필드 포커스
    const handleAdd = () => {
        setIsAdding(true);
        // DOM 업데이트 후 다음 틱에 포커스 설정
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    // [함수] 할 일 추가 입력 필드에서 Enter 키 입력 처리
    const handleAddEnter = (e) => {
        // Enter 키가 눌렸고, 입력 내용에 공백이 아닌 문자가 있을 경우
        if (e.key === "Enter" && input.trim()) {
            // 할 일 추가 액션 호출
            addTodo(selectedDate, input);
            // 입력 필드 초기화
            setInput("");
            // 추가 모드 비활성화
            setIsAdding(false);
        }
    };

    // [함수] 컨텍스트 메뉴(우클릭 메뉴) 표시
    const handleContext = (e, id) => {
        // 브라우저 기본 컨텍스트 메뉴 표시 방지
        e.preventDefault();
        // 마우스 위치와 해당 할 일 ID를 상태에 저장하여 메뉴 표시
        setMenu({ x: e.clientX, y: e.clientY, id });
    };

    // [함수] 할 일 수정 모드 활성화
    const handleEdit = (id) => {
        // 수정 중인 ID 설정
        setEditingId(id);
        // 컨텍스트 메뉴 숨김
        setMenu(null);
    };

    // [함수] 할 일 삭제
    const handleDelete = (id) => {
        // 할 일 삭제 액션 호출
        deleteTodo(selectedDate, id);
        // 컨텍스트 메뉴 숨김
        setMenu(null);
    };

    // [이펙트] 외부 클릭 시 메뉴 및 추가 모드 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            // 클릭된 요소가 메뉴, 인라인 입력 필드, 또는 추가 버튼의 일부인지 확인
            const isMenu = e.target.closest(".menu");
            const isInput = e.target.closest(".input-inline");
            const isAddButton = e.target.closest(".add-button");

            // 해당 요소들이 아니면 종료
            if (isMenu || isInput || isAddButton) return;

            // 메뉴와 추가 모드 비활성화
            setMenu(null);
            setIsAdding(false);
        };
        // 전역 클릭 이벤트 리스너 등록
        window.addEventListener("click", handleClickOutside);
        // 컴포넌트 언마운트 시 리스너 제거
        return () => window.removeEventListener("click", handleClickOutside);
    }, []); // 최초 1회만 실행

    // [함수] 드래그 오버 시 순서 변경 처리 로직
    const handleDragOver = (e, item) => {
        // 드롭 허용
        e.preventDefault();
        // 드래그 중인 항목과 현재 오버된 항목이 같으면 순서 변경 불필요
        if (draggingId === item.id) return;

        // 현재 리스트를 복사
        const newList = [...list];
        // 드래그 시작 항목의 인덱스 찾기
        const from = newList.findIndex((t) => t.id === draggingId);
        // 드래그 오버된 항목의 인덱스 찾기
        const to = newList.findIndex((t) => t.id === item.id);
        
        // 'from' 위치에서 항목을 잘라내고 (moved)
        const moved = newList.splice(from, 1)[0];
        // 'to' 위치에 삽입
        newList.splice(to, 0, moved);

        // 변경된 리스트로 전역 상태 업데이트 (Zustand 직접 호출)
        useAppStore.getState().setTodosForDate(selectedDate, newList);
    };

    // 컴포넌트 렌더링
    return (
        <TodoWrapper>
            {/* 할 일 목록 출력 영역 */}
            <TodoList>
                {/* 할 일 목록 순회하며 개별 Item 렌더링 */}
                {list.map((item) => (
                    <Item
                        key={item.id}
                        // 마우스 우클릭 시 컨텍스트 메뉴 표시
                        onContextMenu={(e) => handleContext(e, item.id)}
                        draggable // 드래그 가능 속성 활성화
                        // 드래그 시작 시 드래그 중인 ID 상태 설정
                        onDragStart={() => setDraggingId(item.id)}
                        // 드래그 오버 시 순서 변경 함수 호출
                        onDragOver={(e) => handleDragOver(e, item)}
                        // 드래그 종료 시 드래그 중인 ID 초기화
                        onDragEnd={() => setDraggingId(null)}
                    >
                        {/* 체크박스와 텍스트를 감싸는 영역 (클릭 시 완료 토글) */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                                cursor: "pointer",
                            }}
                            onClick={() => toggleTodoDone(selectedDate, item.id)} // 전체 클릭 시 완료 토글
                        >
                            {/* 할 일 완료 체크박스 */}
                            <TodoCheckbox
                                checked={item.done} // 완료 상태와 바인딩
                                onClick={(e) => {
                                    // 체크박스 클릭 시 Item의 onClick 이벤트 전파 방지
                                    e.stopPropagation();
                                    toggleTodoDone(selectedDate, item.id);
                                }}
                                onChange={() => { }} // 경고 제거를 위한 더미 onChange
                            />

                            {/* 할 일 수정/표시 영역 */}
                            {editingId === item.id ? (
                                // [수정 모드] 수정 중인 ID와 일치하면 입력 필드 렌더링
                                <InputInline
                                    className="input-inline"
                                    defaultValue={item.text} // 기존 텍스트 표시
                                    autoFocus // 자동 포커스
                                    onKeyDown={(e) => {
                                        // Enter 키 입력 시
                                        if (e.key === "Enter") {
                                            // 할 일 수정 액션 호출
                                            editTodo(selectedDate, item.id, e.target.value);
                                            // 수정 모드 종료
                                            setEditingId(null);
                                        }
                                    }}
                                    // 포커스 잃으면 수정 모드 종료
                                    onBlur={() => setEditingId(null)}
                                />
                            ) : (
                                // [일반 표시 모드] 텍스트 렌더링 (완료 시 취소선 적용)
                                <Text done={item.done}>{item.text}</Text>
                            )}
                        </div>
                    </Item>
                ))}
            </TodoList>

            {/* 할 일 추가 입력 필드 (isAdding이 true일 때만 표시) */}
            {isAdding && (
                <div className="input-inline" style={{ display: "flex", marginTop: 12 }}>
                    <InputInline
                        ref={inputRef} // 포커스 제어를 위한 ref
                        value={input} // 입력 상태와 바인딩
                        onChange={(e) => setInput(e.target.value)} // 입력값 업데이트
                        onKeyDown={handleAddEnter} // Enter 키 입력 핸들러
                    />
                </div>
            )}

            {/* 할 일 추가 버튼 */}
            <div style={{ marginTop: 12, textAlign: "center" }}>
                <button
                    className="add-button"
                    onClick={handleAdd} // 클릭 시 추가 모드 활성화
                    style={{
                        width: "95%",
                        padding: "10px 0",
                        margin: "10px",
                        background: "#f3f3f3",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                    }}
                >
                    할 일 추가
                </button>
            </div>

            {/* 컨텍스트 메뉴 (menu 상태가 있을 때만 표시) */}
            {menu && (
                <ContextMenu className="menu" style={{ top: menu.y, left: menu.x }}>
                    {/* 수정 옵션 */}
                    <div
                        style={{ cursor: "pointer", padding: 6 }}
                        onClick={() => handleEdit(menu.id)} // 클릭 시 수정 모드 활성화
                    >
                        수정
                    </div>
                    {/* 삭제 옵션 */}
                    <div
                        style={{ cursor: "pointer", padding: 6 }}
                        onClick={() => handleDelete(menu.id)} // 클릭 시 삭제
                    >
                        삭제
                    </div>
                </ContextMenu>
            )}
        </TodoWrapper>
    );
}