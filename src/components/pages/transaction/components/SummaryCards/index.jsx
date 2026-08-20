import styles from "./SummaryCards.module.scss";

const formatAmount = amount => `${Math.abs(amount).toLocaleString()}원`;

const formatChange = amount => {
  if (amount > 0) {
    return `+${amount.toLocaleString()}원`;
  }

  if (amount < 0) {
    return `${amount.toLocaleString()}원`;
  }

  return "0원";
};

export default function SummaryCards({
  isLoading,
  hasTransactionData,
  summaryData,
}) {
  if (isLoading) {
    return (
      <section
        className={styles.summarySection}
        aria-label="이번 달 소비 요약을 불러오는 중"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className={`${styles.summaryCard} ${styles.summarySkeleton}`}
            key={index}
          >
            <span
              className={`${styles.summarySkeletonBlock} ${styles.summarySkeletonTitle}`}
            />

            <span
              className={`${styles.summarySkeletonBlock} ${styles.summarySkeletonValue}`}
            />

            <span
              className={`${styles.summarySkeletonBlock} ${styles.summarySkeletonMeta}`}
            />
          </div>
        ))}
      </section>
    );
  }
  const summaryCards = [
    {
      id: "income",
      title: "총 수입",
      value: formatAmount(summaryData.income),
      emptyValue: "--원",
      change: formatChange(summaryData.incomeChange),
      direction: summaryData.incomeChange < 0 ? "down" : "up",
      emptyText: "아직 수입 기록이 없어요.",
    },
    {
      id: "expense",
      title: "총 지출",
      value: formatAmount(summaryData.expense),
      emptyValue: "--원",
      change: formatChange(summaryData.expenseChange),
      direction: summaryData.expenseChange < 0 ? "down" : "up",
      emptyText: "아직 지출 기록이 없어요.",
    },
    {
      id: "transaction",
      title: "이번 달 거래",
      value: `${summaryData.transactionCount}건`,
      emptyValue: "--건",
      details: [
        {
          label: "지출",
          count: `${summaryData.expenseCount}건`,
          type: "expense",
        },
        {
          label: "수입",
          count: `${summaryData.incomeCount}건`,
          type: "income",
        },
        {
          label: "이체",
          count: `${summaryData.transferCount}건`,
          type: "transfer",
        },
      ],
      emptyText: "거래 기록을 기다리고 있어요.",
    },
    {
      id: "balance",
      title: "잔액",
      value: `${summaryData.balance.toLocaleString()}원`,
      emptyValue: "--원",
      change: formatChange(summaryData.balanceChange),
      direction: summaryData.balanceChange < 0 ? "down" : "up",
      emptyText: "거래를 기록하면 확인할 수 있어요.",
    },
  ];

  return (
    <section className={styles.summarySection} aria-label="이번 달 소비 요약">
      {summaryCards.map(card => (
        <article className={styles.summaryCard} key={card.id}>
          <h2 className={styles.summaryTitle}>{card.title}</h2>

          <strong className={styles.summaryValue}>
            {hasTransactionData ? card.value : card.emptyValue}
          </strong>

          {!hasTransactionData ? (
            <p className={styles.summaryEmptyText}>{card.emptyText}</p>
          ) : card.details ? (
            <div className={styles.transactionCounts}>
              {card.details.map(detail => (
                <span
                  className={`${styles.transactionCount} ${
                    styles[detail.type]
                  }`}
                  key={detail.type}
                >
                  <strong>{detail.label}</strong>
                  <span>{detail.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.summaryChange}>
              <span className={styles.summaryPeriod}>지난달 대비</span>

              <strong>{card.change}</strong>

              <span
                className={`material-icons ${
                  card.direction === "down" ? styles.downIcon : styles.upIcon
                }`}
                aria-hidden="true"
              >
                {card.direction === "down" ? "arrow_downward" : "arrow_upward"}
              </span>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
