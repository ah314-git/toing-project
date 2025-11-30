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
            const prev = state.messagesByDate?.[date] || [];
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

    updateMessage: (dateKey, msgId, newText) => {
        set((state) => {
            const messages = state.messagesByDate?.[dateKey];
            if (!messages) return {}; // 해당 날짜가 없으면 아무 것도 안함
            const updated = messages.map(m => m.id === msgId ? { ...m, text: newText } : m);
            return { messagesByDate: { ...state.messagesByDate, [dateKey]: updated } };
        });
    },

    deleteMessage: (dateKey, msgId) => {
        set((state) => {
            const messages = state.messagesByDate?.[dateKey];
            if (!messages) return {}; // 해당 날짜가 없으면 아무 것도 안함
            const updated = messages.filter(m => m.id !== msgId);
            return { messagesByDate: { ...state.messagesByDate, [dateKey]: updated } };
        });
    },





    // -----------------------------
    // SETTINGS 액션
    // -----------------------------


    //기본 설정
    startWeekDay: '일요일',
    setStartWeekDay: (day) => set({ startWeekDay: day }),

    timeFormat: '24h',
    setTimeFormat: (format) => set({ timeFormat: format }),

    showTime: true,
    toggleShowTime: () => set((state) => ({ showTime: !state.showTime })),


    //테마
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    theme: "light",
    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === "light" ? "dark" : "light"
        })),



    //글자 스타일
    fontFamily: 'Arial',
    fontList: ['Arial', '나눔고딕', '나눔손글씨장미체', '휴먼편지체'],
    setFontFamily: (font) => set({ fontFamily: font }),
    setNextFont: () => set((state) => {
        const currentIndex = state.fontList.indexOf(state.fontFamily);
        const nextIndex = (currentIndex + 1) % state.fontList.length;
        return { fontFamily: state.fontList[nextIndex] };
    }),

    fontSize: 16, // 기본 글씨 크기(px)
    fontSizeList: [14, 16, 18, 20], // 순환할 글씨 크기 옵션
    setFontSize: (size) => set({ fontSize: size }),
    setNextFontSize: () => set((state) => {
        const currentIndex = state.fontSizeList.indexOf(state.fontSize);
        const nextIndex = (currentIndex + 1) % state.fontSizeList.length;
        return { fontSize: state.fontSizeList[nextIndex] };
    }),


}));



