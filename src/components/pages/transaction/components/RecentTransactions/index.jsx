import styles from "./RecentTransactions.module.scss";

function formatRecentAmount(amount) {
  const sign = amount > 0 ? "+" : "-";

  return `${sign}${Math.abs(amount).toLocaleString("ko-KR")}`;
}

export default function RecentTransactions({
  transactions,
  copiedId,
  onClose,
  onCopy,
  onViewAll,
}) {
  return (
    <section className={styles.recentPanel} aria-label="최근 입력 내용">
      <div className={styles.recentHeader}>
        <button
          type="button"
          className={styles.recentHeaderButton}
          onClick={onClose}
          aria-label="최근 입력 내용 닫기"
        >
          <span className="material-icons" aria-hidden="true">
            close
          </span>
        </button>

        <h2 className={styles.recentTitle}>최근 입력 내용</h2>

        <span
          className={`material-icons ${styles.recentHistoryIcon}`}
          aria-hidden="true"
        >
          history
        </span>
      </div>

      <p className={styles.recentDescription}>
        최근 입력한 거래 내역을 복사하여 빠르게 입력할수 있어요.
      </p>

      <ul className={styles.recentList}>
        {transactions.map(transaction => {
          const isCopied = copiedId === transaction.id;

          return (
            <li
              className={`${styles.recentCard} ${
                isCopied ? styles.copiedRecentCard : ""
              }`}
              key={transaction.id}
            >
              <div className={styles.recentCardContent}>
                <strong className={styles.recentCardTitle}>
                  {transaction.content}
                </strong>

                <div className={styles.recentInfoRow}>
                  <strong
                    className={`${styles.recentType} ${
                      styles[transaction.type]
                    }`}
                  >
                    {transaction.typeLabel}
                  </strong>

                  <strong
                    className={`${styles.recentCategory} ${
                      styles[transaction.categoryType]
                    }`}
                  >
                    {transaction.category}
                  </strong>

                  <span className={styles.recentAmount}>
                    {formatRecentAmount(transaction.amount)}
                  </span>
                </div>

                <div className={styles.recentSubInfo}>
                  <strong>{transaction.paymentMethod}</strong>

                  <span>
                    {transaction.date}
                    {transaction.time ? ` ${transaction.time}` : ""}
                  </span>
                </div>
              </div>

              {isCopied ? (
                <div className={styles.copiedButton} aria-label="복사 완료">
                  <span>복사됨</span>

                  <span className="material-icons" aria-hidden="true">
                    check_circle
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => onCopy(transaction)}
                >
                  복사
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={styles.viewAllRecentButton}
        onClick={onViewAll}
      >
        <span>전체 보기</span>

        <span className="material-icons" aria-hidden="true">
          arrow_forward
        </span>
      </button>
    </section>
  );
}
