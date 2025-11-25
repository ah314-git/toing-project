import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useAppStore } from "../stores/useAppStore";

const Box = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.04);
  width: 300px;
  margin: 20px;
`;

const Header = styled.div`
  display:flex;
  justify-content: space-between;
  align-items:center;
  margin-bottom:8px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
  display:flex;
  align-items:center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius:6px;
  &:hover { background: #fafafa; }
`;

const Text = styled.span`
  margin-left:8px;
  flex:1;
  ${p => p.done ? "text-decoration: line-through; color: #999;" : ""}
`;

const InputInline = styled.input`
  flex:1;
  margin-left:8px;
  padding:6px;
`;

const ContextMenu = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  z-index: 1000;
  padding: 6px;
`;

export default function MyTodo() {
    const { selectedDate, todosByDate, addTodo, toggleTodoDone, editTodo, deleteTodo } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [input, setInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [menu, setMenu] = useState(null); // {x, y, id}
    const inputRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);


    useEffect(() => {
        setInput("");
        setIsAdding(false);
        setEditingId(null);
        setMenu(null);
    }, [selectedDate]);

    const list = todosByDate[selectedDate] || [];

    const handleAdd = () => {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleAddEnter = (e) => {
        if (e.key === "Enter") {
            addTodo(selectedDate, input);
            setInput("");
            setIsAdding(false);
        }
    };

    const handleContext = (e, id) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY, id });
    };

    const handleEdit = (id) => {
        setEditingId(id);
        setMenu(null);
    };

    const handleDelete = (id) => {
        deleteTodo(selectedDate, id);
        setMenu(null);
    };

    // 빈 공간 클릭하면 메뉴 + 입력창 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isMenu = e.target.closest(".menu");
            const isInput = e.target.closest(".input-inline");
            const isAddButton = e.target.closest(".add-button");

            // 메뉴·입력창 내부 or 추가버튼 클릭은 무시
            if (isMenu || isInput || isAddButton) return;

            setMenu(null);
            setIsAdding(false);
        };

        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);


    return (
        <Box>
            <Header>
                <strong></strong>
            </Header>

            <List>
                {list.map(item => (
                    <Item
                        key={item.id}
                        onContextMenu={(e) => handleContext(e, item.id)}
                        draggable
                        onDragStart={() => setDraggingId(item.id)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (draggingId === item.id) return;

                            const newList = [...list];
                            const fromIndex = newList.findIndex(t => t.id === draggingId);
                            const toIndex = newList.findIndex(t => t.id === item.id);

                            const moved = newList.splice(fromIndex, 1)[0];
                            newList.splice(toIndex, 0, moved);

                            useAppStore.getState().setTodosForDate(selectedDate, newList);
                        }}
                        onDragEnd={() => setDraggingId(null)}>

                        {/* 전체 영역 클릭 → 체크 토글 */}
                        <div
                            style={{ display: "flex", alignItems: "center", flex: 1, cursor: "pointer" }}
                            onClick={() => toggleTodoDone(selectedDate, item.id)}
                        >
                            {/* 체크박스: 클릭 시 이벤트 전파 차단 후 토글 */}
                            <input
                                type="checkbox"
                                checked={item.done}
                                onClick={(e) => {
                                    e.stopPropagation();              // 부모 onClick 실행 차단
                                    toggleTodoDone(selectedDate, item.id); // 체크 전환
                                }}
                                onChange={() => { /* onChange는 비워둬도 괜찮음 */ }}
                            />

                            {editingId === item.id ? (
                                <input
                                    defaultValue={item.text}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            editTodo(selectedDate, item.id, e.target.value);
                                            setEditingId(null);
                                        }
                                    }}
                                    onBlur={() => setEditingId(null)}
                                    style={{ marginLeft: 8, flex: 1 }}
                                    autoFocus
                                />
                            ) : (
                                <Text done={item.done}>{item.text}</Text>
                            )}
                        </div>
                    </Item>

                ))}
            </List>

            {isAdding && (
                <div className="input-inline" style={{ display: "flex", marginTop: 12 }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleAddEnter}
                        placeholder="할 일 입력 후 Enter"
                        style={{ flex: 1, padding: 8 }}
                    />
                </div>
            )}

            <div style={{ marginTop: 12, textAlign: "center" }}>
                <button
                    className="add-button"
                    onClick={handleAdd}
                    style={{
                        width: "100%",
                        padding: "8px 0",
                        background: "#f3f3f3",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        cursor: "pointer"
                    }}
                >
                    + 할 일 추가
                </button>
            </div>

            {menu && (
                <ContextMenu className="menu" style={{ top: menu.y, left: menu.x }}>
                    <div style={{ cursor: "pointer", padding: 6 }} onClick={() => handleEdit(menu.id)}>수정</div>
                    <div style={{ cursor: "pointer", padding: 6 }} onClick={() => handleDelete(menu.id)}>삭제</div>
                </ContextMenu>
            )}
        </Box>
    );
}
