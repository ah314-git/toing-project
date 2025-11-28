/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 * Firestore 문서 키 및 Zustand 상태의 키로 사용됩니다.
 * @param {Date} date - 변환할 Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const toDay = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};