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

    const handleAdd = () => {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleAddEnter = (e) => {
        if (e.key === "Enter" && input.trim()) {
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            const isMenu = e.target.closest(".context-menu");
            const isInput = e.target.closest(".input-inline");
            const isAddButton = e.target.closest(".add-button");
            if (isMenu || isInput || isAddButton) return;
            setMenu(null);
            setIsAdding(false);
        };
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleDragOver = (e, item) => {
        e.preventDefault();
        if (draggingId === item.id) return;

        const newList = [...list];
        const from = newList.findIndex((t) => t.id === draggingId);
        const to = newList.findIndex((t) => t.id === item.id);

        const moved = newList.splice(from, 1)[0];
        newList.splice(to, 0, moved);

        useAppStore.getState().setTodosForDate(selectedDate, newList);
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
                            onClick={() => toggleTodoDone(selectedDate, item.id)}
                        >
                            <input
                                type="checkbox"
                                className="todo-checkbox"
                                checked={item.done}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTodoDone(selectedDate, item.id);
                                }}
                                onChange={() => { }}
                                style={{ fontFamily, fontSize }}
                            />
                            {editingId === item.id ? (
                                <input
                                    className="input-inline"
                                    style={{ fontFamily, fontSize }}
                                    defaultValue={item.text}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            editTodo(selectedDate, item.id, e.target.value);
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
                <div
                    className="context-menu"
                    style={{ top: menu.y, left: menu.x, fontFamily, fontSize }}
                >
                    <div style={{ fontFamily, fontSize }} onClick={() => handleEdit(menu.id)}>수정</div>
                    <div style={{ fontFamily, fontSize }} onClick={() => handleDelete(menu.id)}>삭제</div>
                </div>
            )}
        </div>
    );
}
