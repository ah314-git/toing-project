import React, { useMemo } from "react";
// 캘린더 컴포넌트를 사용하기 위해 라이브러리 임포트
import CalendarLib from "react-calendar";
// 캘린더 라이브러리의 기본 CSS 스타일 임포트
import "react-calendar/dist/Calendar.css";
// 스타일링을 위한 styled-components 임포트 (컴포넌트 스타일 및 전역 스타일)
import styled, { createGlobalStyle } from "styled-components";
// 전역 상태 관리를 위한  Zustand 스토어 임포트
import { useAppStore } from "../stores/useAppStore";
// 날짜 객체를 'YYYY-MM-DD' 형식의 문자열로 변환하는 유틸리티 함수 임포트
import { toDay } from "../utils/date";

// ------------------------------------
// 스타일 정의 (styled-components)
// ------------------------------------

// 캘린더 라이브러리의 특정 클래스 스타일을 오버라이드하기 위한 전역 스타일
const CalendarStyle = createGlobalStyle`
    // 오늘 날짜 타일의 배경색 및 텍스트 색상 변경
    .react-calendar__tile--now {
        background-color: #ededed !important;
        color: black !important;
    }
    // 선택된(클릭된) 날짜 타일의 배경색 및 텍스트 색상 변경
    .react-calendar__tile--active {
        background-color: #8acaffff !important;
        color: white !important;
    }
`;

// 캘린더 전체를 감싸는 컨테이너 스타일
const CalendarWrapper = styled.div`
    // 배경색 설정
    background-color: #fff;
    // 너비 100%
    width: 100%;
    // 상하좌우 마진 설정
    margin: 20px;
    // 상단 패딩 설정 (헤더 위치 조정용)
    padding-top: 100px;

    // 라이브러리 캘린더 컴포넌트 내부 스타일
    .react-calendar {
        // 너비 100%
        width: 100%;
        // 테두리 제거
        border: none;
        // 폰트 크기 설정
        font-size: 18px;
    }

    // 캘린더 라이브러리의 기본 내비게이션(월/년 이동 버튼) 숨기기
    .react-calendar__navigation {
        display: none !important;
    }

    // 날짜 타일 스타일 (날짜 하나하나)
    .react-calendar__tile {
        // 높이와 최대 높이 설정
        height: 80px;
        max-height: 80px;
        // 내용이 넘칠 경우 숨김
        overflow: hidden;
        // Flexbox 레이아웃 적용
        display: flex;
        // 내용을 수직 방향으로 정렬 (날짜 텍스트와 할 일 점)
        flex-direction: column;
    }
`;

// 커스텀 헤더 컨테이너 스타일
const CustomHeader = styled.div`
    // Flexbox 레이아웃
    display: flex;
    // 내용을 수직 방향으로 정렬 (년도, 월 행)
    flex-direction: column;
    // 내용을 가운데 정렬
    align-items: center;
    // 하단 마진
    margin-bottom: 12px;
`;
// 년도 텍스트 스타일
const YearText = styled.div`
    // 폰트 크기 설정
    font-size: 16px;
    // 폰트 굵기 설정 (얇게)
    font-weight: 300;
    // 텍스트 색상
    color: #666;
`;
// 월 표시 및 화살표 버튼을 포함하는 행 스타일
const MonthRow = styled.div`
    // Flexbox 레이아웃
    display: flex;
    // 요소 간 간격 설정
    gap: 30px;
`;
// 현재 월 텍스트 스타일
const MonthText = styled.div`
    // 폰트 크기 설정
    font-size: 24px;
    // 폰트 굵기 설정
    font-weight: 500;
    // 텍스트 색상
    color: #0057ff;
`;
// 월 이동 화살표 버튼 스타일
const Arrow = styled.button`
    // 테두리 제거
    border: none;
    // 배경 제거
    background: none;
    // 폰트 크기 설정
    font-size: 20px;
    // 마우스 오버 시 포인터 변경
    cursor: pointer;
    // 텍스트 색상
    color: #777;
`;
// 할 일 개수를 표시하는 작은 점(Dot) 스타일
const Dot = styled.span`
    // 너비 설정
    width: 6px;
    // 높이 설정
    height: 6px;
    // 배경색 설정 (할 일 표시용 색상)
    background: #2d85ffff;
    // 원형으로 만들기
    border-radius: 50%;
    // 왼쪽 마진 (점 사이 간격)
    margin-left: 2px;

    // 첫 번째 점은 왼쪽 마진을 0으로 설정하여 정렬
    &:first-child {
        margin-left: 0;
    }
`;

// ------------------------------------
// MyCalendar 컴포넌트 정의
// ------------------------------------
export default function MyCalendar() {
    // Zustand 스토어에서 필요한 상태(selectedDate, todosByDate)와 액션(setSelectedDate) 가져오기
    const { selectedDate, setSelectedDate, todosByDate } = useAppStore();

    // selectedDate 상태를 기반으로 Date 객체를 생성 (selectedDate가 없으면 현재 날짜 사용)
    // selectedDate가 변경될 때만 다시 계산되도록 useMemo 사용
    const dateObj = useMemo(
        () => new Date(selectedDate || new Date()),
        [selectedDate] // selectedDate가 변경될 때만 재실행
    );

    // Date 객체에서 현재 년도 추출
    const year = dateObj.getFullYear();
    // Date 객체에서 현재 월 추출 (0부터 시작하므로 +1)
    const month = dateObj.getMonth() + 1;

    // 월을 변경하는 함수 (+1 또는 -1 offset을 인수로 받음)
    const changeMonth = (offset) => {
        // 현재 dateObj를 복사하여 새로운 Date 객체 생성
        const newDate = new Date(dateObj);
        // 복사된 객체의 월을 offset만큼 변경
        newDate.setMonth(newDate.getMonth() + offset);
        // 변경된 날짜를 'YYYY-MM-DD' 문자열로 변환하여 상태 업데이트
        setSelectedDate(toDay(newDate));
    };

    // 캘린더 타일 내부의 콘텐츠를 정의하는 함수 (할 일 점을 표시)
    const tileContent = ({ date, view }) => {
        // 'month' 뷰(월 보기)가 아닐 경우 콘텐츠를 표시하지 않음 (예: 년/세기 보기)
        if (view !== "month") return null;
        
        // 해당 날짜를 키(YYYY-MM-DD)로 변환
        const key = toDay(date);
        // 해당 날짜의 할 일 목록을 스토어에서 가져옴
        const todos = todosByDate[key];
        
        // 할 일이 없거나 목록이 비어 있으면 콘텐츠를 표시하지 않음
        if (!todos || todos.length === 0) return null;
        
        // 표시할 점의 개수를 할 일 개수와 3 중 작은 값으로 제한
        const dotCount = Math.min(todos.length, 3);
        
        // 점을 표시할 JSX 반환
        return (
            // 점들을 감싸는 div 스타일 (가운데 정렬, 상단 마진)
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                {/* dotCount 개수만큼 Dot 컴포넌트를 생성하여 렌더링 */}
                {Array.from({ length: dotCount }).map((_, i) => (
                    // 고유한 key를 사용하여 Dot 컴포넌트 렌더링
                    <Dot key={i} />
                ))}
            </div>
        );
    };

    // 캘린더 컴포넌트 렌더링
    return (
        <CalendarWrapper>
            {/* 전역 스타일 적용 */}
            <CalendarStyle />

            {/* 커스텀 헤더 영역 시작 */}
            <CustomHeader>
                {/* 년도 텍스트 표시 */}
                <YearText>{year}</YearText>
                <MonthRow>
                    {/* 이전 달로 이동하는 버튼 */}
                    <Arrow onClick={() => changeMonth(-1)} aria-label="이전 달">
                        {"<"}
                    </Arrow>
                    {/* 현재 월 텍스트 표시 */}
                    <MonthText>{month}월</MonthText>
                    {/* 다음 달로 이동하는 버튼 */}
                    <Arrow onClick={() => changeMonth(1)} aria-label="다음 달">
                        {">"}
                    </Arrow>
                </MonthRow>
            </CustomHeader>
            {/* 커스텀 헤더 영역 끝 */}

            {/* react-calendar 라이브러리 컴포넌트 */}
            <CalendarLib
                // 날짜가 변경될 때 호출되는 함수 (선택된 날짜를 'YYYY-MM-DD' 형식으로 상태에 저장)
                onChange={(date) => setSelectedDate(toDay(date))}
                // 캘린더에 표시될 현재 선택 값 (날짜 객체)
                value={dateObj}
                // 캘린더가 시작될 월/년도 (현재 선택된 날짜의 월을 중심으로 표시)
                activeStartDate={dateObj}
                // 날짜 타일에 표시되는 날짜 형식을 '일'만 표시하도록 포맷팅
                formatDay={(locale, date) => date.getDate()}
                // 각 날짜 타일 내부에 추가될 콘텐츠를 정의하는 함수 (할 일 점)
                tileContent={tileContent}
            />
        </CalendarWrapper>
    );
}