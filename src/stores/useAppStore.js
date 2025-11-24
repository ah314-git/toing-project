import { create } from "zustand"

// 오늘 날짜 계산
const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2, "0")
const day = String(today.getDate()).padStart(2, "0")
const formattedToday = `${year}-${month}-${day}`

export const useAppStore = create((set) => ({
    selectedDate: formattedToday,
    setSelectedDate: (date) => set({ selectedDate: date }),
}))
