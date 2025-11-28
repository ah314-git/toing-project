import React, { useState, useEffect } from "react";
import styled from "styled-components";
// 전역 상태 관리를 위한 Zustand 스토어 임포트 (화면 전환용)
import { useAppStore } from "../stores/useAppStore"; 

// ------------------------------------
// 정규식 및 상수 정의
// ------------------------------------
// 사용자 이름(아이디) 유효성 검사 정규식: 영문, 숫자 5~20자
const USERNAME_REGEX = /^[a-zA-Z0-9]{5,20}$/; 
// 비밀번호 유효성 검사 정규식: 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// API 기본 URL 정의
const API_BASE_URL = "http://localhost:4000/api/auth"; 

// ------------------------------------
// 스타일 정의 (추가 및 수정된 부분)
// ------------------------------------

// 회원가입 페이지 전체 컨테이너
const RegisterWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    background-color: #f4f7f9;
    padding: 20px;
`;

// 폼 컨테이너
const FormContainer = styled.div`
    background: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px; // 너비 약간 증가
`;

// 폼 제목
const Title = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
`;

// 입력 요소 그룹
const InputGroup = styled.div`
    margin-bottom: 20px;
`;

// 인풋과 버튼을 가로로 배치하기 위한 Flex 컨테이너
const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

// 레이블
const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
`;

// 텍스트 입력 필드
const Input = styled.input`
    flex-grow: 1; // 남은 공간 차지
    padding: 12px;
    // $isValid prop에 따라 테두리 색상 변경
    border: 1px solid ${(props) => (props.$isValid === false ? '#ef4444' : '#ddd')};
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;

    &:focus {
        border-color: #3b82f6;
        outline: none;
    }
`;

// 유효성 검사 결과 메시지 (성공/실패에 따라 색상 변경)
const ValidationMessage = styled.p`
    font-size: 13px;
    margin-top: 5px;
    margin-bottom: 0;
    color: ${(props) => (props.$isValid ? '#10b981' : '#ef4444')};
`;

// 중복 확인 버튼
const CheckDuplicateButton = styled.button`
    padding: 12px 15px;
    min-width: 90px;
    border: none;
    border-radius: 6px;
    background-color: #4f46e5;
    color: white;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        background-color: #4338ca;
    }
    &:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
    }
`;

// 약관 동의 섹션
const TermsSection = styled.div`
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 20px;
    margin-top: 30px;
    margin-bottom: 30px;
`;

// 개별 약관 항목
const TermItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    // 전체 동의 항목을 제외하고 상단에 구분선 추가
    border-top: ${(props) => (props.$isTotal ? 'none' : '1px solid #eee')};
    font-weight: ${(props) => (props.$isTotal ? 'bold' : 'normal')};
    color: ${(props) => (props.$isTotal ? '#333' : '#666')};

    label {
        flex-grow: 1;
        cursor: pointer;
    }
    input {
        margin-left: 10px;
        width: 18px;
        height: 18px;
    }
`;

// 메인 제출 버튼 (스타일 재정의)
const Button = styled.button`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    margin-top: 15px;

    background: #10b981; // 가입하기 버튼 색상 (초록색 계열)
    color: white;
    
    &:hover:not(:disabled) {
        background: #059669;
    }

    &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
    }
`;

// 오류/성공 메시지
const Message = styled.div`
    text-align: center;
    font-weight: 500;
    margin-bottom: 15px;
    // $isSuccess prop에 따라 색상 변경
    color: ${(props) => (props.$isSuccess ? '#059669' : '#ef4444')};
`;


// ------------------------------------
// Register 컴포넌트
// ------------------------------------
export default function Register() {
    // 전역 상태 스토어에서 화면 전환 액션 가져오기
    const { setCurrentMainView } = useAppStore();
    
    // 폼 입력 상태
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 유효성 검사 상태
    const [isUsernameValid, setIsUsernameValid] = useState(null); 
    // 아이디 중복 확인 결과 상태 (null: 미확인/변경, true: 사용 가능, false: 중복/오류)
    const [isIdAvailable, setIsIdAvailable] = useState(null); 
    const [isPasswordValid, setIsPasswordValid] = useState(null);
    const [isPasswordMatch, setIsPasswordMatch] = useState(null);

    // 약관 동의 상태
    const [terms, setTerms] = useState({
        all: false, // 전체 동의
        usage: false, // 이용 약관 (필수)
        service: false, // 서비스 이용 (필수)
    });
    const [formError, setFormError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. [Effect] 아이디 유효성 및 중복 확인 상태 관리
    useEffect(() => {
        // 입력 값이 없으면 모든 상태 초기화
        if (username.length === 0) {
            setIsUsernameValid(null);
            setIsIdAvailable(null); 
            return;
        }
        // 아이디 형식 정규식 검사
        const isValid = USERNAME_REGEX.test(username);
        setIsUsernameValid(isValid);
        
        // 아이디 형식이 바뀌거나 내용이 변경될 때마다 중복 확인 상태 초기화
        if (isValid) {
            setIsIdAvailable(null); // 형식 유효 시 중복 확인을 다시 요청하도록 초기화
        } else {
            setIsIdAvailable(false); // 형식 유효하지 않으면 중복 확인도 불가
        }
    }, [username]);

    // 2. [Effect] 비밀번호 유효성 검사
    useEffect(() => {
        if (password.length === 0) {
            setIsPasswordValid(null);
            return;
        }
        setIsPasswordValid(PASSWORD_REGEX.test(password));
    }, [password]);

    // 3. [Effect] 비밀번호 일치 검사
    useEffect(() => {
        if (confirmPassword.length === 0) {
            setIsPasswordMatch(null);
            return;
        }
        setIsPasswordMatch(password === confirmPassword);
    }, [password, confirmPassword]);


    // [함수] 아이디 중복 확인 API 호출
    const handleCheckDuplicate = async () => {
        // 아이디 형식이 올바르지 않으면 중복 확인 진행 불가
        if (!isUsernameValid) {
            alert("아이디 형식을 먼저 확인해주세요.");
            return;
        }

        setIsLoading(true);

        try {
            // GET /api/auth/check-username/:username API 호출
            const response = await fetch(`${API_BASE_URL}/check-username/${username}`, {
                method: "GET",
            });

            const data = await response.json();

            // 응답이 성공(response.ok)이 아니거나, API 응답이 사용 불가(available: false)인 경우
            if (!response.ok || !data.available) {
                // 사용 불가능 (중복 또는 서버 오류)
                setIsIdAvailable(false);
                setFormError(data.message || "이미 사용 중이거나 중복 확인에 실패했습니다.");
            } else {
                // 사용 가능
                setIsIdAvailable(true);
                setFormError(null);
                alert(`사용 가능한 아이디 (${username}) 입니다.`);
            }

        } catch (error) {
            console.error("중복 확인 API 호출 오류:", error);
            setFormError("서버와의 통신 오류로 중복 확인에 실패했습니다.");
            setIsIdAvailable(false);
        } finally {
            setIsLoading(false);
        }
    };


    // [함수] 약관 전체 동의/해제 핸들러
    const handleCheckAll = (e) => {
        const checked = e.target.checked;
        setTerms({
            all: checked,
            usage: checked,
            service: checked,
        });
    };

    // [함수] 개별 약관 동의/해제 핸들러
    const handleCheckTerm = (name) => (e) => {
        const newTerms = {
            ...terms,
            [name]: e.target.checked,
        };
        // 필수 약관 두 개가 모두 체크되었는지 확인
        const allChecked = newTerms.usage && newTerms.service;
        setTerms({
            ...newTerms,
            all: allChecked, // 전체 동의 상태 업데이트
        });
    };
    
    // [함수] 최종 회원가입 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        // 1. 입력 유효성 검사
        if (!isUsernameValid || !isPasswordValid || !isPasswordMatch) {
            setFormError("입력 정보를 다시 확인해주세요.");
            return;
        }
        // 2. 중복 확인 필수 검사
        if (isIdAvailable !== true) {
            setFormError("아이디 중복 확인이 필요합니다.");
            return;
        }
        // 3. 약관 동의 필수 검사
        if (!terms.usage || !terms.service) {
            setFormError("모든 필수 이용 약관에 동의해야 합니다.");
            return;
        }

        setIsLoading(true);

        try {
            // POST /api/auth/register API 호출
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormError(data.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
                return;
            }

            // 가입 성공
            alert(`"${username}"님, 회원가입이 완료되었습니다!\n로그인 화면으로 이동합니다.`);
            // 화면을 로그인 페이지로 전환
            setCurrentMainView('Login'); 
            
        } catch (err) {
            console.error("회원가입 API 호출 오류:", err);
            setFormError("서버와의 통신에 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // [함수] 아이디 유효성 상태에 따른 메시지 렌더링
    const renderUsernameValidationMessage = () => {
        if (isUsernameValid === null) return '아이디를 입력해주세요.'; // 초기 상태
        
        if (!isUsernameValid) {
            // 형식 불일치
            return '❌ 5~20자의 영문 대소문자, 숫자만 사용 가능합니다.';
        }
        if (isIdAvailable === true) {
            // 중복 확인 성공
            return '✅ 사용 가능한 아이디입니다.';
        }
        if (isIdAvailable === false) {
            // 중복 확인 실패 또는 형식 변경
            return '❌ 아이디 중복 확인이 필요하거나, 이미 사용 중인 아이디입니다.';
        }
        // 형식은 올바르나 아직 중복 확인을 하지 않았을 때
        return '아이디 형식이 올바릅니다. 중복 확인 버튼을 눌러주세요.';
    };

    // 컴포넌트 렌더링
    return (
        <RegisterWrapper>
            <FormContainer>
                <Title>회원가입</Title>
                <form onSubmit={handleSubmit}>
                    
                    {/* 폼 오류 메시지 표시 영역 */}
                    {formError && <Message $isSuccess={false}>{formError}</Message>}

                    {/* 1. 아이디 입력 및 중복 확인 */}
                    <InputGroup>
                        <Label htmlFor="reg-username">아이디:</Label>
                        <InputRow>
                            <Input
                                id="reg-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                // 유효성 상태에 따라 인풋 테두리 색상 변경
                                $isValid={isUsernameValid} 
                                disabled={isLoading}
                            />
                            <CheckDuplicateButton 
                                type="button" 
                                onClick={handleCheckDuplicate}
                                // 아이디가 유효하고, 로딩 중이 아니며, 이미 사용 가능 상태가 아닐 때만 활성화
                                disabled={!isUsernameValid || isLoading || isIdAvailable === true} 
                            >
                                {isLoading ? '확인 중' : '중복확인'}
                            </CheckDuplicateButton>
                        </InputRow>
                        {/* 아이디 유효성 및 중복 확인 메시지 */}
                        <ValidationMessage 
                            // 중복 확인 결과에 따라 메시지 색상 변경
                            $isValid={isUsernameValid && isIdAvailable !== false}
                        >
                            {renderUsernameValidationMessage()}
                        </ValidationMessage>
                    </InputGroup>

                    {/* 2. 비밀번호 입력 */}
                    <InputGroup>
                        <Label htmlFor="reg-password">비밀번호:</Label>
                        <Input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            $isValid={isPasswordValid}
                            disabled={isLoading}
                        />
                        {/* 비밀번호 유효성 메시지 */}
                        {isPasswordValid !== null && (
                            <ValidationMessage $isValid={isPasswordValid}>
                                {isPasswordValid
                                    ? '✅ 비밀번호 형식이 올바릅니다.'
                                    : '❌ 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.'}
                            </ValidationMessage>
                        )}
                    </InputGroup>

                    {/* 3. 비밀번호 확인 */}
                    <InputGroup>
                        <Label htmlFor="reg-confirm-password">비밀번호 확인:</Label>
                        <Input
                            id="reg-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            $isValid={isPasswordMatch}
                            disabled={isLoading}
                        />
                        {/* 비밀번호 일치 메시지 */}
                        {isPasswordMatch !== null && (
                            <ValidationMessage $isValid={isPasswordMatch}>
                                {isPasswordMatch
                                    ? '✅ 비밀번호가 일치합니다.'
                                    : '❌ 비밀번호가 일치하지 않습니다.'}
                            </ValidationMessage>
                        )}
                    </InputGroup>

                    {/* 4. 약관 동의 섹션 */}
                    <TermsSection>
                        {/* 전체 동의 */}
                        <TermItem $isTotal>
                            <label htmlFor="term-all">이용약관 전체동의</label>
                            <input
                                id="term-all"
                                type="checkbox"
                                checked={terms.all}
                                onChange={handleCheckAll}
                                disabled={isLoading}
                            />
                        </TermItem>
                        {/* 이용 약관 (필수) */}
                        <TermItem>
                            <label htmlFor="term-usage">이용약관 동의 (필수)</label>
                            <input
                                id="term-usage"
                                type="checkbox"
                                checked={terms.usage}
                                onChange={handleCheckTerm('usage')}
                                disabled={isLoading}
                            />
                        </TermItem>
                        {/* 서비스 이용 동의 (필수) */}
                        <TermItem>
                            <label htmlFor="term-service">서비스 이용 동의 (필수)</label>
                            <input
                                id="term-service"
                                type="checkbox"
                                checked={terms.service}
                                onChange={handleCheckTerm('service')}
                                disabled={isLoading}
                            />
                        </TermItem>
                    </TermsSection>

                    {/* 5. 가입하기 버튼 */}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "가입 처리 중..." : "가입하기"}
                    </Button>
                    
                </form>
            </FormContainer>
        </RegisterWrapper>
    );
}