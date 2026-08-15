// 거래 입력 날짜와 시간을 DB 저장용 Date 객체로 변환
export const createTransactionDate = (date, time) => {
  const now = new Date();

  const [hour, minute] = time
    ? time.split(":").map(Number)
    : [now.getHours(), now.getMinutes()];

  return new Date(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    hour,
    minute,
    time ? 0 : now.getSeconds(),
  );
};