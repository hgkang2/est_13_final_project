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
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useMultipleTransactionForm } from "./hooks/useMultipleTransactionForm";
import { useTransactions } from "./hooks/useTransactions";
import { useTransactionActions } from "./hooks/useTransactionActions";
import { getToday } from "./utils/transactionDate";

export default function Transaction() {
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const supabase = createClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [toastAction, setToastAction] = useState(null);
  const [scrollTargetId, setScrollTargetId] = useState(null);

  const showToast = (message, type = "success", action = null) => {
    setToastType(type);
    setToastMessage(message);
    setToastAction(action);
  };

  const {
    transactions,
    setTransactions,
    recentTransactions,
    monthlySummary,
    isSummaryLoading,
    refreshMonthlySummary,
    refreshRecentTransactions,
    refreshTransactions,
    loadMoreTransactions,
    hasMoreTransactions,
    isTransactionsLoading,
    activeFilter,
    setActiveFilter,
    dateRange,
    visibleTransactions,
    hasTransactionData,
    isCurrentMonthRange,
    handleDateRangeChange,
    handleMoveToDate,
    handleMoveToCurrentMonth,
    selectedIds,
    setSelectedIds,
    handleToggleTransaction,
    handleToggleAll,
  } = useTransactions(supabase, showToast);

  // 저장한 거래 위치로 이동
  const focusSavedTransaction = transactionId => {
    setScrollTargetId(transactionId);
    setRecentlyAddedId(transactionId);

    setTimeout(() => {
      setScrollTargetId(currentId =>
        currentId === transactionId ? null : currentId,
      );

      setRecentlyAddedId(currentId =>
        currentId === transactionId ? null : currentId,
      );
    }, 1800);
  };

  // 저장 후 현재 목록에서 확인 가능한지에 따라 안내
  const handleSavedTransaction = (
    transaction,
    refreshedTransactions,
    successMessage,
  ) => {
    const isLoaded = (refreshedTransactions ?? []).some(
      item => item.id === transaction.id,
    );

    // 현재 로드된 목록 안에 있으면 실제 위치로 바로 이동
    if (isLoaded) {
      focusSavedTransaction(transaction.id);
      return;
    }

    const [, month, day] = transaction.dateValue.split("-");

    // 현재 목록에서 바로 볼 수 없으면 해당 날짜 보기 제공
    showToast(successMessage, "success", {
      label: `${Number(month)}월 ${Number(day)}일 기록 보기`,
      onClick: () => {
        focusSavedTransaction(transaction.id);
        handleMoveToDate(transaction.dateValue);

        showToast(`${Number(month)}월 ${Number(day)}일 기록을 보고 있어요.`);
      },
    });
  };

  const [panelView, setPanelView] = useState("entry");
  // "entry" | "recent" | "detail" | "edit" | "closed"

  const [entryTab, setEntryTab] = useState("manual");
  const [entryMode, setEntryMode] = useState("single");

  const [copiedRecentId, setCopiedRecentId] = useState(null);

  const [copyTarget, setCopyTarget] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isMultipleConfirmOpen, setIsMultipleConfirmOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transferAccounts, setTransferAccounts] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);
  const [isSelectedDeleteSuccessOpen, setIsSelectedDeleteSuccessOpen] =
    useState(false);

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
    setAiTypeValues,
    onAiFormChange,
  } = useTransactionForm();

  // 2. 다건 폼 상태
  const {
    multipleRows,
    resetMultipleRows,
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
    handleDeleteSelectedTransactions,
  } = useTransactionActions({
    supabase,

    transactionForm,
    setTransactionForm,
    setTransactionErrors,

    multipleRows,
    isValidMultipleRow,
    resetMultipleRows,
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
    setIsSelectedDeleteSuccessOpen,

    setTransactions,
    refreshTransactions,
    refreshRecentTransactions,
    refreshMonthlySummary,
    setRecentlyAddedId,
    showToast,
    onTransactionSaved: handleSavedTransaction,
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
        showToast("카테고리를 불러오지 못했어요.", "error");
        return;
      }

      if (paymentMethodError) {
        console.error("결제수단 조회 실패:", paymentMethodError);
        showToast("결제수단을 불러오지 못했어요.", "error");
        return;
      }

      if (transferAccountError) {
        console.error("이체 계좌 조회 실패:", transferAccountError);
        showToast("이체 계좌를 불러오지 못했어요.", "error");
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

    const timer = setTimeout(
      () => {
        setToastMessage("");
        setToastAction(null);
      },
      toastAction ? 5000 : 2000,
    );

    return () => clearTimeout(timer);
  }, [toastMessage, toastAction]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    const handleChange = event => {
      if (event.matches && entryMode === "multiple") {
        setEntryMode("single");
        showToast(
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

    showToast("거래 정보를 입력창에 복사했어요.");
  };

  const summaryData = monthlySummary ?? {
    income: 0,
    expense: 0,
    transactionCount: 0,
    incomeCount: 0,
    expenseCount: 0,
    transferCount: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
    balanceChange: 0,
  };

  const onCancelMultipleEntry = () => {
    setEntryMode("single");
  };

  const onMultipleSubmit = () => {
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      showToast("저장할 수 있는 거래가 없어요.", "error");
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
                isLoading={isSummaryLoading}
                hasTransactionData={hasTransactionData}
                summaryData={summaryData}
              />
              <section className={styles.transactionSection}>
                <TransactionToolbar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  isCurrentMonthRange={isCurrentMonthRange}
                  onMoveToCurrentMonth={handleMoveToCurrentMonth}
                />
                <TransactionList
                  isLoading={isTransactionsLoading}
                  hasTransactionData={hasTransactionData}
                  visibleTransactions={visibleTransactions}
                  recentlyAddedId={recentlyAddedId}
                  scrollTargetId={scrollTargetId}
                  selectedIds={selectedIds}
                  onToggleAll={handleToggleAll}
                  onToggleTransaction={handleToggleTransaction}
                  onClearSelection={() => setSelectedIds([])}
                  onDeleteSelected={setSelectedDeleteIds}
                  onOpenDetail={handleOpenDetail}
                  onLoadMore={loadMoreTransactions}
                  hasMoreTransactions={hasMoreTransactions}
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
                  setPanelView("closed");
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
                options={{
                  categories,
                  paymentMethods,
                  transferAccounts,
                }}
                manualEntry={{
                  transactionForm,
                  transactionErrors,
                  onTransactionFormChange,
                  onToggleRecurring,
                  onTransactionSubmit,
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
        isOpen={selectedDeleteIds.length > 0}
        type="danger"
        icon="error_outline"
        title={`${selectedDeleteIds.length}건을 삭제하시겠습니까?`}
        description="삭제한 내역은 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onCancel={() => setSelectedDeleteIds([])}
        onConfirm={async () => {
          await handleDeleteSelectedTransactions(selectedDeleteIds);
          setSelectedDeleteIds([]);
        }}
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
      <Modal
        isOpen={isSelectedDeleteSuccessOpen}
        type="danger"
        icon="delete_outline"
        title="삭제되었습니다."
        description="선택한 소비 기록이 삭제되었습니다."
        confirmText="확인"
        onConfirm={() => setIsSelectedDeleteSuccessOpen(false)}
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
          {toastAction && (
            <button
              type="button"
              className={styles.toastAction}
              onClick={() => toastAction.onClick?.()}
            >
              {toastAction.label}
            </button>
          )}
        </div>
      )}
    </>
  );
}
