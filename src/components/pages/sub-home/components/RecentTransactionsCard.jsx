import Image from "next/image";
import styles from "../SubHome.module.scss";

export default function RecentTransactionsCard({ hasSpendingData }) {
  return (
    <article className={styles.recentCard} aria-labelledby="recent-card-title">
      <header className={styles.recentHeader}>
        <h2 id="recent-card-title">최근 소비 내역</h2>

        <button type="button" className={styles.moreButton}>
          <span>{hasSpendingData ? "더보기" : "소비 기록하기"}</span>

          <span className="material-icons" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </header>

      <ul
        className={`${styles.transactionList} ${
          !hasSpendingData ? styles.previewTransactionList : ""
        }`}
        aria-hidden={!hasSpendingData}
      >
        <li className={styles.transactionItem}>
          <Image
            src="/images/category/cafe-snack.png"
            alt=""
            width={40}
            height={40}
            aria-hidden="true"
          />

          <div className={styles.transactionInfo}>
            <strong>스타벅스</strong>
            <span className={styles.cafeCategory}>카페/간식</span>
          </div>

          <div className={styles.transactionAmount}>
            <strong>-4,500원</strong>
            <span>오늘 09:24</span>
          </div>
        </li>

        <li className={styles.transactionItem}>
          <Image
            src="/images/category/salary.png"
            alt=""
            width={40}
            height={40}
            aria-hidden="true"
          />

          <div className={styles.transactionInfo}>
            <strong>급여</strong>
            <span className={styles.salaryCategory}>급여</span>
          </div>

          <div className={styles.transactionAmount}>
            <strong className={styles.incomeAmount}>+2,850,000원</strong>
            <span>7/25 09:00</span>
          </div>
        </li>

        <li className={styles.transactionItem}>
          <Image
            src="/images/category/food.png"
            alt=""
            width={40}
            height={40}
            aria-hidden="true"
          />

          <div className={styles.transactionInfo}>
            <strong>배달의 민족</strong>
            <span className={styles.foodCategory}>식비</span>
          </div>

          <div className={styles.transactionAmount}>
            <strong>-23,000원</strong>
            <span>7/24 22:05</span>
          </div>
        </li>

        {hasSpendingData && (
          <li className={styles.transactionItem}>
            <Image
              src="/images/category/savings.png"
              alt=""
              width={40}
              height={40}
              aria-hidden="true"
            />

            <div className={styles.transactionInfo}>
              <strong>적금 계좌로 이체</strong>
              <span className={styles.savingsCategory}>저축</span>
            </div>

            <div className={styles.transactionAmount}>
              <strong>-200,000원</strong>
              <span>7/24 14:00</span>
            </div>
          </li>
        )}
      </ul>

      {!hasSpendingData && (
        <div className={styles.recentEmptyGuide}>
          <div className={styles.recentEmptyText}>
            <p>첫 소비를 기다리고 있어요!</p>
            <span>기록을 시작하면 최근 소비 내역이 표시됩니다.</span>
          </div>
        </div>
      )}
    </article>
  );
}
