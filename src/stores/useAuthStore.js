import { create } from 'zustand';

// Firebase/Auth Imports
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // DB 접근을 위해 임포트

// ------------------------------------
// [Firebase 환경 변수 로드]
// ------------------------------------
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let auth = null;
let db = null;
let isFirebaseInitialized = false;

if (firebaseConfig.projectId) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app); // 인증 서비스 초기화
        db = getFirestore(app); // 데이터베이스 서비스 초기화
        isFirebaseInitialized = true;
        console.log("Firebase Auth/DB 초기화 성공.");
    } catch (error) {
        console.error("Firebase 초기화 중 오류 발생: .env 파일을 확인하세요.", error);
    }
} else {
    console.warn("Firebase 환경 변수가 설정되지 않았습니다. 인증 및 데이터 저장이 비활성화됩니다.");
}

// ------------------------------------
// [Zustand Auth Store 생성 및 액션 정의]
// ------------------------------------
export const useAuthStore = create((set) => ({
    // 1. 인증 상태
    user: null, // Firebase user 객체
    isAuthenticated: false,
    authLoading: true, // 초기 인증 상태 확인 중

    // 2. 인증 액션

    // 비동기: 회원가입 (Firebase createUserWithEmailAndPassword 사용)
    register: async (email, password) => {
        if (!isFirebaseInitialized) throw new Error("Firebase is not initialized.");
        try {
            // Firebase Authentication을 통해 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("회원가입 성공:", userCredential.user.email);
            // 사용자 생성 후, 자동으로 로그인 상태가 됩니다.
            return userCredential.user;
        } catch (error) {
            console.error("회원가입 오류:", error.message);
            // 사용자 정의 오류 메시지 반환 (예: 이메일 중복, 비밀번호 약함)
            throw new Error(error.message);
        }
    },

    // 비동기: 로그인 (Firebase signInWithEmailAndPassword 사용)
    login: async (email, password) => {
        if (!isFirebaseInitialized) throw new Error("Firebase is not initialized.");
        try {
            // Firebase Authentication을 통해 로그인
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("로그인 성공:", userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error("로그인 오류:", error.message);
            // 사용자 정의 오류 메시지 반환 (예: 잘못된 이메일/비밀번호)
            throw new Error(error.message);
        }
    },

    // 비동기: 로그아웃 (Firebase signOut 사용)
    logout: async () => {
        if (!isFirebaseInitialized) return;
        try {
            await signOut(auth);
            console.log("로그아웃 성공.");
            // 상태 업데이트는 onAuthStateChanged 리스너가 처리합니다.
        } catch (error) {
            console.error("로그아웃 오류:", error.message);
            throw new Error(error.message);
        }
    },
    
    // 상태 업데이트 헬퍼 함수
    setAuthState: (user) => {
        set({ 
            user: user, 
            isAuthenticated: !!user,
            authLoading: false
        });
    }
}));


// ------------------------------------
// [Firebase 인증 상태 리스너]
// ------------------------------------

// 앱이 시작될 때마다 Firebase 인증 상태 변화를 감지합니다.
if (isFirebaseInitialized) {
    onAuthStateChanged(auth, (user) => {
        const { setAuthState } = useAuthStore.getState();
        // Firebase에서 사용자 정보를 받으면, Zustand 상태를 업데이트합니다.
        setAuthState(user);
    });
}

// 외부에서 db 인스턴스를 사용하기 위해 내보냅니다.
export { db, auth, isFirebaseInitialized };