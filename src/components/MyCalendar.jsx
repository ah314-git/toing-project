import React, { useMemo } from "react"
import CalendarLib from "react-calendar"
import "react-calendar/dist/Calendar.css"
import styled, { createGlobalStyle } from "styled-components"
import { useAppStore } from "../stores/useAppStore"
import { toDay } from "../utils/date"



const CalendarStyle = createGlobalStyle`
  .react-calendar__tile--now {
    background-color: #ededed !important;
    color: black !important;
  }
  .react-calendar__tile--active {
    background-color: #8acaffff !important;
    color: white !important;
  }
`

const CalendarWrapper = styled.div`
  background-color: #fff;
  width: 100%;
  margin: 20px;
  padding-top: 100px;

  .react-calendar {
    width: 100%;
    border: none;
    font-size: 18px;
  }

  .react-calendar__navigation {
    display: none !important;
  }

  .react-calendar__tile {
    height: 80px;
    max-height: 80px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`

/* ========== 커스텀 헤더 ========== */
const CustomHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
`
const YearText = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: #666;
`
const MonthRow = styled.div`
  display: flex;
  gap: 30px;
`
const MonthText = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #0057ff;
`
const Arrow = styled.button`
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
`
const Dot = styled.span`
  width: 6px;
  height: 6px;
  background: #2d85ffff;
  border-radius: 50%;
  margin-left: 2px;

  &:first-child {
    margin-left: 0;
  }
`




export default function MyCalendar() {

  const { selectedDate, setSelectedDate, todosByDate } = useAppStore()

  // 선택된 날짜 객체
  const dateObj = useMemo(
    () => new Date(selectedDate || new Date()),
    [selectedDate]
  )

  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1

  // 날짜 이동하기
  const changeMonth = (offset) => {
    const newDate = new Date(dateObj)
    newDate.setMonth(newDate.getMonth() + offset)
    setSelectedDate(toDay(newDate))
  }

  // 일정 표시
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null
    const key = toDay(date)
    const todos = todosByDate[key]
    if (!todos || todos.length === 0) return null
    const dotCount = Math.min(todos.length, 3)
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <Dot key={i} />
        ))}
      </div>
    )
  }


  return (
    <CalendarWrapper>
      <CalendarStyle />

      {/* 헤더 */}
      <CustomHeader>
        <YearText>{year}</YearText>
        <MonthRow>
          <Arrow onClick={() => changeMonth(-1)} aria-label="이전 달">
            {"<"}
          </Arrow>
          <MonthText>{month}월</MonthText>
          <Arrow onClick={() => changeMonth(1)} aria-label="다음 달">
            {">"}
          </Arrow>
        </MonthRow>
      </CustomHeader>

      {/* 캘린더 */}
      <CalendarLib
        onChange={(date) => setSelectedDate(toDay(date))}
        value={dateObj}
        activeStartDate={dateObj}
        formatDay={(locale, date) => date.getDate()}
        tileContent={tileContent}
      />
      
    </CalendarWrapper>
  )
}
