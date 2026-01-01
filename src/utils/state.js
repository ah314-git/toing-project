// 초기 상태
export const getInitialUserState = () => ({
    currentUserId: null,
    currentUsername: null,
    todosByDate: {},
    messagesByDate: {},
});


// TODOLIST 액션
export const addTodoForDate = (todosByDate, date, text) => {
    const value = text?.trim();
    if (!value) return todosByDate;
    const id = Date.now().toString();
    const prev = todosByDate[date] || [];
    return { ...todosByDate, [date]: [...prev, { id, text: value, done: false }] };
};

export const toggleTodoDoneForDate = (todosByDate, date, id) => {
    const updated = todosByDate[date]?.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
    ) || [];
    return { ...todosByDate, [date]: updated };
};

export const editTodoForDate = (todosByDate, date, id, newText) => {
    const updated = todosByDate[date]?.map(t =>
        t.id === id ? { ...t, text: newText } : t
    ) || [];
    return { ...todosByDate, [date]: updated };
};

export const deleteTodoForDate = (todosByDate, date, id) => {
    const filtered = todosByDate[date]?.filter(t => t.id !== id) || [];
    const next = { ...todosByDate, [date]: filtered };
    if (filtered.length === 0) delete next[date];
    return next;
};



// -----------------------------
// JOURNAL 액션
// -----------------------------
export const addMessageForDate = (messagesByDate, date, message) => {
    const prev = messagesByDate[date] || [];
    return { ...messagesByDate, [date]: [...prev, message] };
};

export const setMessagesForDate = (messagesByDate, date, newList) => ({
    ...messagesByDate,
    [date]: newList
});

export const clearMessagesForDate = (messagesByDate, date) => {
    const next = { ...messagesByDate };
    delete next[date];
    return next;
};


