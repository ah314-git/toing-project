import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useAppStore } from "../stores/useAppStore"





const TodoWrapper = styled.div`
  background: #fff;
  border-radius: 8px;
  border: 2px solid #ddd;
  width: 100%;
`
const TodoCheckbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #257cff;
  cursor: pointer;
  position: relative;

  &:checked {
    background-color: #257cff;
  }

  &:checked::after {
    content: "✓";
    color: white;
    font-size: 14px;
    position: absolute;
    top: -3px;
    left: 3px;
  }
`
const TodoList = styled.ul`
  list-style: none;
  padding: 16px;
  margin: 0;
`
const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-radius: 6px;
  &:hover {
    background: #fafafa;
  }
`
const Text = styled.span`
  margin-left: 8px;
  flex: 1;
  ${(p) => (p.done ? "text-decoration: line-through; color: #999;" : "")}
`

const InputInline = styled.input`
  flex: 1;
  margin: 16px;
  padding: 6px;
`
const ContextMenu = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
  z-index: 1000;
  padding: 6px;
`




export default function MyTodo() {
  const {
    selectedDate,
    todosByDate,
    addTodo,
    toggleTodoDone,
    editTodo,
    deleteTodo,
  } = useAppStore()

  const [isAdding, setIsAdding] = useState(false)
  const [input, setInput] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [menu, setMenu] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const inputRef = useRef(null)
  const list = todosByDate[selectedDate] || []


  
  /* 상태 초기화 */
  useEffect(() => {
    setInput("")
    setIsAdding(false)
    setEditingId(null)
    setMenu(null)
  }, [selectedDate])



  const handleAdd = () => {
    setIsAdding(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleAddEnter = (e) => {
    if (e.key === "Enter" && input.trim()) {
      addTodo(selectedDate, input)
      setInput("")
      setIsAdding(false)
    }
  }

  const handleContext = (e, id) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, id })
  }

  const handleEdit = (id) => {
    setEditingId(id)
    setMenu(null)
  }

  const handleDelete = (id) => {
    deleteTodo(selectedDate, id)
    setMenu(null)
  }

  /* 바깥 클릭 시 메뉴창 닫기 */
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isMenu = e.target.closest(".menu")
      const isInput = e.target.closest(".input-inline")
      const isAddButton = e.target.closest(".add-button")
      if (isMenu || isInput || isAddButton) return

      setMenu(null)
      setIsAdding(false)
    }
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  
  return (
    <TodoWrapper>
      <TodoList>
        {list.map((item) => (
          <Item
            key={item.id}
            onContextMenu={(e) => handleContext(e, item.id)}
            draggable
            onDragStart={() => setDraggingId(item.id)}
            onDragOver={(e) => {
              e.preventDefault()
              if (draggingId === item.id) return

              const newList = [...list]
              const from = newList.findIndex((t) => t.id === draggingId)
              const to = newList.findIndex((t) => t.id === item.id)
              const moved = newList.splice(from, 1)[0]
              newList.splice(to, 0, moved)

              useAppStore.getState().setTodosForDate(selectedDate, newList)
            }}
            onDragEnd={() => setDraggingId(null)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                cursor: "pointer",
              }}
              onClick={() => toggleTodoDone(selectedDate, item.id)}
            >
              <TodoCheckbox
                checked={item.done}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTodoDone(selectedDate, item.id)
                }}
                onChange={() => {}}
              />

              {editingId === item.id ? (
                <InputInline
                  className="input-inline"
                  defaultValue={item.text}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editTodo(selectedDate, item.id, e.target.value)
                      setEditingId(null)
                    }
                  }}
                  onBlur={() => setEditingId(null)}
                />
              ) : (
                <Text done={item.done}>{item.text}</Text>
              )}
            </div>
          </Item>
        ))}
      </TodoList>

      {isAdding && (
        <div className="input-inline" style={{ display: "flex", marginTop: 12 }}>
          <InputInline
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleAddEnter}
          />
        </div>
      )}

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button
          className="add-button"
          onClick={handleAdd}
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

      {menu && (
        <ContextMenu className="menu" style={{ top: menu.y, left: menu.x }}>
          <div
            style={{ cursor: "pointer", padding: 6 }}
            onClick={() => handleEdit(menu.id)}
          >
            수정
          </div>
          <div
            style={{ cursor: "pointer", padding: 6 }}
            onClick={() => handleDelete(menu.id)}
          >
            삭제
          </div>
        </ContextMenu>
      )}
    </TodoWrapper>
  )
}
