import React, { useState } from "react";
import styled from "styled-components";
// 전역 상태 관리를 위한 Zustand 스토어 임포트
import { useAppStore } from "../stores/useAppStore"; 

// ------------------------------------
// 정규식 및 상수 정의
// ------------------------------------
// 인증(로그인/회원가입) API의 기본 URL
const API_BASE_URL = "http://localhost:4000/api/auth"; 
// 사용자 이름(아이디) 유효성 검사 정규식: 영문, 숫자 5~20자
const USERNAME_REGEX = /^[a-zA-Z0-9]{5,20}$/; 
// 비밀번호 유효성 검사 정규식: 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ------------------------------------
// 스타일 정의 (styled-components)
// ------------------------------------

// 로그인 페이지 전체 컨테이너
const LoginWrapper = styled.div`
    // Flexbox를 사용하여 전체 화면 중앙 정렬
    display: flex;
    justify-content: center;
    align-items: center;
    // 최소 높이를 뷰포트 높이로 설정
    min-height: 100vh;
    width: 100%;
    // 배경색 설정
    background-color: #f4f7f9;
    padding: 20px;
`;

// 로그인 폼 컨테이너
const FormContainer = styled.div`
    // 배경색
    background: #ffffff;
    // 내부 패딩
    padding: 40px;
    // 모서리 둥글게
    border-radius: 12px;
    // 그림자 효과
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    // 최대 너비 제한
    max-width: 400px;
`;

// 폼 제목 스타일
const Title = styled.h2`
    // 텍스트 중앙 정렬
    text-align: center;
    color: #333;
    // 하단 마진
    margin-bottom: 30px;
    font-size: 28px;
`;

// 입력 요소 그룹 (Label + Input)
const InputGroup = styled.div`
    margin-bottom: 20px;
`;

// 입력 필드의 레이블 스타일
const Label = styled.label`
    // 블록 요소로 만들어 너비를 차지하게 함
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
`;

// 텍스트 입력 필드 스타일
const Input = styled.input`
    // 너비 100%
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    // 패딩과 테두리를 너비 계산에 포함
    box-sizing: border-box;

    // 포커스 시 테두리 색상 변경
    &:focus {
        border-color: #3b82f6;
        outline: none;
    }
`;

// 주요 액션 버튼 (로그인 버튼) 스타일
const Button = styled.button`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;

    // 기본 배경 및 텍스트 색상
    background: #3b82f6; 
    color: white;
    
    // 호버 시 배경색 변경 (비활성화되지 않았을 때만)
    &:hover:not(:disabled) {
        background: #2563eb;
    }

    // 비활성화 상태 스타일
    &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
    }
`;

// 링크처럼 보이는 버튼 (화면 전환용) 스타일
const LinkButton = styled.button`
    width: 100%;
    // 배경 및 테두리 제거
    background: none;
    border: none;
    padding: 10px 0;
    cursor: pointer;
    // 텍스트 색상
    color: #4f46e5;
    font-size: 14px;
    margin-top: 10px;
    
    // 호버 시 밑줄 표시
    &:hover {
        text-decoration: underline;
    }
`;

// 오류 메시지 표시 영역 스타일
const Message = styled.div`
    text-align: center;
    font-weight: 500;
    margin-bottom: 15px;
    // 오류를 나타내는 빨간색 텍스트
    color: #ef4444;
`;


// ------------------------------------
// Login 컴포넌트
// ------------------------------------
export default function Login() {
    // 스토어에서 화면 전환 액션과 로그인 처리 액션 가져오기
    const { setCurrentMainView, login } = useAppStore(); 
    
    // 아이디 입력 상태
    const [username, setUsername] = useState("");
    // 비밀번호 입력 상태
    const [password, setPassword] = useState("");
    // 폼 제출 시 발생하는 오류 메시지 상태
    const [formError, setFormError] = useState(null);
    // 로그인 요청 중인지 여부 (로딩 상태)
    const [isLoading, setIsLoading] = useState(false);

    // [함수] 로그인 버튼 클릭 및 폼 제출 시 처리
    const handleLogin = async (e) => {
        // 폼 기본 제출 동작 방지
        e.preventDefault();
        // 이전 오류 메시지 초기화
        setFormError(null);

        // 입력 필드 필수 유효성 검사
        if (!username || !password) {
            setFormError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        // 로딩 상태 시작
        setIsLoading(true);

        try {
            // 로그인 API 호출 (POST 요청)
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // 입력된 아이디와 비밀번호를 JSON 형태로 전송
                body: JSON.stringify({ username, password }),
            });

            // 응답 데이터를 JSON으로 파싱
            const data = await response.json();

            // HTTP 상태 코드가 성공(2xx)일 경우
            if (response.ok) {
                // 성공 알림 메시지
                alert(`환영합니다, ${data.username}님!`);
                // 전역 상태에 사용자 정보 저장 및 로그인 처리
                await login(data.userId, data.username);
                // 로그인 성공 후 자동으로 메인 화면으로 이동
                
            } else {
                // 서버에서 받은 오류 메시지 표시 (없으면 기본 메시지)
                setFormError(data.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
            }

        } catch (err) {
            // API 호출 자체에서 발생한 오류 (네트워크 등) 처리
            console.error("로그인 API 호출 오류:", err);
            // 사용자에게 표시할 오류 메시지
            setFormError("서버와의 통신에 문제가 발생했습니다. 서버 실행 상태를 확인해주세요.");
        } finally {
            // 로딩 상태 종료 (성공/실패 무관)
            setIsLoading(false);
        }
    };
    
    // [함수] 회원가입 페이지로 화면 전환
    const handleGoRegister = () => {
        setCurrentMainView('Register');
    };
    
    // [함수] 메인 화면(Home)으로 화면 전환
    const handleGoHome = () => {
        setCurrentMainView('Home');
    };


    // 컴포넌트 렌더링
    return (
        <LoginWrapper>
            <FormContainer>
                <Title>로그인</Title>
                <form onSubmit={handleLogin}>
                    
                    {/* 폼 오류 메시지 표시 영역 */}
                    {formError && <Message>{formError}</Message>}
                    
                    {/* 아이디 입력 그룹 */}
                    <InputGroup>
                        <Label htmlFor="login-username">아이디</Label>
                        <Input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // 상태 업데이트
                            disabled={isLoading} // 로딩 중에는 비활성화
                        />
                    </InputGroup>

                    {/* 비밀번호 입력 그룹 */}
                    <InputGroup>
                        <Label htmlFor="login-password">비밀번호</Label>
                        <Input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // 상태 업데이트
                            disabled={isLoading} // 로딩 중에는 비활성화
                        />
                    </InputGroup>

                    {/* 로그인 제출 버튼 */}
                    <Button type="submit" disabled={isLoading}>
                        {/* 로딩 상태에 따라 버튼 텍스트 변경 */}
                        {isLoading ? "로그인 중..." : "로그인"}
                    </Button>
                    
                    {/* 회원가입 페이지로 이동 버튼 */}
                    <LinkButton type="button" onClick={handleGoRegister}>
                        아직 회원이 아니신가요? 회원가입
                    </LinkButton>
                    
                    {/* 메인 화면으로 돌아가기 버튼 */}
                    <LinkButton type="button" onClick={handleGoHome}>
                        이전 화면으로 돌아가기
                    </LinkButton>
                    
                </form>
            </FormContainer>
        </LoginWrapper>
    );
}