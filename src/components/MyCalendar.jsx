import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAppStore } from "../stores/useAppStore";
import { toDay } from "../utils/date";
import "../css/MyCalendar.css";

function Dot() {
    return <span className="calendar-dot" />;
}

export default function MyCalendar() {
    const { selectedDate, setSelectedDate, todosByDate, startWeekDay, fontFamily } = useAppStore();
    const dateObj = useMemo(() => new Date(selectedDate || new Date()), [selectedDate]);

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const changeMonth = (offset) => {
        const newDate = new Date(dateObj);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(toDay(newDate));
    };

    const tileContent = ({ date, view }) => {
        if (view !== "month") return null;
        const key = toDay(date);
        const todos = todosByDate[key];
        if (!todos || todos.length === 0) return null;

        const dotCount = Math.min(todos.length, 3);
        return (
            <div className="calendar-dot-wrapper">
                {Array.from({ length: dotCount }).map((_, i) => (
                    <Dot key={i} />
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-wrapper" style={{ fontFamily }}>
            <div className="calendar-header">
                <div className="calendar-year-text">{year}</div>
                <div className="calendar-month-row">
                    <button className="calendar-arrow" onClick={() => changeMonth(-1)} aria-label="이전 달" style={{ fontFamily }}>
                        {"<"}
                    </button>
                    <div className="calendar-month-text" style={{ fontFamily }}>{month}월</div>
                    <button className="calendar-arrow" onClick={() => changeMonth(1)} aria-label="다음 달" style={{ fontFamily }}>
                        {">"}
                    </button>
                </div>
            </div>

            <Calendar
                onChange={(date) => setSelectedDate(toDay(date))}
                value={dateObj}
                activeStartDate={dateObj}
                formatDay={(locale, date) => date.getDate()}
                tileContent={tileContent}
                locale={startWeekDay === '일요일' ? "en-US" : "en-GB"}
                className="react-calendar"
                style={{ fontFamily }}
            />
        </div>
    );
}
