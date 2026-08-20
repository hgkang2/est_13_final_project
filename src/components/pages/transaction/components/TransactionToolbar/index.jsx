import { useEffect, useRef, useState } from "react";
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
  categories,
  paymentMethods,
  detailFilters,
  onDetailFilterApply,
}) {
  const [isDetailFilterOpen, setIsDetailFilterOpen] = useState(false);
  const [detailFilterDraft, setDetailFilterDraft] = useState(detailFilters);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  const handleOpenDatePicker = inputRef => {
    inputRef.current?.showPicker();
  };

  useEffect(() => {
    setDetailFilterDraft(detailFilters);
  }, [detailFilters]);

  const handleDetailFilterChange = event => {
    const { name, value, checked, type } = event.target;

    setDetailFilterDraft(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleResetDetailFilter = () => {
    setDetailFilterDraft({
      category: "",
      paymentMethod: "",
      hasReceipt: false,
      keyword: "",
    });
  };

  const handleToggleDetailFilter = () => {
    if (!isDetailFilterOpen) {
      setDetailFilterDraft(detailFilters);
    }

    setIsDetailFilterOpen(prev => !prev);
  };

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
          <div className={styles.dateField}>
            <button
              type="button"
              className={styles.datePickerButton}
              onClick={() => handleOpenDatePicker(startDateInputRef)}
              aria-label="조회 시작일 선택"
            >
              {dateRange.startDate.replaceAll("-", ".")}
            </button>

            <input
              ref={startDateInputRef}
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={onDateRangeChange}
              className={styles.nativeDateInput}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <span>-</span>

          <div className={styles.dateField}>
            <button
              type="button"
              className={styles.datePickerButton}
              onClick={() => handleOpenDatePicker(endDateInputRef)}
              aria-label="조회 종료일 선택"
            >
              {dateRange.endDate.replaceAll("-", ".")}
            </button>

            <input
              ref={endDateInputRef}
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={onDateRangeChange}
              className={styles.nativeDateInput}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

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
          <div className={styles.filterAction}>
            <button
              type="button"
              className={`${styles.toolbarButton} ${
                isDetailFilterOpen ? styles.filterButtonOpen : ""
              }`}
              onClick={handleToggleDetailFilter}
              aria-expanded={isDetailFilterOpen}
              aria-controls="transaction-detail-filter"
            >
              <span>필터</span>

              <span className="material-icons" aria-hidden="true">
                filter_alt
              </span>
            </button>

            {isDetailFilterOpen && (
              <div
                id="transaction-detail-filter"
                className={styles.detailFilterPanel}
              >
                <div className={styles.detailFilterHeader}>
                  <strong>상세 필터</strong>

                  <button
                    type="button"
                    className={styles.detailFilterClose}
                    onClick={() => {
                      setDetailFilterDraft(detailFilters);
                      setIsDetailFilterOpen(false);
                    }}
                    aria-label="상세 필터 닫기"
                  >
                    <span className="material-icons" aria-hidden="true">
                      close
                    </span>
                  </button>
                </div>

                <div className={styles.detailFilterFields}>
                  <label className={styles.detailFilterField}>
                    <span>카테고리</span>

                    <select
                      name="category"
                      value={detailFilterDraft.category}
                      onChange={handleDetailFilterChange}
                    >
                      <option value="">전체 카테고리</option>

                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.detailFilterField}>
                    <span>결제수단</span>

                    <select
                      name="paymentMethod"
                      value={detailFilterDraft.paymentMethod}
                      onChange={handleDetailFilterChange}
                    >
                      <option value="">전체 결제수단</option>

                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.receiptOnlyOption}>
                    <input
                      type="checkbox"
                      name="hasReceipt"
                      checked={detailFilterDraft.hasReceipt}
                      onChange={handleDetailFilterChange}
                    />

                    <span>영수증 있는 거래만 보기</span>
                  </label>

                  <label className={styles.detailFilterField}>
                    <span>검색</span>

                    <div className={styles.detailSearchBox}>
                      <input
                        type="search"
                        name="keyword"
                        value={detailFilterDraft.keyword}
                        onChange={handleDetailFilterChange}
                        placeholder="내용 또는 메모 검색"
                      />

                      <span className="material-icons" aria-hidden="true">
                        search
                      </span>
                    </div>
                  </label>
                </div>

                <div className={styles.detailFilterActions}>
                  <button
                    type="button"
                    className={styles.detailFilterReset}
                    onClick={handleResetDetailFilter}
                  >
                    초기화
                  </button>

                  <button
                    type="button"
                    className={styles.detailFilterApply}
                    onClick={() => {
                      onDetailFilterApply(detailFilterDraft);
                      setIsDetailFilterOpen(false);
                    }}
                  >
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.preparingButton}>
            <button
              type="button"
              className={`${styles.toolbarButton} ${styles.exportButton}`}
              aria-describedby="export-preparing-tooltip"
            >
              <span className="material-icons" aria-hidden="true">
                file_download
              </span>
              <span>내보내기</span>
            </button>

            <span
              id="export-preparing-tooltip"
              className={styles.preparingTooltip}
              role="tooltip"
            >
              서비스 준비 중이에요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
