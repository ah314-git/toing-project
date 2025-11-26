import { create } from "zustand"
import { toDay } from "../utils/date"


const today = toDay(new Date())

export const useAppStore = create((set, get) => ({

  selectedDate: today,      // 현재 선택된 날짜
  todosByDate: {},          // 날짜별 투두 목록
  messagesByDate: {},       // 날짜별 저널 메시지 목록
  setSelectedDate: (date) => set({ selectedDate: date }),


  // -----------------------------
  // TODOLIST
  // -----------------------------

  // 투두 추가
  addTodo: (date, text) => {
    const value = text?.trim()
    if (!value) return

    const id = Date.now().toString()
    set((state) => {
      const prev = state.todosByDate[date] || []
      const updated = [...prev, { id, text: value, done: false }]
      return { todosByDate: { ...state.todosByDate, [date]: updated } }
    })
  },

  // 투두 완료 상태 토글
  toggleTodoDone: (date, id) => {
    set((state) => {
      const updated = state.todosByDate[date]?.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ) || []
      return { todosByDate: { ...state.todosByDate, [date]: updated } }
    })
  },

  // 투두 텍스트 수정
  editTodo: (date, id, newText) => {
    set((state) => {
      const updated = state.todosByDate[date]?.map(t =>
        t.id === id ? { ...t, text: newText } : t
      ) || []
      return { todosByDate: { ...state.todosByDate, [date]: updated } }
    })
  },

  // 투두 삭제
  deleteTodo: (date, id) => {
    set((state) => {
      const filtered = state.todosByDate[date]?.filter(t => t.id !== id) || []
      const next = { ...state.todosByDate, [date]: filtered }

      if (filtered.length === 0) delete next[date]

      return { todosByDate: next }
    })
  },

  // 투두 교체
  setTodosForDate: (date, newList) => {
    set((state) => ({
      todosByDate: { ...state.todosByDate, [date]: newList }
    }))
  },



  // -----------------------------
  // JOURNAL
  // -----------------------------

  // 메시지 교체
  setMessagesForDate: (date, newList) => {
    set((state) => ({
      messagesByDate: { ...state.messagesByDate, [date]: newList }
    }))
  },

  // 메시지 추가
  addMessage: (date, message) => {
    set((state) => {
      const prev = state.messagesByDate[date] || []
      const updated = [...prev, message]
      return { messagesByDate: { ...state.messagesByDate, [date]: updated } }
    })
  },

  // 메시지 제거
  clearMessagesForDate: (date) => {
    set((state) => {
      const next = { ...state.messagesByDate }
      delete next[date]
      return { messagesByDate: next }
    })
  },

  
}))
