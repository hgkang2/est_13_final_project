import styles from "../MyPage.module.scss";

export default function GrowthSection() {
  return (
    <section className={styles.MyPage_Growth}>
      <div className={styles.Growth_Info}>
        <div className={styles.Title_Group}>
          <h2>이번 달 나의 성장</h2>

          <p>
            지난달보다 <strong>12%p</strong> 더 성장했어요.
          </p>
        </div>

        <div className={styles.Progress_Group}>
          <strong className={styles.Progress_Value}>65%</strong>

          <div className={styles.Progress_Bar}>
            <div className={styles.Progress_Fill} style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      <img
        src="/images/mypage/06-character-cheering.png"
        alt="응원하는 모아 캐릭터"
        className={styles.Growth_Image}
      />
    </section>
  );
}
