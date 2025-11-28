import mongoose from 'mongoose';

// ------------------------------------
// Mongoose 사용자 스키마 정의
// ------------------------------------
const userSchema = new mongoose.Schema({
// 사용자 이름 필드 (로그인 시 ID로 사용)
username: {
type: String,       // 데이터 타입은 문자열
required: true,     // 필수 입력 항목
unique: true,       // 데이터베이스 내에서 중복 불가능
trim: true,         // 앞뒤 공백 제거
minlength: 3        // 최소 길이 3자
},
// 비밀번호 필드 (실제로는 해시되어 저장)
password: {
type: String,       // 데이터 타입은 문자열
required: true,     // 필수 입력 항목
minlength: 6        // 최소 길이 6자
},
// 계정 생성 시간을 기록하는 필드
createdAt: {
type: Date,         // 데이터 타입은 날짜
default: Date.now   // 기본값은 현재 시각
}
});

// 스키마를 기반으로 'User'라는 이름의 Mongoose 모델 생성
const User = mongoose.model('User', userSchema);

// 생성된 User 모델을 외부에 노출
export default User;