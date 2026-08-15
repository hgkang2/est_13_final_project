"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Transaction.module.scss";
import RecentTransactions from "./components/RecentTransactions";
import TransactionDetail from "./components/TransactionDetailEdit/TransactionDetail";
import TransactionEdit from "./components/TransactionDetailEdit/TransactionEdit";
import SummaryCards from "./components/SummaryCards";
import TransactionToolbar from "./components/TransactionToolbar";
import TransactionList from "./components/TransactionList";
import CopyDateModal from "./components/CopyDateModal";
import EntryPanel from "./components/EntryPanel";
import Modal from "@/components/common/Modal";
import { fetchTransactionOptions } from "./services/transactionService";
import { useReceiptAnalysis } from "./hooks/useReceiptAnalysis";
import {
  initialTransactionForm,
  useTransactionForm,
} from "./hooks/useTransactionForm";

import { useMultipleTransactionForm } from "./hooks/useMultipleTransactionForm";
import { useTransactions } from "./hooks/useTransactions";
import { useTransactionActions } from "./hooks/useTransactionActions";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Transaction() {
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const supabase = createClient();
  const {
    transactions,
    setTransactions,
    isTransactionsLoading,
    activeFilter,
    setActiveFilter,
    dateRange,
    visibleTransactions,
    hasTransactionData,
    handleDateRangeChange,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    handleToggleTransaction,
    handleToggleAll,
  } = useTransactions(supabase);

  const [panelView, setPanelView] = useState("entry");
  // "entry" | "recent" | "detail" | "edit" | "closed"

  const [entryTab, setEntryTab] = useState("manual");
  const [entryMode, setEntryMode] = useState("single");

  const [copiedRecentId, setCopiedRecentId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastType(type);
    setToastMessage(message);
  };

  const [copyTarget, setCopyTarget] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isMultipleConfirmOpen, setIsMultipleConfirmOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transferAccounts, setTransferAccounts] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);

  // 1. 단건 + AI 폼 상태
  const {
    transactionForm,
    setTransactionForm,
    transactionErrors,
    setTransactionErrors,
    handleResetTransactionForm,
    onTransactionFormChange,
    onToggleRecurring,

    aiTransactionForm,
    setAiTransactionForm,
    aiTransactionErrors,
    setAiTransactionErrors,
    aiTypeValues,
    setAiTypeValues,
    onAiFormChange,
  } = useTransactionForm();

  // 2. 다건 폼 상태
  const {
    multipleRows,
    setMultipleRows,
    isValidMultipleRow,
    multipleRowStatus,
    onMultipleRowChange,
    onAddMultipleRow,
    onRemoveMultipleRow,
  } = useMultipleTransactionForm();

  // 3. AI 영수증 분석
  const {
    aiStatus,
    aiErrorMessage,
    aiPreview,
    setAiStatus,
    setAiErrorMessage,
    setAiPreview,
    onAiReceiptChange,
    onAiDragOver,
    onAiDrop,
  } = useReceiptAnalysis({
    supabase,
    categories,
    paymentMethods,
    showToast,
    setAiTransactionForm,
    setAiTypeValues,
    setAiTransactionErrors,
  });

  // 4. 실제 거래 저장 action
  const {
    onTransactionSubmit,
    handleConfirmMultipleSubmit,
    onAiTransactionSubmit,
    handleUpdateTransaction,
    handleOpenDetail,
    handleDeleteTransaction,
  } = useTransactionActions({
    supabase,

    transactionForm,
    setTransactionForm,
    setTransactionErrors,

    multipleRows,
    isValidMultipleRow,
    setMultipleRows,
    setIsMultipleConfirmOpen,

    aiStatus,
    aiTransactionForm,
    setAiTransactionForm,
    setAiTransactionErrors,
    setAiTypeValues,
    setAiPreview,
    setAiErrorMessage,
    setAiStatus,

    selectedTransaction,
    setSelectedTransaction,
    setPanelView,

    setSelectedIds,
    setIsDeleteConfirmOpen,
    setIsDeleteSuccessOpen,

    setTransactions,
    setRecentlyAddedId,
    setToastMessage,
    showToast,
  });

  useEffect(() => {
    const loadTransactionOptions = async () => {
      const [
        { data: categoryData, error: categoryError },
        { data: paymentMethodData, error: paymentMethodError },
        { data: transferAccountData, error: transferAccountError },
      ] = await fetchTransactionOptions(supabase);

      if (categoryError) {
        console.error("카테고리 조회 실패:", categoryError);
        return;
      }

      if (paymentMethodError) {
        console.error("결제수단 조회 실패:", paymentMethodError);
        return;
      }

      if (transferAccountError) {
        console.error("이체 계좌 조회 실패:", transferAccountError);
        return;
      }

      setCategories(categoryData ?? []);
      setPaymentMethods(paymentMethodData ?? []);
      setTransferAccounts(transferAccountData ?? []);
    };

    loadTransactionOptions();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    const handleChange = event => {
      if (event.matches && entryMode === "multiple") {
        setEntryMode("single");
        setToastMessage(
          "화면이 좁아져 단건 입력으로 전환했어요. 작성 중인 다건 입력 내용은 유지돼요.",
        );
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [entryMode]);

  const handleViewAllRecent = () => {
    console.log("최근 입력 전체 보기");
  };

  const handleRecentCopy = transaction => {
    setCopyTarget(transaction);
    setIsCopyModalOpen(true);
  };

  const handleConfirmRecentCopy = dateType => {
    if (!copyTarget) return;

    const today = getToday();

    setTransactionErrors({});

    setTransactionForm(prevForm => ({
      ...prevForm,
      type: copyTarget.type,
      amount: Math.abs(copyTarget.amount).toString(),
      category: copyTarget.categoryId,

      date: dateType === "today" ? today : copyTarget.dateValue,
      time: dateType === "today" ? "" : copyTarget.time,

      paymentMethod: copyTarget.paymentMethodId,

      withdrawAccount: copyTarget.withdrawAccountId,
      depositAccount: copyTarget.depositAccountId,

      content: copyTarget.content === "-" ? "" : copyTarget.content,
      memo: "",
    }));

    setEntryTab("manual");
    setEntryMode("single");
    setPanelView("entry");
    setCopiedRecentId(copyTarget.id);
    setTimeout(() => {
      setCopiedRecentId(null);
    }, 1800);

    setIsCopyModalOpen(false);
    setCopyTarget(null);

    setToastMessage("거래 정보를 입력창에 복사했어요.");
  };

  const isTransfer = transactionForm.type === "transfer";

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.dateValue);

    return (
      transactionDate.getFullYear() === currentYear &&
      transactionDate.getMonth() === currentMonth
    );
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonth = lastMonthDate.getMonth();

  const lastMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.dateValue);

    return (
      transactionDate.getFullYear() === lastMonthYear &&
      transactionDate.getMonth() === lastMonth
    );
  });

  const calculateSummary = transactionList => {
    return transactionList.reduce(
      (summary, transaction) => {
        if (transaction.type === "income") {
          summary.income += Math.abs(transaction.amount);
          summary.incomeCount += 1;
        }

        if (transaction.type === "expense") {
          summary.expense += Math.abs(transaction.amount);
          summary.expenseCount += 1;
        }

        if (transaction.type === "transfer") {
          summary.transferCount += 1;
        }

        return summary;
      },
      {
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0,
        transferCount: 0,
      },
    );
  };

  const thisMonthSummary = calculateSummary(thisMonthTransactions);
  const lastMonthSummary = calculateSummary(lastMonthTransactions);

  const summaryData = {
    income: thisMonthSummary.income,
    expense: thisMonthSummary.expense,

    transactionCount: thisMonthTransactions.length,
    incomeCount: thisMonthSummary.incomeCount,
    expenseCount: thisMonthSummary.expenseCount,
    transferCount: thisMonthSummary.transferCount,

    balance: thisMonthSummary.income - thisMonthSummary.expense,

    incomeChange: thisMonthSummary.income - lastMonthSummary.income,
    expenseChange: thisMonthSummary.expense - lastMonthSummary.expense,

    balanceChange:
      thisMonthSummary.income -
      thisMonthSummary.expense -
      (lastMonthSummary.income - lastMonthSummary.expense),
  };

  const onContinueEntry = () => {
    setTransactionForm(initialTransactionForm);
  };

  const onCancelMultipleEntry = () => {
    setEntryMode("single");
  };

  const onMultipleSubmit = () => {
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      setToastMessage("저장할 수 있는 거래가 없어요.");
      return;
    }

    setIsMultipleConfirmOpen(true);
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

              <SummaryCards
                hasTransactionData={hasTransactionData}
                summaryData={summaryData}
              />
              <section className={styles.transactionSection}>
                <TransactionToolbar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
                <TransactionList
                  hasTransactionData={hasTransactionData}
                  visibleTransactions={visibleTransactions}
                  recentlyAddedId={recentlyAddedId}
                  selectedIds={selectedIds}
                  isAllSelected={isAllSelected}
                  onToggleAll={handleToggleAll}
                  onToggleTransaction={handleToggleTransaction}
                  onClearSelection={() => setSelectedIds([])}
                  onOpenDetail={handleOpenDetail}
                />
              </section>
            </div>
            {panelView === "edit" && (
              <TransactionEdit
                transaction={selectedTransaction}
                categories={categories}
                paymentMethods={paymentMethods}
                transferAccounts={transferAccounts}
                onClose={() => {
                  setPanelView("closed");
                  setSelectedTransaction(null);
                }}
                onCancel={() => {
                  setPanelView("detail");
                }}
                onSave={handleUpdateTransaction}
              />
            )}

            {panelView === "detail" && (
              <TransactionDetail
                transaction={selectedTransaction}
                onClose={() => {
                  setPanelView("entry");
                  setSelectedTransaction(null);
                }}
                onEdit={() => {
                  setPanelView("edit");
                }}
                onDelete={() => setIsDeleteConfirmOpen(true)}
              />
            )}

            {panelView === "recent" && (
              <RecentTransactions
                transactions={recentTransactions}
                copiedId={copiedRecentId}
                onClose={() => setPanelView("entry")}
                onCopy={handleRecentCopy}
                onViewAll={handleViewAllRecent}
              />
            )}

            {panelView === "entry" && (
              <EntryPanel
                entryState={{
                  entryTab,
                  entryMode,
                }}
                manualEntry={{
                  transactionForm,
                  transactionErrors,

                  categories,
                  paymentMethods,
                  transferAccounts,

                  onTransactionFormChange,
                  onToggleRecurring,
                  onTransactionSubmit,
                  onContinueEntry,
                  onResetTransactionForm: () => {
                    handleResetTransactionForm();
                    setCopiedRecentId(null);
                  },
                }}
                multipleEntry={{
                  multipleRows,
                  multipleRowStatus,
                  onMultipleRowChange,
                  onAddMultipleRow,
                  onRemoveMultipleRow,
                  onCancelMultipleEntry,
                  onMultipleSubmit,
                }}
                aiEntry={{
                  aiStatus,
                  aiErrorMessage,
                  aiTransactionForm,
                  aiTransactionErrors,
                  aiPreview,
                  onAiFormChange,
                  onAiReceiptChange,
                  onAiDragOver,
                  onAiDrop,
                  onAiTransactionSubmit,
                }}
                panelActions={{
                  onClose: () => setPanelView("closed"),
                  onOpenRecent: () => setPanelView("recent"),
                  onEntryTabChange: setEntryTab,
                  onEntryModeChange: setEntryMode,
                }}
              />
            )}

            {panelView === "closed" && (
              <button
                type="button"
                className={styles.openEntryButton}
                onClick={() => setPanelView("entry")}
              >
                <span className="material-icons">add</span>
              </button>
            )}
            {isCopyModalOpen && (
              <CopyDateModal
                copyTarget={copyTarget}
                onClose={() => {
                  setIsCopyModalOpen(false);
                  setCopyTarget(null);
                }}
                onSelectDate={handleConfirmRecentCopy}
              />
            )}
          </div>
        </main>
      </div>

      {panelView === "closed" && <SubFooter />}
      <BottomTab />
      <Modal
        isOpen={isMultipleConfirmOpen}
        type="confirm"
        icon="help_outline"
        title={`${multipleRowStatus.available}건을 저장하시겠습니까?`}
        description="입력이 완료된 거래만 저장됩니다."
        confirmText="저장하기"
        cancelText="취소"
        onConfirm={handleConfirmMultipleSubmit}
        onCancel={() => setIsMultipleConfirmOpen(false)}
      />
      <Modal
        isOpen={isDeleteConfirmOpen}
        type="danger"
        icon="error_outline"
        title="삭제하시겠습니까?"
        description="삭제한 내역은 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTransaction}
      />
      <Modal
        isOpen={isDeleteSuccessOpen}
        type="danger"
        icon="delete_outline"
        title="삭제되었습니다."
        description="목록에서 변경된 내용을 확인하세요"
        confirmText="확인"
        onConfirm={() => {
          setIsDeleteSuccessOpen(false);
          setPanelView("entry");
          setEntryMode("single");
        }}
      />

      {toastMessage && (
        <div
          className={`${styles.toast} ${
            toastType === "error" ? styles.toastError : ""
          }`}
          role={toastType === "error" ? "alert" : "status"}
          aria-live={toastType === "error" ? "assertive" : "polite"}
        >
          <span
            className={`material-icons ${styles.toastIcon}`}
            aria-hidden="true"
          >
            {toastType === "error" ? "error" : "check_circle"}
          </span>

          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
