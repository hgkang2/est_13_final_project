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

const initialAiTransactionForm = {
  type: "",
  amount: "",
  category: "",
  date: "",
  paymentMethod: "",
  content: "",
  memo: "",
  receipt: null,
};

const mockAiResult = {
  type: "expense",
  amount: "4500",
  category: "cafeSnack",
  date: "2026-07-29",
  paymentMethod: "creditCard",
  content: "스타벅스 아메리카노",
  memo: "점심 후 커피",
};

const createMultipleTransactionRow = id => ({
  id,
  date: "",
  type: "",
  category: "",
  content: "",
  amount: "",
  paymentMethod: "",
  memo: "",
});

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

  const [multipleRows, setMultipleRows] = useState([
    {
      id: 1,
      date: "2026-07-29",
      type: "expense",
      category: "cafeSnack",
      content: "스타벅스 아메리카노",
      amount: "4500",
      paymentMethod: "creditCard",
      memo: "점심 후 커피",
    },
    createMultipleTransactionRow(2),
    createMultipleTransactionRow(3),
  ]);

  const [aiStatus, setAiStatus] = useState("idle");

  const [aiTransactionForm, setAiTransactionForm] = useState(
    initialAiTransactionForm,
  );

  const [aiPreview, setAiPreview] = useState("");

  const isTransfer = transactionForm.type === "transfer";

  const multipleRowStatus = multipleRows.reduce(
    (status, row) => {
      const hasRequiredFields =
        row.date && row.type && row.category && row.amount && row.paymentMethod;

      const hasAnyValue = Object.entries(row).some(
        ([key, value]) => key !== "id" && value,
      );

      if (hasRequiredFields) {
        status.available += 1;
      } else if (hasAnyValue) {
        status.error += 1;
      }

      return status;
    },
    {
      available: 0,
      error: 0,
    },
  );

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

  const handleMultipleRowChange = (id, event) => {
    const { name, value } = event.target;

    setMultipleRows(prevRows =>
      prevRows.map(row =>
        row.id === id
          ? {
              ...row,
              [name]: value,
            }
          : row,
      ),
    );
  };

  const handleAddMultipleRow = () => {
    setMultipleRows(prevRows => {
      const nextId =
        prevRows.length === 0
          ? 1
          : Math.max(...prevRows.map(row => row.id)) + 1;

      return [...prevRows, createMultipleTransactionRow(nextId)];
    });
  };

  const handleRemoveMultipleRow = id => {
    setMultipleRows(prevRows => prevRows.filter(row => row.id !== id));
  };

  const handleCancelMultipleEntry = () => {
    setEntryMode("single");
  };

  const handleMultipleSubmit = () => {
    console.log("다건 입력값", multipleRows);
  };

  const handleAiFormChange = event => {
    const { name, value } = event.target;

    setAiTransactionForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleAiReceiptChange = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAiTransactionForm(prevForm => ({
      ...prevForm,
      receipt: file,
    }));

    const reader = new FileReader();

    reader.onload = () => {
      setAiPreview(reader.result);
    };

    reader.readAsDataURL(file);

    setAiStatus("analyzing");

    setTimeout(() => {
      setAiTransactionForm(prevForm => ({
        ...prevForm,
        ...mockAiResult,
        receipt: file,
      }));

      setAiStatus("success");
    }, 1800);
  };

  const handleAiTransactionSubmit = event => {
    event.preventDefault();

    if (aiStatus !== "success") return;

    console.log("AI 자동 인식 입력값", aiTransactionForm);
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
              <aside
                className={`${styles.entryPanel} ${
                  entryMode === "multiple" ? styles.multipleEntryPanel : ""
                }`}
                aria-label="소비 기록 입력"
              >
                <div className={styles.entryPanelHeader}>
                  {entryMode === "multiple" ? (
                    <button
                      type="button"
                      className={styles.multipleBackButton}
                      onClick={() => setEntryMode("single")}
                    >
                      <span className="material-icons" aria-hidden="true">
                        arrow_back
                      </span>

                      <span>소비 기록으로 돌아가기</span>
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}

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

                <div
                  className={`${styles.entryTabs} ${
                    entryMode === "multiple" ? styles.multipleEntryTabs : ""
                  }`}
                  role="tablist"
                >
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
                    <section
                      className={`${styles.entryModeSection} ${
                        entryMode === "multiple"
                          ? styles.multipleEntryModeSection
                          : ""
                      }`}
                    >
                      <div className={styles.entryModeContent}>
                        <h3 className={styles.formSectionTitle}>
                          입력 방식 선택
                        </h3>

                        <div className={styles.entryModeOptions}>
                          <button
                            type="button"
                            className={`${styles.entryModeButton} ${
                              entryMode === "single"
                                ? styles.activeEntryMode
                                : ""
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
                      </div>

                      {entryMode === "multiple" && (
                        <section
                          className={styles.multipleStatus}
                          aria-label="다건 입력 작성 상태"
                        >
                          <div className={styles.multipleStatusItem}>
                            <span>작성 중</span>
                            <strong className={styles.writingCount}>
                              {multipleRows.length}건
                            </strong>
                          </div>

                          <div className={styles.statusDivider} />

                          <div className={styles.multipleStatusItem}>
                            <span>오류</span>
                            <strong className={styles.errorCount}>
                              {multipleRowStatus.error}건
                            </strong>
                          </div>

                          <div className={styles.statusDivider} />

                          <div className={styles.multipleStatusItem}>
                            <span>저장 가능</span>
                            <strong className={styles.availableCount}>
                              {multipleRowStatus.available}건
                            </strong>
                          </div>
                        </section>
                      )}
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
                      <div className={styles.multipleEntryContent}>
                        <section className={styles.multipleTable}>
                          <div className={styles.multipleTableHeader}>
                            <div className={styles.multipleNumberHeader} />
                            <div>날짜</div>
                            <div>구분</div>
                            <div>카테고리</div>
                            <div>내용</div>
                            <div>금액</div>
                            <div>결제수단</div>
                            <div>메모</div>

                            <div className={styles.multipleHelp}>
                              <span
                                className="material-icons"
                                aria-hidden="true"
                              >
                                help_outline
                              </span>
                            </div>
                          </div>

                          <ol className={styles.multipleRowList}>
                            {multipleRows.map((row, index) => (
                              <li className={styles.multipleRow} key={row.id}>
                                <strong className={styles.multipleRowNumber}>
                                  {index + 1}
                                </strong>

                                <input
                                  type="date"
                                  name="date"
                                  value={row.date}
                                  onChange={event =>
                                    handleMultipleRowChange(row.id, event)
                                  }
                                  className={styles.multipleDateInput}
                                  aria-label={`${index + 1}번 거래 날짜`}
                                />

                                <span className={styles.multipleSelect}>
                                  <select
                                    name="type"
                                    value={row.type}
                                    onChange={event =>
                                      handleMultipleRowChange(row.id, event)
                                    }
                                    aria-label={`${index + 1}번 거래 구분`}
                                  >
                                    <option value="">선택</option>
                                    <option value="income">수입</option>
                                    <option value="expense">지출</option>
                                    <option value="transfer">이체</option>
                                  </select>

                                  <span
                                    className="material-icons"
                                    aria-hidden="true"
                                  >
                                    keyboard_arrow_down
                                  </span>
                                </span>

                                <span className={styles.multipleSelect}>
                                  <select
                                    name="category"
                                    value={row.category}
                                    onChange={event =>
                                      handleMultipleRowChange(row.id, event)
                                    }
                                    aria-label={`${index + 1}번 거래 카테고리`}
                                  >
                                    <option value="">카테고리 선택</option>
                                    <option value="salary">월급</option>
                                    <option value="otherIncome">부수입</option>
                                    <option value="food">식비</option>
                                    <option value="cafeSnack">카페/간식</option>
                                    <option value="transportation">교통</option>
                                    <option value="shopping">쇼핑</option>
                                    <option value="subscription">구독</option>
                                    <option value="savings">저축</option>
                                    <option value="other">기타</option>
                                  </select>

                                  <span
                                    className="material-icons"
                                    aria-hidden="true"
                                  >
                                    keyboard_arrow_down
                                  </span>
                                </span>

                                <input
                                  type="text"
                                  name="content"
                                  value={row.content}
                                  onChange={event =>
                                    handleMultipleRowChange(row.id, event)
                                  }
                                  className={styles.multipleTextInput}
                                  placeholder="내용을 입력하세요 (선택)"
                                  maxLength={50}
                                  aria-label={`${index + 1}번 거래 내용`}
                                />

                                <span className={styles.multipleAmountInput}>
                                  <input
                                    type="number"
                                    name="amount"
                                    min="0"
                                    inputMode="numeric"
                                    value={row.amount}
                                    onChange={event =>
                                      handleMultipleRowChange(row.id, event)
                                    }
                                    placeholder="금액 입력"
                                    aria-label={`${index + 1}번 거래 금액`}
                                  />

                                  <strong>원</strong>
                                </span>

                                <span className={styles.multipleSelect}>
                                  <select
                                    name="paymentMethod"
                                    value={row.paymentMethod}
                                    onChange={event =>
                                      handleMultipleRowChange(row.id, event)
                                    }
                                    aria-label={`${index + 1}번 거래 결제수단`}
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

                                <input
                                  type="text"
                                  name="memo"
                                  value={row.memo}
                                  onChange={event =>
                                    handleMultipleRowChange(row.id, event)
                                  }
                                  className={styles.multipleTextInput}
                                  placeholder="메모를 입력하세요 (선택)"
                                  maxLength={50}
                                  aria-label={`${index + 1}번 거래 메모`}
                                />

                                <button
                                  type="button"
                                  className={styles.removeMultipleRowButton}
                                  onClick={() =>
                                    handleRemoveMultipleRow(row.id)
                                  }
                                  aria-label={`${index + 1}번 거래 행 삭제`}
                                >
                                  <span
                                    className="material-icons"
                                    aria-hidden="true"
                                  >
                                    clear
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ol>
                        </section>

                        <div className={styles.multipleActions}>
                          <div className={styles.multipleLeftActions}>
                            <button
                              type="button"
                              className={styles.addMultipleRowButton}
                              onClick={handleAddMultipleRow}
                            >
                              <span
                                className="material-icons"
                                aria-hidden="true"
                              >
                                add
                              </span>

                              <span>행 추가</span>
                            </button>

                            <button
                              type="button"
                              className={styles.excelDownloadButton}
                            >
                              <span
                                className="material-icons"
                                aria-hidden="true"
                              >
                                file_download
                              </span>

                              <span>엑셀 파일로 다운로드</span>
                            </button>
                          </div>

                          <div className={styles.multipleRightActions}>
                            <button
                              type="button"
                              className={styles.cancelMultipleButton}
                              onClick={handleCancelMultipleEntry}
                            >
                              취소
                            </button>

                            <button
                              type="button"
                              className={styles.saveMultipleButton}
                              onClick={handleMultipleSubmit}
                            >
                              {multipleRows.length}건 저장하기
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {entryMode === "single" && (
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
                    )}
                  </form>
                ) : (
                  <form
                    className={styles.aiEntryForm}
                    onSubmit={handleAiTransactionSubmit}
                  >
                    <section className={styles.aiRecognitionSection}>
                      <div className={styles.aiRecognitionHeading}>
                        <h3>AI 스마트 인식</h3>

                        <p>
                          이미지를 먼저 업로드해주세요.
                          <br />
                          AI가 거래 정보를 자동으로 입력합니다.
                        </p>
                      </div>

                      {aiStatus === "idle" && (
                        <label className={styles.aiUploadBox}>
                          <input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleAiReceiptChange}
                          />

                          <span
                            className={`material-icons ${styles.aiUploadIcon}`}
                            aria-hidden="true"
                          >
                            add_photo_alternate
                          </span>

                          <div className={styles.aiUploadText}>
                            <strong>
                              영수증 이미지를 드래그하거나 클릭하여 업로드
                            </strong>

                            <span>JPG, PNG · 최대 2MB</span>
                          </div>
                        </label>
                      )}

                      {aiStatus === "analyzing" && (
                        <div
                          className={styles.aiRecognitionBox}
                          role="status"
                          aria-live="polite"
                        >
                          <div
                            className={styles.aiSpinner}
                            aria-hidden="true"
                          />

                          <div className={styles.aiRecognitionMessage}>
                            <strong>거래 정보를 분석하고 있습니다.</strong>
                            <span>잠시만 기다려 주세요</span>
                          </div>
                        </div>
                      )}

                      {aiStatus === "success" && (
                        <div className={styles.aiRecognitionBox}>
                          <span
                            className={`material-icons ${styles.aiSuccessIcon}`}
                            aria-hidden="true"
                          >
                            check_circle
                          </span>

                          <div className={styles.aiRecognitionMessage}>
                            <strong>AI가 거래 정보를 입력했습니다.</strong>
                            <span>내용을 확인 후 저장해주세요</span>
                          </div>

                          {aiPreview && (
                            <img
                              src={aiPreview}
                              alt="업로드한 영수증 미리보기"
                              className={styles.aiReceiptPreview}
                            />
                          )}
                        </div>
                      )}
                    </section>

                    <div className={styles.aiFormFields}>
                      <fieldset className={styles.formField}>
                        <legend className={styles.aiFormLabel}>거래구분</legend>

                        <div className={styles.transactionTypeOptions}>
                          <label
                            className={`${styles.transactionTypeButton} ${
                              aiStatus === "success"
                                ? styles.incomeTypeButton
                                : styles.aiDisabledTypeButton
                            } ${
                              aiTransactionForm.type === "income"
                                ? styles.activeTypeButton
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value="income"
                              checked={aiTransactionForm.type === "income"}
                              onChange={handleAiFormChange}
                              disabled={aiStatus !== "success"}
                            />

                            <span className="material-icons" aria-hidden="true">
                              arrow_upward
                            </span>

                            <span>수입</span>
                          </label>

                          <label
                            className={`${styles.transactionTypeButton} ${
                              aiStatus === "success"
                                ? styles.expenseTypeButton
                                : styles.aiDisabledTypeButton
                            } ${
                              aiTransactionForm.type === "expense"
                                ? styles.activeTypeButton
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value="expense"
                              checked={aiTransactionForm.type === "expense"}
                              onChange={handleAiFormChange}
                              disabled={aiStatus !== "success"}
                            />

                            <span className="material-icons" aria-hidden="true">
                              arrow_downward
                            </span>

                            <span>지출</span>
                          </label>

                          <label
                            className={`${styles.transactionTypeButton} ${
                              aiStatus === "success"
                                ? styles.transferTypeButton
                                : styles.aiDisabledTypeButton
                            } ${
                              aiTransactionForm.type === "transfer"
                                ? styles.activeTypeButton
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value="transfer"
                              checked={aiTransactionForm.type === "transfer"}
                              onChange={handleAiFormChange}
                              disabled={aiStatus !== "success"}
                            />

                            <span className="material-icons" aria-hidden="true">
                              sync_alt
                            </span>

                            <span>이체</span>
                          </label>
                        </div>
                      </fieldset>

                      <label className={styles.formField}>
                        <span className={styles.aiFormLabel}>금액</span>

                        <span className={styles.amountInputBox}>
                          <input
                            type="number"
                            name="amount"
                            value={aiTransactionForm.amount}
                            onChange={handleAiFormChange}
                            disabled={aiStatus !== "success"}
                            placeholder={
                              aiStatus === "analyzing"
                                ? "분석 중입니다..."
                                : "금액을 입력하세요"
                            }
                          />

                          <strong>원</strong>
                        </span>
                      </label>

                      <div className={styles.formFieldRow}>
                        <label className={styles.formField}>
                          <span className={styles.aiFormLabel}>카테고리</span>

                          <span className={styles.selectBox}>
                            <select
                              name="category"
                              value={aiTransactionForm.category}
                              onChange={handleAiFormChange}
                              disabled={aiStatus !== "success"}
                            >
                              <option value="">
                                {aiStatus === "analyzing"
                                  ? "분석 중입니다..."
                                  : "카테고리 선택"}
                              </option>

                              <option value="salary">월급</option>
                              <option value="otherIncome">부수입</option>
                              <option value="food">식비</option>
                              <option value="cafeSnack">카페/간식</option>
                              <option value="transportation">교통</option>
                              <option value="shopping">쇼핑</option>
                              <option value="subscription">구독</option>
                              <option value="savings">저축</option>
                              <option value="other">기타</option>
                            </select>

                            <span className="material-icons" aria-hidden="true">
                              keyboard_arrow_down
                            </span>
                          </span>
                        </label>

                        <label className={styles.formField}>
                          <span className={styles.aiFormLabel}>날짜</span>

                          <span className={styles.dateInputBox}>
                            {aiStatus === "analyzing" ? (
                              <>
                                <span className={styles.aiAnalyzingText}>
                                  분석 중입니다...
                                </span>

                                <span
                                  className="material-icons"
                                  aria-hidden="true"
                                >
                                  calendar_month
                                </span>
                              </>
                            ) : (
                              <input
                                type="date"
                                name="date"
                                value={aiTransactionForm.date}
                                onChange={handleAiFormChange}
                                disabled={aiStatus !== "success"}
                              />
                            )}
                          </span>
                        </label>
                      </div>

                      <label className={styles.formField}>
                        <span className={styles.aiFormLabel}>결제수단</span>

                        <span
                          className={`${styles.selectBox} ${styles.aiPaymentSelectBox}`}
                        >
                          <select
                            name="paymentMethod"
                            value={aiTransactionForm.paymentMethod}
                            onChange={handleAiFormChange}
                            disabled={aiStatus !== "success"}
                          >
                            <option value="">
                              {aiStatus === "analyzing"
                                ? "분석 중입니다..."
                                : "결제수단 선택"}
                            </option>

                            <option value="creditCard">신용카드</option>
                            <option value="checkCard">체크카드</option>
                            <option value="accountTransfer">계좌이체</option>
                            <option value="cash">현금</option>
                            <option value="kakaoPay">카카오페이</option>
                            <option value="other">기타</option>
                          </select>

                          <span className="material-icons" aria-hidden="true">
                            keyboard_arrow_down
                          </span>
                        </span>
                      </label>

                      <label className={styles.formField}>
                        <span className={styles.aiFormLabel}>내용</span>

                        <input
                          type="text"
                          name="content"
                          value={aiTransactionForm.content}
                          onChange={handleAiFormChange}
                          disabled={aiStatus !== "success"}
                          className={styles.textInput}
                          placeholder={
                            aiStatus === "analyzing"
                              ? "분석 중입니다..."
                              : "내용을 입력하세요 (선택)"
                          }
                          maxLength={50}
                        />

                        <span className={styles.characterCount}>
                          {aiTransactionForm.content.length}/50
                        </span>
                      </label>

                      <label className={styles.formField}>
                        <span className={styles.aiFormLabel}>메모</span>

                        <input
                          type="text"
                          name="memo"
                          value={aiTransactionForm.memo}
                          onChange={handleAiFormChange}
                          disabled={aiStatus !== "success"}
                          className={styles.textInput}
                          placeholder={
                            aiStatus === "analyzing"
                              ? "분석 중입니다..."
                              : "메모를 입력하세요 (선택)"
                          }
                          maxLength={50}
                        />

                        <span className={styles.characterCount}>
                          {aiTransactionForm.memo.length}/50
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.aiSaveButton} ${
                        aiStatus === "success" ? styles.aiSaveButtonActive : ""
                      }`}
                      disabled={aiStatus !== "success"}
                    >
                      저장하기
                    </button>
                  </form>
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
