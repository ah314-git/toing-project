import { create } from "zustand";
import { toDay } from "../utils/date";

const today = toDay(new Date());

export const useAppStore = create((set, get) => ({

    selectedDate: today,
    todosByDate: {},
    messagesByDate: {},
    isSettingsOpen: false,
    currentMainView: 'Home',
    currentUserId: null,
    currentUsername: null,

    setSelectedDate: (date) => set({ selectedDate: date }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    setCurrentMainView: (viewName) => set({ currentMainView: viewName }),

    login: async (userId, username) => {
        set(() => ({
            currentUserId: userId,
            currentUsername: username,
            currentMainView: 'Home',
            todosByDate: {},
            messagesByDate: {},
        }));
    },

    logout: () => set(() => ({
        currentUserId: null,
        currentUsername: null,
        currentMainView: 'Login',
        todosByDate: {},
        messagesByDate: {},
    })),

    // -----------------------------
    // TODOLIST 액션
    // -----------------------------
    addTodo: (date, text) => {
        const value = text?.trim();
        if (!value) return;
        const id = Date.now().toString();

        set((state) => {
            const prev = state.todosByDate[date] || [];
            const updated = [...prev, { id, text: value, done: false }];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        });
    },

    toggleTodoDone: (date, id) => {
        set((state) => {
            const updated = state.todosByDate[date]?.map(t =>
                t.id === id ? { ...t, done: !t.done } : t
            ) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        });
    },

    editTodo: (date, id, newText) => {
        set((state) => {
            const updated = state.todosByDate[date]?.map(t =>
                t.id === id ? { ...t, text: newText } : t
            ) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        });
    },

    deleteTodo: (date, id) => {
        set((state) => {
            const filtered = state.todosByDate[date]?.filter(t => t.id !== id) || [];
            const next = { ...state.todosByDate, [date]: filtered };

            if (filtered.length === 0) delete next[date];

            return { todosByDate: next };
        });
    },

    setTodosForDate: (date, newList) => {
        set((state) => ({
            todosByDate: { ...state.todosByDate, [date]: newList }
        }));
    },

    // -----------------------------
    // JOURNAL 액션
    // -----------------------------
    setMessagesForDate: (date, newList) => {
        set((state) => ({
            messagesByDate: { ...state.messagesByDate, [date]: newList }
        }));
    },

    addMessage: (date, message) => {
        set((state) => {
            const prev = state.messagesByDate[date] || [];
            const updated = [...prev, message];
            return { messagesByDate: { ...state.messagesByDate, [date]: updated } };
        });
    },

    clearMessagesForDate: (date) => {
        set((state) => {
            const next = { ...state.messagesByDate };
            delete next[date];
            return { messagesByDate: next };
        });
    },


    // -----------------------------
    // SETTINGS 액션
    // -----------------------------


    startWeekDay: '일요일',
    setStartWeekDay: (day) => set({ startWeekDay: day }),

    timeFormat: '24h',
    setTimeFormat: (format) => set({ timeFormat: format }),

    showTime: true,
    toggleShowTime: () => set((state) => ({ showTime: !state.showTime })),




}));



