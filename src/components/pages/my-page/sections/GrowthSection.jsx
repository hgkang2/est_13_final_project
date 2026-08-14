import Image from "next/image";
import styles from "../MyPage.module.scss";

export default function GrowthSection({ currentAmount, previousAmount }) {
  const growthRate = previousAmount
    ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
    : 0;
  const message = !previousAmount
    ? "저번 달의 기록이 아직 없어요!"
    : growthRate > 0
      ? `지난달보다 저축 금액이 ${growthRate}% 늘었어요!`
      : growthRate < 0
        ? `지난달보다 저축 금액이 ${Math.abs(growthRate)}% 줄었어요!`
        : "지난달과 동일한 저축 금액을 유지했어요!";

  return (
    <section className={styles.growth}>
      <div className={styles.growthContent}>
        <div className={styles.growthHeading}>
          <h2 className="body-l-plus">이번 달 나의 성장</h2>

          <p className="body-l-plus">
            {message}
          </p>
        </div>

        <div className={styles.progressContent}>
          <strong className="heading-s-plus">{Math.abs(growthRate)}%</strong>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(Math.max(growthRate, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      <Image
        src="/images/mypage/08-character-happy-02.png"
        alt=""
        width={140}
        height={140}
        loading="eager"
      />
    </section>
  );
}
