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

    // -----------------------------
    // 기본 액션
    // -----------------------------
    setSelectedDate: (date) => set({ selectedDate: date }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    setCurrentMainView: (viewName) => set({ currentMainView: viewName }),

    login: async (userId, username) => {
        const res = await fetch(`api/data/${userId}`);
        const data = await res.json();
        set(() => ({
            currentUserId: userId,
            currentUsername: username,
            currentMainView: 'Home',
            todosByDate: data.todosByDate || {},
            messagesByDate: data.messagesByDate || {},
        }));
    },

    logout: () => set(() => ({
        currentUserId: null,
        currentUsername: null,
        currentMainView: 'Login',
        todosByDate: {},
        messagesByDate: {},
    })),

    saveUserData: async () => {
        const { currentUserId, todosByDate, messagesByDate } = get();
        if (!currentUserId) return;

        await fetch(`api/data/${currentUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todosByDate, messagesByDate })
        });
    },

    // -----------------------------
    // TODOLIST 액션 (날짜별 관리)
    // -----------------------------
    addTodo: async (date, text) => {
        if (!text?.trim()) return;
        const id = Date.now().toString();

        set(state => {
            const prev = state.todosByDate[date] || [];
            return { todosByDate: { ...state.todosByDate, [date]: [...prev, { id, text: text.trim(), done: false }] } };
        });

        await get().saveUserData();
    },

    toggleTodoDone: async (date, id) => {
        set(state => {
            const updated = state.todosByDate[date]?.map(t => t.id === id ? { ...t, done: !t.done } : t) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        });

        await get().saveUserData();
    },

    editTodo: async (date, id, newText) => {
        set(state => {
            const updated = state.todosByDate[date]?.map(t => t.id === id ? { ...t, text: newText } : t) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        });

        await get().saveUserData();
    },

    deleteTodo: async (date, id) => {
        set(state => {
            const filtered = state.todosByDate[date]?.filter(t => t.id !== id) || [];
            const next = { ...state.todosByDate, [date]: filtered };
            if (filtered.length === 0) delete next[date];
            return { todosByDate: next };
        });

        await get().saveUserData();
    },

    setTodosForDate: async (date, newList) => {
        set(state => ({ todosByDate: { ...state.todosByDate, [date]: newList } }));
        await get().saveUserData();
    },

    // -----------------------------
    // JOURNAL 액션 (날짜별 관리)
    // -----------------------------
    setMessagesForDate: async (date, newList) => {
        set(state => ({
            messagesByDate: { ...state.messagesByDate, [date]: newList }
        }));
        await saveUserData();
    },

    addMessage: async (date, message) => {
    set(state => {
        const prev = state.messagesByDate[date] || [];
        return {
            messagesByDate: {
                ...state.messagesByDate,
                [date]: [...prev, message]
            }
        };
    });

    // DB에 날짜별 메시지 저장
    await get().saveUserData();
},


    updateMessage: async (date, msgId, newText) => {
        set(state => {
            const messages = state.messagesByDate[date] || [];
            const updated = messages.map(m => m.id === msgId ? { ...m, text: newText } : m);
            return { messagesByDate: { ...state.messagesByDate, [date]: updated } };
        });
        await get().saveUserData();
    },

    deleteMessage: async (date, msgId) => {
        set(state => {
            const messages = state.messagesByDate[date] || [];
            const updated = messages.filter(m => m.id !== msgId);
            return { messagesByDate: { ...state.messagesByDate, [date]: updated } };
        });
        await get().saveUserData();
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

    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

    fontFamily: 'Arial',
    fontList: ['Arial', '나눔고딕', '나눔손글씨장미체', '휴먼편지체'],
    setFontFamily: (font) => set({ fontFamily: font }),
    setNextFont: () => set((state) => {
        const currentIndex = state.fontList.indexOf(state.fontFamily);
        return { fontFamily: state.fontList[(currentIndex + 1) % state.fontList.length] };
    }),

    fontSize: 16,
    fontSizeList: [14, 16, 18, 20],
    setFontSize: (size) => set({ fontSize: size }),
    setNextFontSize: () => set((state) => {
        const currentIndex = state.fontSizeList.indexOf(state.fontSize);
        return { fontSize: state.fontSizeList[(currentIndex + 1) % state.fontSizeList.length] };
    }),
}));
