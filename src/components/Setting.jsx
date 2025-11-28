import React, { useState } from "react";
import styled from "styled-components";
import { useAppStore } from "../stores/useAppStore"; 

// ------------------------------------
// 설정 메뉴 데이터 정의
// ------------------------------------
const SETTINGS_MENU = [
    { id: 'basic', title: '기본 설정', subItems: ['시작 요일', '시간 형식', '시간 표시', '언어'] },
    { id: 'theme', title: '테마', subItems: ['다크 모드', '색상 팔레트'] }, 
    { id: 'font', title: '글자 스타일', subItems: ['글꼴', '크기'] },
    { id: 'data', title: '데이터 관리', subItems: ['백업', '복원', '데이터 삭제'] },
    { id: 'terms', title: '이용 약관', subItems: [] },
    { id: 'privacy', title: '개인정보 처리방침', subItems: [] },
];

// ------------------------------------
// 스타일 정의: 설정 패널
// ------------------------------------
const PanelWrapper = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 380px;
    height: 100vh;
    background-color: #f7f7f7;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    transition: transform 0.3s ease-in-out;
    transform: ${(p) => (p.$isOpen ? "translateX(0)" : "translateX(100%)")};
    overflow-y: auto;
    padding: 24px;
`;

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    margin-right: 16px;
    color: #333;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 20px;
    color: #333;
`;

const MenuItem = styled.div`
    background: #ffffff;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
`;

const MenuHeader = styled.div`
    padding: 12px 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #222;

    &:hover {
        background: #f0f0f0;
    }
`;

const SubMenu = styled.div`
    padding: 0 16px;
    background: #fafafa;
    max-height: ${(p) => (p.$isOpen ? '300px' : '0')};
    transition: max-height 0.3s ease-in-out;
    overflow: hidden;
`;

const SubItem = styled.div`
    padding: 8px 0;
    font-size: 14px;
    color: #666;
    border-top: 1px solid #eee;
    cursor: pointer;

    &:first-child {
        border-top: none;
    }

    &:hover {
        color: #257cff;
    }
`;

const Arrow = styled.span`
    transform: rotate(${(p) => (p.$isOpen ? '90deg' : '0deg')});
    transition: transform 0.2s;
    color: #aaa;
`;


// ------------------------------------
// Setting 컴포넌트
// ------------------------------------
export default function Setting() {
    // 앱 상태 및 액션
    const { 
        isSettingsOpen, 
        toggleSettings, 
        setCurrentMainView
    } = useAppStore(); 

    // 로컬 상태: 열린 아코디언 메뉴 ID
    const [openMenuId, setOpenMenuId] = useState(null); 

    // 아코디언 메뉴 토글
    const handleMenuClick = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // 서브 메뉴 항목 클릭 핸들러
    const handleSubItemClick = (id, subItem) => {
        // 계정 관련 항목 클릭 시 메인 뷰 전환
        if (id === 'account' && subItem === '로그인/로그아웃') {
            setCurrentMainView('Login'); 
            toggleSettings(); 
        } else {
            // 기타 설정 항목 처리
            alert(`${subItem} 설정 열기`);
        }
        setOpenMenuId(null);
    };


    return (
        <PanelWrapper $isOpen={isSettingsOpen}>
            <HeaderContainer>
                {/* 뒤로가기 버튼 클릭 시 설정창 닫기 */}
                <BackButton onClick={toggleSettings}>←</BackButton>
                <Title>설정</Title>
            </HeaderContainer>

            {/* 설정 메뉴 목록 렌더링 */}
            {SETTINGS_MENU.map((menu) => (
                <MenuItem key={menu.id}>
                    <MenuHeader onClick={() => handleMenuClick(menu.id)}>
                        {menu.title}
                        {menu.subItems.length > 0 && 
                            <Arrow $isOpen={openMenuId === menu.id}>▶</Arrow>
                        }
                    </MenuHeader>

                    {/* 서브 메뉴 (아코디언) */}
                    <SubMenu $isOpen={openMenuId === menu.id}>
                        {menu.subItems.map((subItem) => (
                            <SubItem key={subItem} onClick={() => handleSubItemClick(menu.id, subItem)}> 
                                {subItem}
                            </SubItem>
                        ))}
                    </SubMenu>
                </MenuItem>
            ))}
        </PanelWrapper>
    );
}