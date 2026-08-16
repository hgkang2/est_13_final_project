import styles from "./TransactionToolbar.module.scss";

const transactionFilters = [
  { id: "all", label: "전체" },
  { id: "income", label: "수입" },
  { id: "expense", label: "지출" },
  { id: "transfer", label: "이체" },
];

export default function TransactionToolbar({
  activeFilter,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  isCurrentMonthRange,
  onMoveToCurrentMonth,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.typeFilters}>
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

      <div className={styles.mobileToolbarRow}>
        <div className={styles.dateButton}>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={onDateRangeChange}
            aria-label="조회 시작일"
          />

          <span>-</span>

          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={onDateRangeChange}
            aria-label="조회 종료일"
          />

          {isCurrentMonthRange ? (
            <span className="material-icons" aria-hidden="true">
              calendar_month
            </span>
          ) : (
            <button
              type="button"
              className={styles.currentMonthButton}
              onClick={onMoveToCurrentMonth}
              aria-label="이번 달 보기"
              title="이번 달 보기"
            >
              <span className="material-icons" aria-hidden="true">
                restart_alt
              </span>
            </button>
          )}
        </div>

        <div className={styles.toolbarActions}>
          <button type="button" className={styles.toolbarButton}>
            <span>필터</span>

            <span className="material-icons" aria-hidden="true">
              filter_alt
            </span>
          </button>

          <button
            type="button"
            className={`${styles.toolbarButton} ${styles.exportButton}`}
          >
            <span className="material-icons" aria-hidden="true">
              file_download
            </span>

            <span>내보내기</span>
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
    </div>
  );
}
