import { create } from "zustand"
import { toDay } from "../utils/date";

const today = toDay(new Date());

export const useAppStore = create((set, get) => ({
    selectedDate: today,
    todosByDate: {},
    setSelectedDate: (date) => set({ selectedDate: date }),

    //todo add
    addTodo: (date, text) => {
        if (!text || !text.trim()) return;
        const id = Date.now().toString();
        set((state) => {
            const list = state.todosByDate[date] ? [...state.todosByDate[date]] : [];
            list.push({ id, text: text.trim(), done: false });
            return { todosByDate: { ...state.todosByDate, [date]: list } };
        });
    },

    toggleTodoDone: (date, id) => {
        set((state) => {
            const list = state.todosByDate[date]?.map(t => t.id === id ? { ...t, done: !t.done } : t) || [];
            return { todosByDate: { ...state.todosByDate, [date]: list } };
        });
    },

    editTodo: (date, id, newText) => {
        set((state) => {
            const list = state.todosByDate[date]?.map(t => t.id === id ? { ...t, text: newText } : t) || [];
            return { todosByDate: { ...state.todosByDate, [date]: list } };
        });
    },

    deleteTodo: (date, id) => {
        set((state) => {
            const list = state.todosByDate[date]?.filter(t => t.id !== id) || [];
            const copy = { ...state.todosByDate, [date]: list };
            if (list.length === 0) delete copy[date];
            return { todosByDate: copy };
        });
    },

    setTodosForDate: (date, newList) => {
        set((state) => ({
            todosByDate: {
                ...state.todosByDate,
                [date]: newList
            }
        }));
    }


}));
