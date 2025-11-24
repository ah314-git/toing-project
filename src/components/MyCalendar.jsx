import React from "react";
import Calendar from "react-calendar";
import CalendarLib from "react-calendar";
import "react-calendar/dist/Calendar.css";

import styled, { createGlobalStyle } from "styled-components";
import { useAppStore } from "../stores/useAppStore"
import { toDay } from "../utils/date";





/* styled-components */
const CalendarWrapper = styled.div`
  background-color: #fff;
  width: 320px;
  height: 320px;
  padding: 10px;
  margin: 10px;

`;

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #6ba9ff;
  border-radius: 50%;
  margin-top: 4px;
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
  const { selectedDate, setSelectedDate, todosByDate } = useAppStore()
  const dateObj = selectedDate ? new Date(selectedDate) : new Date();

  return (
    <CalendarWrapper>
      <CalendarStyle />
      <div>
        <div>현재 선택된 날짜: {selectedDate}</div>
        <CalendarLib
          onChange={(date) => setSelectedDate(toDay(date))}
          value={new Date(dateObj)}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const key = toDay(date);
              const list = todosByDate[key];
              if (list && list.length > 0) {
                return <Dot />;
              }
            }
            return null;
          }}
        />
      </div>
    </CalendarWrapper>

  )
}
