import mongoose from 'mongoose';

// ------------------------------------
// 하위 스키마 1: Todo 항목 구조 정의
// ------------------------------------
const TodoItemSchema = new mongoose.Schema({
id: { type: String, required: true },       // 투두 항목의 고유 ID
text: { type: String, required: true },     // 투두 내용
done: { type: Boolean, default: false }     // 완료 상태 (기본값: false)
});

// ------------------------------------
// 하위 스키마 2: Message 항목 구조 정의 (저널/AI 메시지)
// ------------------------------------
const MessageItemSchema = new mongoose.Schema({
id: { type: String, required: true },                           // 메시지의 고유 ID
text: { type: String, required: true },                         // 메시지 내용
sender: { type: String, required: true, enum: ['user', 'ai'] }, // 메시지 발신자 ('user' 또는 'ai'만 허용)
timestamp: { type: Date, default: Date.now }                    // 메시지 생성 시각 (기본값: 현재 시각)
});

// ------------------------------------
// 메인 스키마: UserData 구조 정의
// ------------------------------------
const UserDataSchema = new mongoose.Schema({
// 데이터 소유자 참조
userId: {
type: mongoose.Schema.Types.ObjectId,   // MongoDB 사용자 ID 타입 참조
ref: 'User',                            // 'User' 모델을 참조
required: true,                         // 필수 필드
unique: true                            // 사용자당 하나의 UserData 문서만 허용
},

// 날짜별 투두 리스트 맵
todosByDate: {
    type: Map,                      // 키-값 쌍의 맵 형태 (키는 날짜 문자열)
    of: [TodoItemSchema],           // 값은 TodoItem 스키마의 배열
    default: {}                     // 기본값은 빈 객체
},

// 날짜별 메시지/저널 리스트 맵
messagesByDate: {
    type: Map,                      // 키-값 쌍의 맵 형태
    of: [MessageItemSchema],        // 값은 MessageItem 스키마의 배열
    default: {}                     // 기본값은 빈 객체
},


});

// UserData 스키마를 기반으로 Mongoose 모델 생성
const UserData = mongoose.model('UserData', UserDataSchema);

// 생성된 UserData 모델을 외부에 노출
export default UserData;