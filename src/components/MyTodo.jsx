/* MyTodo.jsx */

import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import "../css/MyTodo.css";

export default function MyTodo() {
    const {
        selectedDate,
        todosByDate,
        addTodo,
        toggleTodoDone,
        editTodo,
        deleteTodo,
        setTodosForDate,
        fontFamily,
        fontSize
    } = useAppStore();

    const [isAdding, setIsAdding] = useState(false);
    const [input, setInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [menu, setMenu] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const inputRef = useRef(null);

    const list = todosByDate[selectedDate] || [];

    useEffect(() => {
        setInput("");
        setIsAdding(false);
        setEditingId(null);
        setMenu(null);
    }, [selectedDate]);

    const handleAddEnter = async (e) => {
        if (e.key === "Enter" && input.trim()) {
            await addTodo(selectedDate, input);
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

    const handleDelete = async (id) => {
        await deleteTodo(selectedDate, id);
        setMenu(null);
    };

    const handleDragOver = async (e, item) => {
        e.preventDefault();
        if (draggingId === item.id) return;

        const newList = [...list];
        const from = newList.findIndex(t => t.id === draggingId);
        const to = newList.findIndex(t => t.id === item.id);

        const moved = newList.splice(from, 1)[0];
        newList.splice(to, 0, moved);

        setTodosForDate(selectedDate, newList);
        await useAppStore.getState().saveUserData();
    };

    const handleAdd = () => {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div className="todo-wrapper" style={{ fontFamily, fontSize }}>
            <ul className="todo-list">
                {list.map((item) => (
                    <li
                        key={item.id}
                        className="item"
                        onContextMenu={(e) => handleContext(e, item.id)}
                        draggable
                        onDragStart={() => setDraggingId(item.id)}
                        onDragOver={(e) => handleDragOver(e, item)}
                        onDragEnd={() => setDraggingId(null)}
                        style={{ fontFamily, fontSize }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                                cursor: "pointer",
                                fontFamily,
                                fontSize
                            }}
                            onClick={async () => { await toggleTodoDone(selectedDate, item.id); }}
                        >
                            <input
                                type="checkbox"
                                className="todo-checkbox"
                                checked={item.done}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {}}
                                style={{ fontFamily, fontSize }}
                            />
                            {editingId === item.id ? (
                                <input
                                    className="input-inline"
                                    style={{ fontFamily, fontSize }}
                                    defaultValue={item.text}
                                    autoFocus
                                    onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                            await editTodo(selectedDate, item.id, e.target.value);
                                            setEditingId(null);
                                        }
                                    }}
                                    onBlur={() => setEditingId(null)}
                                />
                            ) : (
                                <span className={`text ${item.done ? "done" : ""}`} style={{ fontFamily, fontSize }}>
                                    {item.text}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {isAdding && (
                <div className="input-inline" style={{ display: "flex", fontFamily, fontSize }}>
                    <input
                        ref={inputRef}
                        className="input-inline"
                        value={input}
                        style={{ fontFamily, fontSize }}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleAddEnter}
                    />
                </div>
            )}

            <div style={{ textAlign: "center", fontFamily, fontSize }}>
                <button className="add-button" style={{ fontFamily, fontSize }} onClick={handleAdd}>
                    할 일 추가
                </button>
            </div>

            {menu && (
                <div className="context-menu" style={{ top: menu.y, left: menu.x, fontFamily, fontSize }}>
                    <div onClick={() => handleEdit(menu.id)}>수정</div>
                    <div onClick={() => handleDelete(menu.id)}>삭제</div>
                </div>
            )}
        </div>
    );
}
