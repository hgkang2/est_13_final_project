import { useEffect, useRef, useState } from "react";
import styles from "./TransactionList.module.scss";
import TransactionEmpty from "../TransactionEmpty";

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "-";

  return `${sign}${Math.abs(amount).toLocaleString("ko-KR")}`;
}

export default function TransactionList({
  isLoading,
  isLoadingMore = false,
  hasTransactionData,
  visibleTransactions,
  hasActiveFilters,
  selectedIds,
  onToggleAll,
  onToggleTransaction,
  onClearSelection,
  onDeleteSelected,
  onOpenDetail,
  activeTransactionId,
  recentlyAddedId,
  scrollTargetId,
  onLoadMore,
  hasMoreTransactions,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastScrolledIdRef = useRef(null);
  const tableRef = useRef(null);
  const clearSelectionRef = useRef(onClearSelection);

  useEffect(() => {
    clearSelectionRef.current = onClearSelection;
  }, [onClearSelection]);

  // 거래 목록이 모바일 레이아웃으로 전환되면 기존 선택 초기화
  useEffect(() => {
    const tableElement = tableRef.current;

    if (!tableElement) return;

    let wasMobile = tableElement.clientWidth <= 700;
    // 이미 모바일 너비에서 시작한 경우에도 기존 선택 제거
    if (wasMobile) {
      clearSelectionRef.current();
    }

    const resizeObserver = new ResizeObserver(entries => {
      const currentWidth =
        entries[0]?.contentRect.width ?? tableElement.clientWidth;

      const isMobile = currentWidth <= 700;

      if (!wasMobile && isMobile) {
        clearSelectionRef.current();
      }

      wasMobile = isMobile;
    });

    resizeObserver.observe(tableElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const INITIAL_VISIBLE_COUNT = 8;

  const displayedTransactions = isExpanded
    ? visibleTransactions
    : visibleTransactions.slice(0, INITIAL_VISIBLE_COUNT);

  const displayedIds = displayedTransactions.map(transaction => transaction.id);

  const isDisplayedAllSelected =
    displayedTransactions.length > 0 &&
    displayedIds.every(id => selectedIds.includes(id));

  const selectedTransactions = displayedTransactions.filter(transaction =>
    selectedIds.includes(transaction.id),
  );

  const selectedSummary = selectedTransactions.reduce(
    (summary, transaction) => {
      summary[transaction.type] += transaction.amount;

      return summary;
    },
    {
      income: 0,
      expense: 0,
      transfer: 0,
    },
  );

  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    if (hasMoreTransactions) {
      setIsExpanded(true);
      await onLoadMore();
      return;
    }

    if (isExpanded) {
      onClearSelection();
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
  };

  useEffect(() => {
    if (!scrollTargetId) {
      lastScrolledIdRef.current = null;
      return;
    }

    if (lastScrolledIdRef.current === scrollTargetId) return;

    const targetIndex = visibleTransactions.findIndex(
      transaction => transaction.id === scrollTargetId,
    );

    if (targetIndex === -1) return;

    // 접힌 8개보다 아래에 있으면 먼저 목록 펼치기
    if (targetIndex >= INITIAL_VISIBLE_COUNT && !isExpanded) {
      setIsExpanded(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const targetRow = document.querySelector(
        `[data-transaction-id="${scrollTargetId}"]`,
      );

      if (!targetRow) return;

      targetRow.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      lastScrolledIdRef.current = scrollTargetId;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [scrollTargetId, visibleTransactions, isExpanded]);

  const handleToggleMemo = transactionId => {
    setExpandedId(prevId => (prevId === transactionId ? null : transactionId));
  };

  return (
    <div ref={tableRef} className={styles.table}>
      {isLoading ? (
        <div
          className={styles.transactionSkeleton}
          aria-label="소비 기록을 불러오는 중"
          aria-busy="true"
        >
          <div className={styles.skeletonHeader} />

          {Array.from({ length: 8 }, (_, index) => (
            <div className={styles.skeletonRow} key={index}>
              <span className={styles.skeletonCheckbox} />
              <span className={styles.skeletonDate} />
              <span className={styles.skeletonType} />
              <span className={styles.skeletonContent} />
              <span className={styles.skeletonAmount} />
              <span className={styles.skeletonPayment} />
              <span className={styles.skeletonMemo} />
              <span className={styles.skeletonAction} />
            </div>
          ))}
        </div>
      ) : hasTransactionData ? (
        <>
          <div className={styles.tableHeader}>
            <button
              type="button"
              className={styles.checkboxCell}
              onClick={() => onToggleAll(displayedIds)}
              aria-label={
                isDisplayedAllSelected
                  ? "현재 거래 전체 선택 해제"
                  : "현재 거래 전체 선택"
              }
            >
              <span className="material-icons" aria-hidden="true">
                {isDisplayedAllSelected
                  ? "check_box"
                  : "check_box_outline_blank"}
              </span>
            </button>

            <div className={styles.dateCell}>날짜</div>
            <div className={styles.typeCell}>구분</div>
            <div className={styles.categoryCell}>카테고리</div>
            <div className={styles.contentCell}>내용</div>
            <div className={styles.amountCell}>금액</div>
            <div className={styles.paymentCell}>결제수단</div>
            <div className={styles.memoCell}>메모</div>

            <div className={styles.actionCell}>
              <span className="material-icons" aria-hidden="true">
                more_vert
              </span>
            </div>
          </div>

          {selectedTransactions.length > 0 && (
            <div className={styles.selectionBar}>
              <div className={styles.selectionBarInner}>
                <div className={styles.selectionInfo}>
                  <button
                    type="button"
                    className={`${styles.checkboxCell} ${styles.selectionCheckbox}`}
                    onClick={onClearSelection}
                    aria-label="선택 거래 전체 해제"
                  >
                    <span className="material-icons" aria-hidden="true">
                      check_box
                    </span>
                  </button>

                  <span>{selectedTransactions.length}건이 선택되었습니다.</span>
                </div>

                <div className={styles.selectionRight}>
                  <div className={styles.selectionSummary}>
                    <div className={styles.incomeSummary}>
                      <span>수입</span>
                      <strong>{formatAmount(selectedSummary.income)}원</strong>
                    </div>

                    <div className={styles.expenseSummary}>
                      <span>지출</span>
                      <strong>{formatAmount(selectedSummary.expense)}원</strong>
                    </div>

                    <div className={styles.transferSummary}>
                      <span>이체</span>
                      <strong>
                        {formatAmount(selectedSummary.transfer)}원
                      </strong>
                    </div>
                  </div>

                  <div className={styles.selectionActions}>
                    <button
                      type="button"
                      aria-label="선택 거래 삭제"
                      onClick={() =>
                        onDeleteSelected(
                          selectedTransactions.map(
                            transaction => transaction.id,
                          ),
                        )
                      }
                    >
                      <span
                        className="material-icons-outlined"
                        aria-hidden="true"
                      >
                        delete
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-label="선택 해제"
                      onClick={() => onClearSelection()}
                    >
                      <span className="material-icons" aria-hidden="true">
                        close
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ul
            className={`${styles.transactionList} ${
              isExpanded ? styles.expandedList : ""
            }`}
          >
            {displayedTransactions.map(transaction => {
              const isSelected = selectedIds.includes(transaction.id);
              const hasMemo = Boolean(
                transaction.memo?.trim() && transaction.memo.trim() !== "-",
              );
              return (
                <li
                  className={`${styles.transactionRow} ${
                    isSelected ? styles.selectedRow : ""
                  } ${
                    transaction.id === activeTransactionId
                      ? styles.activeRow
                      : ""
                  } ${
                    transaction.id === recentlyAddedId
                      ? styles.recentlyAdded
                      : ""
                  }`}
                  key={transaction.id}
                  data-transaction-id={transaction.id}
                  onClick={() => onOpenDetail(transaction)}
                >
                  <button
                    type="button"
                    className={styles.checkboxCell}
                    onClick={event => {
                      event.stopPropagation();
                      onToggleTransaction(transaction.id);
                    }}
                    aria-label={`${transaction.content} 거래 ${
                      isSelected ? "선택 해제" : "선택"
                    }`}
                  >
                    <span className="material-icons" aria-hidden="true">
                      {isSelected ? "check_box" : "check_box_outline_blank"}
                    </span>
                  </button>

                  <time
                    className={styles.dateCell}
                    dateTime={`${transaction.dateValue}T${transaction.time}`}
                  >
                    <span className={styles.transactionDate}>
                      {transaction.date}
                    </span>

                    <span className={styles.transactionTime}>
                      {transaction.time}
                    </span>
                  </time>

                  <strong
                    className={`${styles.typeCell} ${styles[transaction.type]}`}
                  >
                    {transaction.typeLabel}
                  </strong>

                  <div className={styles.contentGroup}>
                    <strong
                      className={`${styles.categoryCell} ${
                        styles[transaction.categoryType]
                      }`}
                    >
                      {transaction.category}
                    </strong>

                    <span className={styles.contentCell}>
                      {transaction.content}
                    </span>
                  </div>

                  <div className={styles.amountGroup}>
                    <strong
                      className={`${styles.amountCell} ${
                        styles[transaction.type]
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </strong>

                    <span className={styles.paymentCell}>
                      {transaction.paymentMethod}
                    </span>
                  </div>

                  <span className={styles.memoCell}>{transaction.memo}</span>

                  <button
                    type="button"
                    className={styles.actionCell}
                    aria-label={`${transaction.content} 거래 메뉴`}
                    onClick={event => {
                      event.stopPropagation();
                    }}
                  >
                    <span
                      className={`material-icons ${styles.desktopActionIcon}`}
                      aria-hidden="true"
                    >
                      more_vert
                    </span>

                    <span
                      className={`material-icons ${styles.mobileActionIcon}`}
                      aria-hidden="true"
                      onClick={event => {
                        event.stopPropagation();

                        if (hasMemo) {
                          handleToggleMemo(transaction.id);
                          return;
                        }

                        onOpenDetail(transaction);
                      }}
                    >
                      {hasMemo
                        ? expandedId === transaction.id
                          ? "keyboard_control_key"
                          : "keyboard_arrow_down"
                        : "chevron_right"}
                    </span>
                  </button>

                  {hasMemo && expandedId === transaction.id && (
                    <div className={styles.mobileMemo}>
                      <strong>메모</strong>
                      <span>{transaction.memo}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {(visibleTransactions.length > INITIAL_VISIBLE_COUNT ||
            hasMoreTransactions) && (
            <div className={styles.loadMoreArea}>
              <button
                type="button"
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                <span>
                  {isExpanded && !hasMoreTransactions
                    ? "접기"
                    : "더 많은 내역 보기"}
                </span>

                <span className="material-icons" aria-hidden="true">
                  {isExpanded && !hasMoreTransactions
                    ? "keyboard_arrow_up"
                    : "keyboard_arrow_down"}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <TransactionEmpty type={hasActiveFilters ? "filter" : "empty"} />
      )}
    </div>
  );
}
