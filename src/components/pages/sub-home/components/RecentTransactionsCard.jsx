import styles from "../SubHome.module.scss";
import TransactionItem from "./TransactionItem";
import MoreButton from "./MoreButton";

const categoryImageMap = {
  allowance: "/images/category/allowance.png",
  bonus: "/images/category/bonus.png",
  cafe_snack: "/images/category/cafe_snack.png",
  education: "/images/category/education.png",
  food: "/images/category/food.png",
  hobby: "/images/category/hobby.png",
  household_goods: "/images/category/household_goods.png",
  investment_income: "/images/category/investment_income.png",
  medical: "/images/category/medical.png",
  other_income: "/images/category/other_income.png",
  salary: "/images/category/salary.png",
  saving_transfer: "/images/category/savings.png",
  shopping: "/images/category/shopping.png",
  subscription: "/images/category/subscription.png",
  transportation: "/images/category/transportation.png",
};

const getCategoryImage = categoryCode => {
  return categoryImageMap[categoryCode] ?? "/images/category/income_other.png";
};

export default function RecentTransactionsCard({
  hasSpendingData,
  recentTransactions,
  onMoreClick,
}) {
  const formatTransactionDate = transactionAt => {
    const date = new Date(transactionAt);

    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${month}/${day} ${hour}:${minute}`;
  };

  return (
    <article className={styles.recentCard} aria-labelledby="recent-card-title">
      <header className={styles.recentHeader}>
        <h2 id="recent-card-title">최근 소비 내역</h2>

        <MoreButton href="/transaction">
          {hasSpendingData ? "더보기" : "소비 기록하기"}
        </MoreButton>
      </header>

      <ul
        className={`${styles.transactionList} ${
          !hasSpendingData ? styles.previewTransactionList : ""
        }`}
        aria-hidden={!hasSpendingData}
      >
        {hasSpendingData ? (
          recentTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              imageSrc={getCategoryImage(transaction.category?.code)}
              title={transaction.content ?? "내용 없음"}
              category={transaction.category?.name ?? "기타"}
              categoryType={transaction.category?.code}
              amount={`${transaction.transaction_type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("ko-KR")}원`}
              date={formatTransactionDate(transaction.transaction_at)}
              isIncome={transaction.transaction_type === "income"}
            />
          ))
        ) : (
          <>
            <TransactionItem
              imageSrc="/images/category/cafe_snack.png"
              title="스타벅스"
              category="카페/간식"
              categoryType="cafe_snack"
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
          </>
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
