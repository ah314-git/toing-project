import React from "react";
import styled from "styled-components";
import { useAppStore } from "../stores/useAppStore";
// MdSettings, MdAccountCircle 아이콘은 현재 렌더링에 사용되지 않으므로 유지해도 무방합니다.

// ------------------------------------
// 스타일 정의: 헤더 및 요소 (원본 디자인 100% 유지)
// ------------------------------------
const HeaderWrapper = styled.header`
    width: 100%;
    height: 100px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
`;

const Logo = styled.h1`
    font-size: 36px;
    font-weight: bold;
    background: linear-gradient(180deg, #5f9dffff 40%, #ff80c0ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-right: 50px;
`;

const ActionButton = styled.button`
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    background: ${(props) => (props.$primary ? '#3b82f6' : '#6b7280')};
    color: white;
    cursor: pointer;
    font-weight: 500;
`;

// ------------------------------------
// Header 컴포넌트
// ------------------------------------
export default function Header() {
    // 💡 변경: Zustand Store에서 로그인 상태와 로그아웃 액션을 가져옵니다.
    const { 
        toggleSettings, 
        setCurrentMainView, 
        currentUserId,   // 로그인 상태 확인용
        currentUsername, // 표시용
        logout           // 로그아웃 액션
    } = useAppStore();

    // '로그인/로그아웃' 버튼 클릭 핸들러
    const handleAccountClick = () => {
        if (currentUserId) {
            // 💡 로그인 상태일 때: 로그아웃 처리
            if(window.confirm(`${currentUsername}님, 정말 로그아웃 하시겠어요?`)){
                logout();
            }
        } else {
            // 💡 비로그인 상태일 때: 로그인 뷰로 전환
            setCurrentMainView('Login');
        }
    };

    return (
        <HeaderWrapper>
            <Logo>TOING</Logo>
            <ButtonGroup>
                {/* 💡 변경된 부분: 텍스트 및 클릭 로직 동적 변경 */}
                <ActionButton onClick={handleAccountClick}>
                    {currentUserId 
                        ? `${currentUsername} (로그아웃)` // 로그인 시: 사용자 이름 표시 및 로그아웃 버튼
                        : '로그인'}
                </ActionButton>
                
                <ActionButton $primary onClick={toggleSettings}>
                    설정
                </ActionButton>
            </ButtonGroup>
        </HeaderWrapper>
    );
}