import Image from "next/image";
import styles from "../MyPage.module.scss";

export default function GrowthSection() {
  const growthRate = 0;
  const previousRate = null;

  return (
    <section className={styles.growth}>
      <div className={styles.growthContent}>
        <div className={styles.growthHeading}>
          <h2 className="body-l-plus">이번 달 나의 성장</h2>

          <p className="body-l-plus">
            {previousRate === null
              ? "저번 달의 기록이 아직 없어요!"
              : "지난달과 동일한 저축 실천율을 유지했어요!"}
          </p>
        </div>

        <div className={styles.progressContent}>
          <strong className="heading-s-plus">{growthRate}%</strong>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${growthRate}%` }}
            />
          </div>
        </div>
      </div>

      <Image
        src="/images/mypage/08-character-happy.png"
        alt=""
        width={140}
        height={140}
      />
    </section>
  );
}
