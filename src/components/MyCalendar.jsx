import { useAppStore } from "../stores/useAppStore"
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled, { createGlobalStyle } from "styled-components";




/* styled-components */
const CalendarWrapper = styled.div`
  background-color: #fff;
  width: 320px;
  height: 320px;
  padding: 10px;
  margin: 10px;

`;
const CalendarStyle = createGlobalStyle`
  /* 오늘 날짜 일반 */
  .react-calendar__tile--now {
    background-color: #ededed !important;
    color: black !important;
  }

  /* 선택된 날짜 */
  .react-calendar__tile--active {
    background-color: #4cafff !important;
    color: white !important;
  }

`;




export default function MyCalendar() {
    const { selectedDate, setSelectedDate } = useAppStore()

    const dateObj = selectedDate ? new Date(selectedDate) : new Date();

    return (
        <CalendarWrapper>
            <CalendarStyle />
            <div>
                <div>현재 선택된 날짜: {selectedDate}</div>
                <Calendar
                    onChange={(data) => {
                        const date = new Date(data)
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, "0")
                        const day = String(date.getDate()).padStart(2, "0")
                        setSelectedDate(`${year}-${month}-${day}`)
                    }}
                    value={dateObj}
                />
            </div>
        </CalendarWrapper>

    )
}
