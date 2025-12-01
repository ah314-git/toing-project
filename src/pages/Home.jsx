import { useAppStore } from "../stores/useAppStore";
import "../css/Home.css";
import Header from "../components/Header";
import MyCalendar from "../components/MyCalendar";
import MyTodo from "../components/MyTodo";
import MyJournal from "../components/MyJournal";
import Setting from "../components/Setting";
import Login from "../components/Login";
import Register from "../components/Register";

export default function Home() {
    const {
        currentMainView,
        isSettingsOpen,
        toggleSettings,
        theme
    } = useAppStore();

    const showHeader = currentMainView === 'Home';
    const contentMarginTop = showHeader ? '100px' : '0';

    return (
        <div className={`layout ${theme === 'dark' ? 'dark' : ''}`}>
            {showHeader && <Header />}
            {isSettingsOpen && <div className="backdrop" onClick={toggleSettings} />}
            <Setting />

            {currentMainView === 'Home' ? (
                <>
                    <div className="left" style={{ marginTop: contentMarginTop }}>
                        <MyCalendar />
                        <MyTodo />
                    </div>
                    <div className="right" style={{ marginTop: contentMarginTop }}>
                        <MyJournal />
                    </div>
                </>
            ) : currentMainView === 'Login' ? (
                <Login />
            ) : currentMainView === 'Register' ? (
                <Register />
            ) : null}
        </div>
    );
}