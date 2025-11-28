import { create } from "zustand";
import { toDay } from "../utils/date";

const today = toDay(new Date());
const API_BASE_URL = "http://localhost:4000/api/data"; // 서버 데이터 API URL

// ------------------------------------
// 비동기 함수: 서버에서 사용자 데이터 로드
// ------------------------------------
const loadUserData = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        const data = await response.json();
        // 서버에서 받아온 데이터를 반환
        return {
            todosByDate: data.todosByDate,
            messagesByDate: data.messagesByDate,
        };
    } catch (error) {
        console.error("데이터 로드 오류:", error);
        return { todosByDate: {}, messagesByDate: {} }; // 실패 시 빈 객체 반환
    }
};

// ------------------------------------
// 비동기 함수: 서버에 전체 사용자 데이터 저장
// ------------------------------------
const saveUserData = async (userId, todosByDate, messagesByDate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todosByDate, messagesByDate }),
        });
        if (!response.ok) {
            throw new Error('Failed to save user data');
        }
        // console.log("데이터 저장 성공");
    } catch (error) {
        console.error("데이터 저장 오류:", error);
    }
};


export const useAppStore = create((set, get) => ({ // 💡 get 함수 사용 가능하도록 인자 추가
    // -----------------------------
    // 공통 상태
    // -----------------------------
    selectedDate: today, 
    todosByDate: {},
    messagesByDate: {}, 
    isSettingsOpen: false, 
    currentMainView: 'Home',
    currentUserId: null,    
    currentUsername: null,  

    // -----------------------------
    // 공통 액션
    // -----------------------------
    setSelectedDate: (date) => set({ selectedDate: date }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    setCurrentMainView: (viewName) => set({ currentMainView: viewName }),

    // 💡 수정: 비동기 함수로 변경 및 데이터 로드 추가
    login: async (userId, username) => {
        const loadedData = await loadUserData(userId); // 서버에서 데이터 로드
        set(() => ({
            currentUserId: userId,
            currentUsername: username,
            currentMainView: 'Home',
            // 로드된 데이터로 상태 초기화
            todosByDate: loadedData.todosByDate,
            messagesByDate: loadedData.messagesByDate,
        }));
    },

    // 액션: 로그아웃 처리
    logout: () => set(() => ({
        currentUserId: null,
        currentUsername: null,
        currentMainView: 'Login', 
        todosByDate: {},
        messagesByDate: {},
    })),
    
    // -----------------------------
    // TODOLIST 액션 (모두 저장 로직 추가)
    // -----------------------------

    // 투두 추가
    addTodo: (date, text) => {
        const value = text?.trim();
        if (!value) return;
        const id = Date.now().toString();
        
        set((state) => {
            const prev = state.todosByDate[date] || [];
            const updated = [...prev, { id, text: value, done: false }];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 투두 완료 상태 토글
    toggleTodoDone: (date, id) => {
        set((state) => {
            const updated = state.todosByDate[date]?.map(t =>
                t.id === id ? { ...t, done: !t.done } : t
            ) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 투두 텍스트 수정
    editTodo: (date, id, newText) => {
        set((state) => {
            const updated = state.todosByDate[date]?.map(t =>
                t.id === id ? { ...t, text: newText } : t
            ) || [];
            return { todosByDate: { ...state.todosByDate, [date]: updated } };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 투두 삭제
    deleteTodo: (date, id) => {
        set((state) => {
            const filtered = state.todosByDate[date]?.filter(t => t.id !== id) || [];
            const next = { ...state.todosByDate, [date]: filtered };

            if (filtered.length === 0) delete next[date];

            return { todosByDate: next };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 날짜별 투두 목록 교체
    setTodosForDate: (date, newList) => {
        set((state) => ({
            todosByDate: { ...state.todosByDate, [date]: newList }
        }), () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // -----------------------------
    // JOURNAL 액션 (모두 저장 로직 추가)
    // -----------------------------

    // 메시지 목록 교체
    setMessagesForDate: (date, newList) => {
        set((state) => ({
            messagesByDate: { ...state.messagesByDate, [date]: newList }
        }), () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 메시지 추가
    addMessage: (date, message) => {
        set((state) => {
            const prev = state.messagesByDate[date] || [];
            const updated = [...prev, message];
            return { messagesByDate: { ...state.messagesByDate, [date]: updated } };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },

    // 메시지 제거
    clearMessagesForDate: (date) => {
        set((state) => {
            const next = { ...state.messagesByDate };
            delete next[date];
            return { messagesByDate: next };
        }, () => { // 💡 상태 업데이트 후 저장
            const { currentUserId, todosByDate, messagesByDate } = get();
            if (currentUserId) saveUserData(currentUserId, todosByDate, messagesByDate);
        });
    },
}));