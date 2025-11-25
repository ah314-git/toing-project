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
  padding: 10px;
  margin: 10px;

  .react-calendar {
    width: 100%;
    border: none;
  }
  .react-calendar__tile {
    height: 50px;          /* 원하는 고정 높이 */
    max-height: 50px;      /* 최대 높이 고정 */
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

`;


const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #2d85ffff;
  border-radius: 50%;

  margin-top: 4px;
  margin-left: 2px;
  &:first-child {
    margin-left: 0;    /* 첫 번째 dot은 margin 없게 */
  }
`;

const CalendarStyle = createGlobalStyle`
  /* 오늘 날짜 일반 */
  .react-calendar__tile--now {
    background-color: #ededed !important;
    color: black !important;
  }

  /* 선택된 날짜 */
  .react-calendar__tile--active {
    background-color: #8acaffff !important;
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
                // 최대 3개의 점만 표시
                const dotCount = Math.min(list.length, 3);
                return (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                    {Array.from({ length: dotCount }).map((_, i) => (
                      <Dot key={i} />
                    ))}
                  </div>
                );
              }
            }
            return null;
          }}
        />
      </div>
    </CalendarWrapper>

  )
}
