import styles from "./SummaryCards.module.scss";

const summaryCards = [
  {
    id: "income",
    title: "총 수입",
    value: "2,450,000원",
    emptyValue: "--원",
    change: "+450,000원",
    direction: "up",
    emptyText: "아직 수입 기록이 없어요.",
  },
  {
    id: "expense",
    title: "총 지출",
    value: "1,286,500원",
    emptyValue: "--원",
    change: "-120,500원",
    direction: "down",
    emptyText: "아직 지출 기록이 없어요.",
  },
  {
    id: "transaction",
    title: "이번 달 거래",
    value: "25건",
    emptyValue: "--건",
    details: [
      { label: "지출", count: "18건", type: "expense" },
      { label: "수입", count: "7건", type: "income" },
      { label: "이체", count: "1건", type: "transfer" },
    ],
    emptyText: "거래 기록을 기다리고 있어요.",
  },
  {
    id: "balance",
    title: "잔액",
    value: "3,213,500원",
    emptyValue: "--원",
    change: "+218,000원",
    direction: "up",
    emptyText: "거래를 기록하면 확인할 수 있어요.",
  },
];

export default function SummaryCards({ hasTransactionData }) {
  return (
    <section className={styles.summarySection} aria-label="이번 달 소비 요약">
      {summaryCards.map(card => (
        <article className={styles.summaryCard} key={card.id}>
          <p className={styles.summaryTitle}>{card.title}</p>

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
              <span className={styles.summaryPeriod}>이번 달</span>

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
