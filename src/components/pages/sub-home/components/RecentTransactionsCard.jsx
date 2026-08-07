import styles from "../SubHome.module.scss";
import TransactionItem from "./TransactionItem";
import MoreButton from "./MoreButton";

export default function RecentTransactionsCard({ hasSpendingData }) {
  return (
    <article className={styles.recentCard} aria-labelledby="recent-card-title">
      <header className={styles.recentHeader}>
        <h2 id="recent-card-title">최근 소비 내역</h2>

        <MoreButton>{hasSpendingData ? "더보기" : "소비 기록하기"}</MoreButton>
      </header>

      <ul
        className={`${styles.transactionList} ${
          !hasSpendingData ? styles.previewTransactionList : ""
        }`}
        aria-hidden={!hasSpendingData}
      >
        <TransactionItem
          imageSrc="/images/category/cafe-snack.png"
          title="스타벅스"
          category="카페/간식"
          categoryType="cafe"
          amount="-4,500원"
          date="오늘 09:24"
        />

        <TransactionItem
          imageSrc="/images/category/salary.png"
          title="급여"
          category="급여"
          categoryType="salary"
          amount="+2,850,000원"
          date="7/25 09:00"
          isIncome
        />

        <TransactionItem
          imageSrc="/images/category/food.png"
          title="배달의 민족"
          category="식비"
          categoryType="food"
          amount="-23,000원"
          date="7/24 22:05"
        />

        {hasSpendingData && (
          <TransactionItem
            imageSrc="/images/category/savings.png"
            title="적금 계좌로 이체"
            category="저축"
            categoryType="savings"
            amount="-200,000원"
            date="7/24 14:00"
          />
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
