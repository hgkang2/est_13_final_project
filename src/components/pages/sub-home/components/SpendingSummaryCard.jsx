import Image from "next/image";
import styles from "../SubHome.module.scss";

export default function SpendingSummaryCard({ hasSpendingData }) {
  return (
    <article
      className={styles.spendingSummaryCard}
      aria-labelledby="spending-summary-title"
    >
      <div className={styles.spendingSummaryContent}>
        <p
          className={`${styles.summaryBadge} ${
            !hasSpendingData ? styles.emptySummaryBadge : ""
          }`}
        >
          {hasSpendingData
            ? "좋은 흐름이에요!"
            : "첫 소비 기록을 기다리고 있어요."}
        </p>

        <h2 id="spending-summary-title">이번 달 소비 요약</h2>

        <strong className={styles.spendingAmount}>
          {hasSpendingData ? "620,000원" : "--원"}
        </strong>

        <p className={styles.spendingDescription}>
          {hasSpendingData
            ? "예산보다 12% 적게 사용했어요!"
            : "소비를 기록하면 이번 달 소비 추이를 보여드릴게요."}
        </p>
      </div>

      <div
        className={`${styles.spendingChart} ${
          !hasSpendingData ? styles.emptySpendingChart : ""
        }`}
      >
        <Image
          src="/images/common/spending-graph.png"
          alt={
            hasSpendingData
              ? "이번 달 소비 추이 그래프"
              : "소비 기록 전 빈 소비 추이 그래프"
          }
          width={252}
          height={160}
        />
      </div>
    </article>
  );
}
