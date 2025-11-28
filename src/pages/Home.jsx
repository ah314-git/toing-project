import { useAppStore } from "../stores/useAppStore";
import styled from "styled-components";
import Header from "../components/Header";
import MyCalendar from "../components/MyCalendar";
import MyTodo from "../components/MyTodo";
import MyJournal from "../components/MyJournal";
import Setting from "../components/Setting";
import Login from "../components/Login";
import Register from "../components/Register"; // 👈 추가!

// ------------------------------------
// 스타일 정의: 메인 레이아웃
// ------------------------------------
const Layout = styled.div`
    display: flex;
    gap: 24px;
    overflow: hidden;
    position: relative;
`;

const Left = styled.div`
    width: 500px;
`;

const Right = styled.div`
    flex: 1;
`;

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1500; 
    cursor: pointer;
`;

// ------------------------------------
// Home 컴포넌트
// ------------------------------------
export default function Home() {
    // 앱 상태 및 액션
    const { 
        currentMainView, 
        isSettingsOpen, 
        toggleSettings 
    } = useAppStore();
    
    // 헤더 렌더링 여부 결정
    const showHeader = currentMainView === 'Home';
    
    // 콘텐츠의 상단 마진 (헤더 유무에 따라 조건부 적용)
    const contentMarginTop = showHeader ? '100px' : '0';
    
    return (
        <Layout>
            {/* 메인 뷰일 때 헤더 렌더링 */}
            {showHeader && <Header />}

            {/* 설정창이 열려있을 때 백드롭 렌더링 및 클릭 시 설정창 닫기 */}
            {isSettingsOpen && (
                <Backdrop onClick={toggleSettings} />
            )}
            
            {/* 설정 패널은 항상 렌더링 (isSettingsOpen에 따라 위치 변경) */}
            <Setting />

            {/* 메인 뷰: 캘린더, 투두, 저널 표시 */}
            {currentMainView === 'Home' ? (
                <>
                    <Left style={{ marginTop: contentMarginTop }}>
                        <MyCalendar />
                        <MyTodo />
                    </Left>
                    <Right style={{ marginTop: contentMarginTop }}>
                        <MyJournal />
                    </Right>
                </>
            // 로그인 뷰: 로그인 컴포넌트 표시
            ) : currentMainView === 'Login' ? (
                <Login />
            // 회원가입 뷰: Register 컴포넌트 표시 👈 추가된 부분
            ) : currentMainView === 'Register' ? ( 
                <Register />
            ) : null}

        </Layout>
    );
}