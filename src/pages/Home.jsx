import { useAppStore } from "../stores/useAppStore"
import MyCalendar from "../components/MyCalendar";
import MyTodo from "../components/MyTodo";
import MyJournal from "../components/MyJournal";

export default function Home() {
    return (
        <div>
            <MyCalendar />
            <MyTodo />
            <MyJournal />
        </div>
    );

}
