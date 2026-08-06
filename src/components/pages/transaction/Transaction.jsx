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

const initialTransactionForm = {
  type: "income",
  amount: "",
  category: "",
  date: "2026-07-29",
  paymentMethod: "",
  content: "",
  memo: "",
  attachment: null,

  withdrawAccount: "",
  depositAccount: "",
  isRecurring: false,
  recurringDay: "29",
};

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "-";
  return `${sign}${Math.abs(amount).toLocaleString("ko-KR")}`;
}

export default function Transaction() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isEntryOpen, setIsEntryOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [entryTab, setEntryTab] = useState("manual");
  const [entryMode, setEntryMode] = useState("single");

  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm,
  );
  const isTransfer = transactionForm.type === "transfer";

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

  const handleTransactionFormChange = event => {
    const { name, value, files } = event.target;

    setTransactionForm(prevForm => {
      const nextForm = {
        ...prevForm,
        [name]: files ? (files[0] ?? null) : value,
      };

      if (name === "type" && value !== "transfer") {
        return {
          ...nextForm,
          withdrawAccount: "",
          depositAccount: "",
          isRecurring: false,
        };
      }

      if (name === "type" && value === "transfer") {
        return {
          ...nextForm,
          paymentMethod: "",
        };
      }

      return nextForm;
    });
  };

  const handleToggleRecurring = () => {
    setTransactionForm(prevForm => ({
      ...prevForm,
      isRecurring: !prevForm.isRecurring,
    }));
  };

  const handleTransactionSubmit = event => {
    event.preventDefault();

    console.log("소비 기록 입력값", transactionForm);
  };

  const handleContinueEntry = () => {
    setTransactionForm(initialTransactionForm);
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

                  <div className={styles.loadMoreArea}>
                    <button type="button" className={styles.loadMoreButton}>
                      <span>더 많은 내역 보기</span>

                      <span className="material-icons" aria-hidden="true">
                        keyboard_arrow_down
                      </span>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {isEntryOpen ? (
              // <aside className={styles.entryPanel} aria-label="소비 기록 입력">
              //   <div className={styles.entryPanelHeader}>
              //     <div>
              //       <p className={styles.entryEyebrow}>소비 기록 입력</p>
              //       <h2 className={styles.entryTitle}>새 거래 추가</h2>
              //     </div>

              //     <div className={styles.entryHeaderActions}>
              //       <button type="button" aria-label="입력 기록 확인">
              //         <span className="material-icons" aria-hidden="true">
              //           history
              //         </span>
              //       </button>

              //       <button
              //         type="button"
              //         onClick={() => setIsEntryOpen(false)}
              //         aria-label="소비 기록 입력창 닫기"
              //       >
              //         <span className="material-icons" aria-hidden="true">
              //           close
              //         </span>
              //       </button>
              //     </div>
              //   </div>

              //   <div className={styles.entryPlaceholder}>
              //     입력 폼은 다음 단계에서 여기에 추가
              //   </div>
              // </aside>
              <aside className={styles.entryPanel} aria-label="소비 기록 입력">
                <div className={styles.entryPanelHeader}>
                  <button
                    type="button"
                    className={styles.entryHeaderButton}
                    onClick={() => setIsEntryOpen(false)}
                    aria-label="소비 기록 입력창 닫기"
                  >
                    <span className="material-icons" aria-hidden="true">
                      close
                    </span>
                  </button>

                  <h2 className={styles.entryPanelTitle}>소비 기록 입력</h2>

                  <button
                    type="button"
                    className={styles.entryHeaderButton}
                    aria-label="최근 입력 기록 보기"
                  >
                    <span className="material-icons" aria-hidden="true">
                      history
                    </span>
                  </button>
                </div>

                <div className={styles.entryTabs} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={entryTab === "manual"}
                    className={`${styles.entryTab} ${
                      entryTab === "manual" ? styles.activeEntryTab : ""
                    }`}
                    onClick={() => setEntryTab("manual")}
                  >
                    직접입력
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={entryTab === "ai"}
                    className={`${styles.entryTab} ${
                      entryTab === "ai" ? styles.activeEntryTab : ""
                    }`}
                    onClick={() => setEntryTab("ai")}
                  >
                    AI 자동 인식
                  </button>
                </div>

                {entryTab === "manual" ? (
                  <form
                    className={styles.entryForm}
                    onSubmit={handleTransactionSubmit}
                  >
                    <section className={styles.entryModeSection}>
                      <h3 className={styles.formSectionTitle}>
                        입력 방식 선택
                      </h3>

                      <div className={styles.entryModeOptions}>
                        <button
                          type="button"
                          className={`${styles.entryModeButton} ${
                            entryMode === "single" ? styles.activeEntryMode : ""
                          }`}
                          onClick={() => setEntryMode("single")}
                        >
                          <strong>단건 입력</strong>
                          <span>거래를 하나씩 입력</span>
                        </button>

                        <button
                          type="button"
                          className={`${styles.entryModeButton} ${
                            entryMode === "multiple"
                              ? styles.activeEntryMode
                              : ""
                          }`}
                          onClick={() => setEntryMode("multiple")}
                        >
                          <strong>다건 입력</strong>
                          <span>여러 거래를 한 번에 입력</span>
                        </button>
                      </div>
                    </section>

                    {entryMode === "single" ? (
                      <>
                        <div className={styles.formFields}>
                          <fieldset className={styles.formField}>
                            <legend className={styles.formLabel}>
                              거래구분
                            </legend>

                            <div className={styles.transactionTypeOptions}>
                              <label
                                className={`${styles.transactionTypeButton} ${
                                  styles.incomeTypeButton
                                } ${
                                  transactionForm.type === "income"
                                    ? styles.activeTypeButton
                                    : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value="income"
                                  checked={transactionForm.type === "income"}
                                  onChange={handleTransactionFormChange}
                                />

                                <span
                                  className="material-icons"
                                  aria-hidden="true"
                                >
                                  arrow_upward
                                </span>

                                <span>수입</span>
                              </label>

                              <label
                                className={`${styles.transactionTypeButton} ${
                                  styles.expenseTypeButton
                                } ${
                                  transactionForm.type === "expense"
                                    ? styles.activeTypeButton
                                    : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value="expense"
                                  checked={transactionForm.type === "expense"}
                                  onChange={handleTransactionFormChange}
                                />

                                <span
                                  className="material-icons"
                                  aria-hidden="true"
                                >
                                  arrow_downward
                                </span>

                                <span>지출</span>
                              </label>

                              <label
                                className={`${styles.transactionTypeButton} ${
                                  styles.transferTypeButton
                                } ${
                                  transactionForm.type === "transfer"
                                    ? styles.activeTypeButton
                                    : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value="transfer"
                                  checked={transactionForm.type === "transfer"}
                                  onChange={handleTransactionFormChange}
                                />

                                <span
                                  className="material-icons"
                                  aria-hidden="true"
                                >
                                  sync_alt
                                </span>

                                <span>이체</span>
                              </label>
                            </div>
                          </fieldset>

                          <label className={styles.formField}>
                            <span className={styles.formLabel}>금액</span>

                            <span className={styles.amountInputBox}>
                              <input
                                type="number"
                                name="amount"
                                min="0"
                                inputMode="numeric"
                                value={transactionForm.amount}
                                onChange={handleTransactionFormChange}
                                placeholder="금액을 입력하세요"
                              />

                              <strong>원</strong>
                            </span>
                          </label>

                          {isTransfer ? (
                            <>
                              <div className={styles.formFieldRow}>
                                <label className={styles.formField}>
                                  <span className={styles.formLabel}>출금</span>

                                  <span className={styles.selectBox}>
                                    <select
                                      name="withdrawAccount"
                                      value={transactionForm.withdrawAccount}
                                      onChange={handleTransactionFormChange}
                                    >
                                      <option value="">출금 계좌 선택</option>
                                      <option value="mainAccount">
                                        주거래 계좌
                                      </option>
                                      <option value="salaryAccount">
                                        급여 계좌
                                      </option>
                                      <option value="savingAccount">
                                        저축 계좌
                                      </option>
                                      <option value="cash">현금</option>
                                    </select>

                                    <span
                                      className="material-icons"
                                      aria-hidden="true"
                                    >
                                      keyboard_arrow_down
                                    </span>
                                  </span>
                                </label>

                                <label className={styles.formField}>
                                  <span className={styles.formLabel}>입금</span>

                                  <span className={styles.selectBox}>
                                    <select
                                      name="depositAccount"
                                      value={transactionForm.depositAccount}
                                      onChange={handleTransactionFormChange}
                                    >
                                      <option value="">입금 계좌 선택</option>
                                      <option value="mainAccount">
                                        주거래 계좌
                                      </option>
                                      <option value="salaryAccount">
                                        급여 계좌
                                      </option>
                                      <option value="savingAccount">
                                        저축 계좌
                                      </option>
                                      <option value="cash">현금</option>
                                    </select>

                                    <span
                                      className="material-icons"
                                      aria-hidden="true"
                                    >
                                      keyboard_arrow_down
                                    </span>
                                  </span>
                                </label>
                              </div>

                              <div className={styles.formFieldRow}>
                                <label className={styles.formField}>
                                  <span className={styles.formLabelRow}>
                                    <span className={styles.formLabel}>
                                      카테고리
                                    </span>

                                    <span className={styles.recurringControl}>
                                      <span>반복</span>

                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                          transactionForm.isRecurring
                                        }
                                        className={`${styles.recurringSwitch} ${
                                          transactionForm.isRecurring
                                            ? styles.recurringSwitchActive
                                            : ""
                                        }`}
                                        onClick={handleToggleRecurring}
                                      >
                                        <span
                                          className={
                                            styles.recurringSwitchHandle
                                          }
                                        />
                                      </button>
                                    </span>
                                  </span>

                                  <span className={styles.selectBox}>
                                    <select
                                      name="category"
                                      value={transactionForm.category}
                                      onChange={handleTransactionFormChange}
                                    >
                                      <option value="">카테고리 선택</option>
                                      <option value="savings">저축</option>
                                      <option value="accountTransfer">
                                        계좌이체
                                      </option>
                                      <option value="cardPayment">
                                        카드대금
                                      </option>
                                      <option value="investment">투자</option>
                                      <option value="other">기타</option>
                                    </select>

                                    <span
                                      className="material-icons"
                                      aria-hidden="true"
                                    >
                                      keyboard_arrow_down
                                    </span>
                                  </span>
                                </label>

                                {transactionForm.isRecurring ? (
                                  <label className={styles.formField}>
                                    <span className={styles.formLabel}>
                                      반복일
                                    </span>

                                    <span className={styles.recurringDateBox}>
                                      <select
                                        name="recurringDay"
                                        value={transactionForm.recurringDay}
                                        onChange={handleTransactionFormChange}
                                      >
                                        {Array.from(
                                          { length: 31 },
                                          (_, index) => {
                                            const day = String(index + 1);

                                            return (
                                              <option value={day} key={day}>
                                                매월 {day}일
                                              </option>
                                            );
                                          },
                                        )}
                                      </select>

                                      <span
                                        className="material-icons"
                                        aria-hidden="true"
                                      >
                                        calendar_month
                                      </span>
                                    </span>
                                  </label>
                                ) : (
                                  <label className={styles.formField}>
                                    <span className={styles.formLabel}>
                                      날짜
                                    </span>

                                    <span className={styles.dateInputBox}>
                                      <input
                                        type="date"
                                        name="date"
                                        value={transactionForm.date}
                                        onChange={handleTransactionFormChange}
                                      />
                                    </span>
                                  </label>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={styles.formFieldRow}>
                                <label className={styles.formField}>
                                  <span className={styles.formLabel}>
                                    카테고리
                                  </span>

                                  <span className={styles.selectBox}>
                                    <select
                                      name="category"
                                      value={transactionForm.category}
                                      onChange={handleTransactionFormChange}
                                    >
                                      <option value="">카테고리 선택</option>
                                      <option value="salary">월급</option>
                                      <option value="otherIncome">
                                        부수입
                                      </option>
                                      <option value="food">식비</option>
                                      <option value="cafeSnack">
                                        카페/간식
                                      </option>
                                      <option value="transportation">
                                        교통
                                      </option>
                                      <option value="shopping">쇼핑</option>
                                      <option value="subscription">구독</option>
                                      <option value="other">기타</option>
                                    </select>

                                    <span
                                      className="material-icons"
                                      aria-hidden="true"
                                    >
                                      keyboard_arrow_down
                                    </span>
                                  </span>
                                </label>

                                <label className={styles.formField}>
                                  <span className={styles.formLabel}>날짜</span>

                                  <span className={styles.dateInputBox}>
                                    <input
                                      type="date"
                                      name="date"
                                      value={transactionForm.date}
                                      onChange={handleTransactionFormChange}
                                    />
                                  </span>
                                </label>
                              </div>

                              <label className={styles.formField}>
                                <span className={styles.formLabel}>
                                  결제수단
                                </span>

                                <span
                                  className={`${styles.selectBox} ${styles.paymentSelectBox}`}
                                >
                                  <select
                                    name="paymentMethod"
                                    value={transactionForm.paymentMethod}
                                    onChange={handleTransactionFormChange}
                                  >
                                    <option value="">결제수단 선택</option>
                                    <option value="creditCard">신용카드</option>
                                    <option value="checkCard">체크카드</option>
                                    <option value="accountTransfer">
                                      계좌이체
                                    </option>
                                    <option value="cash">현금</option>
                                    <option value="kakaoPay">카카오페이</option>
                                    <option value="other">기타</option>
                                  </select>

                                  <span
                                    className="material-icons"
                                    aria-hidden="true"
                                  >
                                    keyboard_arrow_down
                                  </span>
                                </span>
                              </label>
                            </>
                          )}

                          <label className={styles.formField}>
                            <span className={styles.formLabel}>내용</span>

                            <input
                              type="text"
                              name="content"
                              value={transactionForm.content}
                              onChange={handleTransactionFormChange}
                              className={styles.textInput}
                              placeholder="내용을 입력하세요 (선택)"
                              maxLength={50}
                            />

                            <span className={styles.characterCount}>
                              {transactionForm.content.length}/50
                            </span>
                          </label>

                          <label className={styles.formField}>
                            <span className={styles.formLabel}>메모</span>

                            <input
                              type="text"
                              name="memo"
                              value={transactionForm.memo}
                              onChange={handleTransactionFormChange}
                              className={styles.textInput}
                              placeholder="메모를 입력하세요 (선택)"
                              maxLength={50}
                            />

                            <span className={styles.characterCount}>
                              {transactionForm.memo.length}/50
                            </span>
                          </label>
                        </div>

                        <section className={styles.attachmentSection}>
                          <div className={styles.attachmentDescription}>
                            <h3>거래 자료 첨부</h3>

                            <p>
                              영수증, 거래내역 등을 거래 기록과 함께 보관하세요.
                            </p>
                          </div>

                          <label className={styles.attachmentBox}>
                            <input
                              type="file"
                              name="attachment"
                              accept="image/*"
                              onChange={handleTransactionFormChange}
                            />

                            <span
                              className={`material-icons ${styles.attachmentIcon}`}
                              aria-hidden="true"
                            >
                              add_photo_alternate
                            </span>

                            <span className={styles.attachmentText}>
                              <strong>
                                {transactionForm.attachment
                                  ? transactionForm.attachment.name
                                  : "이미지 등록"}
                              </strong>

                              <small>
                                이 영역을 클릭하거나 이미지를 드래그 하세요.
                              </small>
                            </span>
                          </label>
                        </section>
                      </>
                    ) : (
                      <div className={styles.multipleEntryPlaceholder}>
                        다건 입력 UI는 다음 단계에서 추가
                      </div>
                    )}

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.saveButton}>
                        저장하기
                      </button>

                      <button
                        type="button"
                        className={styles.continueButton}
                        onClick={handleContinueEntry}
                      >
                        계속 입력
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.aiEntryPlaceholder}>
                    AI 자동 인식 UI는 이후 단계에서 추가
                  </div>
                )}
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
