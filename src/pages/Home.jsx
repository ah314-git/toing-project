import { useAppStore } from "../stores/useAppStore"
import styled from "styled-components"
import Header from "../components/Header";
import MyCalendar from "../components/MyCalendar";
import MyTodo from "../components/MyTodo";
import MyJournal from "../components/MyJournal";

const Layout = styled.div`
  display: flex;
  gap: 24px;
  overflow: hidden;
`

const Left = styled.div`
  width: 500px;
`

const Right = styled.div`
  flex: 1;
`

export default function Home() {
    return (
        <Layout>
            <Header></Header>
            <Left>
                <MyCalendar />
                <MyTodo />
            </Left>

            <Right>
                <MyJournal />
            </Right>
        </Layout>
    );

}
