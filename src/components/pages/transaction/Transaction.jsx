"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Transaction.module.scss";

const summaryCards = [
  {
    id: "income",
    title: "총 수입",
    value: "2,450,000원",
    change: "+450,000원",
    direction: "up",
  },
  {
    id: "expense",
    title: "총 지출",
    value: "1,286,500원",
    change: "-120,500원",
    direction: "down",
  },
  {
    id: "transaction",
    title: "이번 달 거래",
    value: "25건",
    details: [
      { label: "지출", count: "18건", type: "expense" },
      { label: "수입", count: "7건", type: "income" },
      { label: "이체", count: "1건", type: "transfer" },
    ],
  },
  {
    id: "balance",
    title: "잔액",
    value: "3,213,500원",
    change: "+218,000원",
    direction: "up",
  },
];

const transactions = [
  {
    id: 1,
    date: "2025.07.29 18:42",
    type: "expense",
    typeLabel: "지출",
    category: "카페/간식",
    categoryType: "cafeSnack",
    content: "스타벅스 아메리카노",
    amount: -4500,
    paymentMethod: "신용카드",
    memo: "점심 후 커피",
  },
  {
    id: 2,
    date: "2025.07.29 18:42",
    type: "income",
    typeLabel: "수입",
    category: "월급",
    categoryType: "salary",
    content: "급여",
    amount: 2000000,
    paymentMethod: "계좌이체",
    memo: "7월 급여",
  },
  {
    id: 3,
    date: "2025.07.29 18:42",
    type: "expense",
    typeLabel: "지출",
    category: "식비",
    categoryType: "food",
    content: "배달의 민족",
    amount: -23000,
    paymentMethod: "체크카드",
    memo: "저녁 배달",
  },
  {
    id: 4,
    date: "2025.07.29 18:42",
    type: "transfer",
    typeLabel: "이체",
    category: "저축",
    categoryType: "savings",
    content: "적금 계좌로 이체",
    amount: -200000,
    paymentMethod: "계좌이체",
    memo: "정기 적금",
  },
];

const transactionFilters = [
  { id: "all", label: "전체" },
  { id: "income", label: "수입" },
  { id: "expense", label: "지출" },
  { id: "transfer", label: "이체" },
];

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "-";
  return `${sign}${Math.abs(amount).toLocaleString("ko-KR")}`;
}

export default function Transaction() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isEntryOpen, setIsEntryOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const visibleTransactions =
    activeFilter === "all"
      ? transactions
      : transactions.filter(transaction => transaction.type === activeFilter);

  const isAllSelected =
    visibleTransactions.length > 0 &&
    visibleTransactions.every(transaction =>
      selectedIds.includes(transaction.id),
    );

  const handleToggleTransaction = id => {
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter(selectedId => selectedId !== id)
        : [...prevSelectedIds, id],
    );
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      const visibleIds = visibleTransactions.map(transaction => transaction.id);

      setSelectedIds(prevSelectedIds =>
        prevSelectedIds.filter(id => !visibleIds.includes(id)),
      );

      return;
    }

    setSelectedIds(prevSelectedIds => [
      ...new Set([
        ...prevSelectedIds,
        ...visibleTransactions.map(transaction => transaction.id),
      ]),
    ]);
  };

  return (
    <>
      <div className={styles.page}>
        <Sidebar />

        <main className={styles.main}>
          <div className={styles.workspace}>
            <div className={`${styles.content} container`}>
              <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>소비 기록</h1>

                <p className={styles.pageDescription}>
                  모든 거래 내역을 한눈에 확인하고 관리해보세요.
                </p>
              </header>

              <section
                className={styles.summarySection}
                aria-label="이번 달 소비 요약"
              >
                {summaryCards.map(card => (
                  <article className={styles.summaryCard} key={card.id}>
                    <p className={styles.summaryTitle}>{card.title}</p>

                    <strong className={styles.summaryValue}>
                      {card.value}
                    </strong>

                    {card.details ? (
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
                            card.direction === "down"
                              ? styles.downIcon
                              : styles.upIcon
                          }`}
                          aria-hidden="true"
                        >
                          {card.direction === "down"
                            ? "arrow_downward"
                            : "arrow_upward"}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </section>

              <section className={styles.transactionSection}>
                <div className={styles.toolbar}>
                  <div
                    className={styles.typeFilters}
                    aria-label="거래 구분 필터"
                  >
                    {transactionFilters.map(filter => (
                      <button
                        type="button"
                        className={`${styles.typeFilter} ${
                          activeFilter === filter.id ? styles.activeFilter : ""
                        }`}
                        onClick={() => setActiveFilter(filter.id)}
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

                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <button
                      type="button"
                      className={styles.checkboxCell}
                      onClick={handleToggleAll}
                      aria-label={
                        isAllSelected
                          ? "현재 거래 전체 선택 해제"
                          : "현재 거래 전체 선택"
                      }
                    >
                      <span className="material-icons" aria-hidden="true">
                        {isAllSelected
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

                  {selectedIds.length > 0 && (
                    <div className={styles.selectionBar}>
                      <div className={styles.selectionInfo}>
                        <span className="material-icons" aria-hidden="true">
                          check_box
                        </span>

                        <span>{selectedIds.length}건이 선택되었습니다.</span>
                      </div>

                      <div className={styles.selectionActions}>
                        <button type="button" aria-label="선택 거래 삭제">
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
                          onClick={() => setSelectedIds([])}
                        >
                          <span className="material-icons" aria-hidden="true">
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <ul className={styles.transactionList}>
                    {visibleTransactions.map(transaction => {
                      const isSelected = selectedIds.includes(transaction.id);

                      return (
                        <li
                          className={`${styles.transactionRow} ${
                            isSelected ? styles.selectedRow : ""
                          }`}
                          key={transaction.id}
                        >
                          <button
                            type="button"
                            className={styles.checkboxCell}
                            onClick={() =>
                              handleToggleTransaction(transaction.id)
                            }
                            aria-label={`${transaction.content} 거래 ${
                              isSelected ? "선택 해제" : "선택"
                            }`}
                          >
                            <span className="material-icons" aria-hidden="true">
                              {isSelected
                                ? "check_box"
                                : "check_box_outline_blank"}
                            </span>
                          </button>

                          <time className={styles.dateCell}>
                            {transaction.date}
                          </time>

                          <strong
                            className={`${styles.typeCell} ${
                              styles[transaction.type]
                            }`}
                          >
                            {transaction.typeLabel}
                          </strong>

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

                          <span className={styles.memoCell}>
                            {transaction.memo}
                          </span>

                          <button
                            type="button"
                            className={styles.actionCell}
                            aria-label={`${transaction.content} 거래 메뉴`}
                          >
                            <span className="material-icons" aria-hidden="true">
                              more_vert
                            </span>
                          </button>

                          <div className={styles.mobileMemo}>
                            <strong>메모</strong>
                            <span>{transaction.memo}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            </div>

            {isEntryOpen ? (
              <aside className={styles.entryPanel} aria-label="소비 기록 입력">
                <div className={styles.entryPanelHeader}>
                  <div>
                    <p className={styles.entryEyebrow}>소비 기록 입력</p>
                    <h2 className={styles.entryTitle}>새 거래 추가</h2>
                  </div>

                  <div className={styles.entryHeaderActions}>
                    <button type="button" aria-label="입력 기록 확인">
                      <span className="material-icons" aria-hidden="true">
                        history
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEntryOpen(false)}
                      aria-label="소비 기록 입력창 닫기"
                    >
                      <span className="material-icons" aria-hidden="true">
                        close
                      </span>
                    </button>
                  </div>
                </div>

                <div className={styles.entryPlaceholder}>
                  입력 폼은 다음 단계에서 여기에 추가
                </div>
              </aside>
            ) : (
              <button
                type="button"
                className={styles.openEntryButton}
                onClick={() => setIsEntryOpen(true)}
                aria-label="소비 기록 입력창 열기"
              >
                <span className="material-icons" aria-hidden="true">
                  add
                </span>
              </button>
            )}
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
