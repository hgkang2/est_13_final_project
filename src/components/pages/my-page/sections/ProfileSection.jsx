import styles from "../MyPage.module.scss";

const summaryItems = [
  {
    label: "진행 중인 목표",
    value: "8",
  },
  {
    label: "이번 달 저축 금액",
    value: "123,456",
  },
  {
    label: "완료한 챌린지",
    value: "10",
  },
];

export default function ProfileSection() {
  return (
    <section className={styles.MyPage_Profile}>
      <div className={styles.MyPage_Intro}>
        <div className={styles.Avatar} />

        <div className={styles.Greeting}>
          <h1>모아님, 오늘도 반가워요!</h1>
          <p>작은 실천을 이어온 지 110일째예요.</p>
        </div>
      </div>

      <div className={styles.MyPage_Summary}>
        {summaryItems.map((item) => (
          <div key={item.label} className={styles.MyPage_summaryItem}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
