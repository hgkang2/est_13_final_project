import styles from "./TransactionToolbar.module.scss";

const transactionFilters = [
  { id: "all", label: "전체" },
  { id: "income", label: "수입" },
  { id: "expense", label: "지출" },
  { id: "transfer", label: "이체" },
];

export default function TransactionToolbar({ activeFilter, onFilterChange }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.typeFilters} aria-label="거래 구분 필터">
        {transactionFilters.map(filter => (
          <button
            type="button"
            className={`${styles.typeFilter} ${
              activeFilter === filter.id ? styles.activeFilter : ""
            }`}
            onClick={() => onFilterChange(filter.id)}
            key={filter.id}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbarActions}>
        <button type="button" className={styles.dateButton}>
          <span>2026.07.01 - 2026.07.31</span>

          <span className="material-icons" aria-hidden="true">
            calendar_month
          </span>
        </button>

        <button type="button" className={styles.toolbarButton}>
          <span>필터</span>

          <span className="material-icons" aria-hidden="true">
            filter_alt
          </span>
        </button>

        <button type="button" className={styles.toolbarButton}>
          <span className="material-icons" aria-hidden="true">
            file_download
          </span>

          <span>내보내기</span>

          <span className="material-icons" aria-hidden="true">
            keyboard_arrow_down
          </span>
        </button>

        <button
          type="button"
          className={styles.moreButton}
          aria-label="거래 목록 추가 메뉴"
        >
          <span className="material-icons" aria-hidden="true">
            more_vert
          </span>
        </button>
      </div>
    </div>
  );
}
