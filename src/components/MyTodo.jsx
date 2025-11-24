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
  const [menu, setMenu] = useState(null); // {x,y,id}
  const inputRef = useRef(null);

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

  return (
    <Box>
      <Header>
        <strong></strong>
        <button onClick={handleAdd}>+</button>
      </Header>

      {isAdding && (
        <div style={{display:"flex", marginBottom:8}}>
          <input ref={inputRef}
                 value={input}
                 onChange={(e)=>setInput(e.target.value)}
                 onKeyDown={handleAddEnter}
                 placeholder="할 일 입력 후 Enter" style={{flex:1,padding:8}} />
        </div>
      )}

      <List>
        {list.map(item => (
          <Item key={item.id} onContextMenu={(e)=>handleContext(e, item.id)}>
            <div style={{display:"flex", alignItems:"center", flex:1}}>
              <input type="checkbox" checked={item.done} onChange={()=>toggleTodoDone(selectedDate, item.id)} />
              {editingId === item.id ? (
                <input
                  defaultValue={item.text}
                  onKeyDown={(e)=> {
                    if(e.key === "Enter") {
                      editTodo(selectedDate, item.id, e.target.value);
                      setEditingId(null);
                    }
                  }}
                  style={{marginLeft:8,flex:1}}
                  autoFocus
                />
              ) : (
                <Text done={item.done}>{item.text}</Text>
              )}
            </div>

            <div style={{marginLeft:8, color:"#888", fontSize:12}}>⋯</div>
          </Item>
        ))}
      </List>

      {menu && (
        <ContextMenu style={{ top: menu.y, left: menu.x }}>
          <div style={{cursor:"pointer", padding:6}} onClick={()=>handleEdit(menu.id)}>수정</div>
          <div style={{cursor:"pointer", padding:6}} onClick={()=>handleDelete(menu.id)}>삭제</div>
          <div style={{cursor:"pointer", padding:6}} onClick={()=>setMenu(null)}>취소</div>
        </ContextMenu>
      )}
    </Box>
  );
}
