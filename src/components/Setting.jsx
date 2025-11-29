import React, { useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import "../css/Setting.css";

const SETTINGS_MENU = [
    { id: 'basic', title: '기본 설정', subItems: ['시작 요일', '시간 형식', '시간 표시', '언어'] },
    { id: 'theme', title: '테마', subItems: ['다크 모드', '색상 팔레트'] },
    { id: 'font', title: '글자 스타일', subItems: ['글꼴', '크기'] },
    { id: 'data', title: '데이터 관리', subItems: ['백업', '복원', '데이터 삭제'] },
    { id: 'terms', title: '이용 약관', subItems: [] },
    { id: 'privacy', title: '개인정보 처리방침', subItems: [] },
];

export default function Setting() {
    const { isSettingsOpen, toggleSettings, setCurrentMainView } = useAppStore();
    const [openMenuId, setOpenMenuId] = useState(null);

    const handleMenuClick = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleSubItemClick = (id, subItem) => {
        if (id === 'account' && subItem === '로그인/로그아웃') {
            setCurrentMainView('Login');
            toggleSettings();
        } else {
            alert(`${subItem} 설정 열기`);
        }
        setOpenMenuId(null);
    };

    return (
        <div className={`setting-wrapper ${isSettingsOpen ? 'open' : ''}`}>

            <button className="setting-back-button" onClick={toggleSettings}>→</button>


            {SETTINGS_MENU.map((menu) => (
                <div className="menu-item" key={menu.id}>
                    <div className="menu-header" onClick={() => handleMenuClick(menu.id)}>
                        {menu.title}
                        {menu.subItems.length > 0 && (
                            <span className={`arrow ${openMenuId === menu.id ? 'open' : ''}`}>▶</span>
                        )}
                    </div>
                    <div className={`sub-menu ${openMenuId === menu.id ? 'open' : ''}`}>
                        {menu.subItems.map((subItem) => (
                            <div
                                key={subItem}
                                className="sub-item"
                                onClick={() => handleSubItemClick(menu.id, subItem)}
                            >
                                {subItem}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
