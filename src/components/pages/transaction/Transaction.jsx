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
import { formatTransaction } from "./utils/transactionFormatter";
import {
  deleteTransaction,
  fetchTransactionOptions,
  updateTransaction,
} from "./services/transactionService";
import {
  createReceiptAttachment,
  createReceiptSignedUrl,
  deleteReceiptAttachment,
  fetchReceiptAttachment,
  removeReceiptFile,
  updateReceiptAttachment,
  uploadReceiptFile,
} from "./services/receiptService";
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

  const handleUpdateTransaction = async updatedForm => {
    if (!selectedTransaction) {
      setToastMessage("수정할 거래 정보를 확인할 수 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    const { data: existingAttachment, error: existingAttachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (existingAttachmentError) {
      console.error("기존 영수증 정보 조회 실패:", existingAttachmentError);
      setToastMessage("기존 영수증 정보를 확인하지 못했어요.");
      return;
    }

    const newAttachment = updatedForm.attachment;

    let nextReceiptImage = selectedTransaction.receiptImage ?? null;

    // 2. 수정 날짜/시간 생성
    const [year, month, day] = updatedForm.date.split("-").map(Number);

    const [hour, minute] = (updatedForm.time || "00:00").split(":").map(Number);

    const transactionDate = new Date(year, month - 1, day, hour, minute, 0);

    if (Number.isNaN(transactionDate.getTime())) {
      setToastMessage("거래 날짜를 확인해주세요.");
      return;
    }

    // 3. DB 수정값 구성
    const updateData = {
      transaction_type: updatedForm.type,
      amount: Number(updatedForm.amount),
      category_id: updatedForm.category,

      payment_method_id:
        updatedForm.type === "transfer" ? null : updatedForm.paymentMethod,

      withdraw_account_id:
        updatedForm.type === "transfer" ? updatedForm.withdrawAccount : null,

      deposit_account_id:
        updatedForm.type === "transfer" ? updatedForm.depositAccount : null,

      content: updatedForm.content.trim() || null,
      memo: updatedForm.memo.trim() || null,

      transaction_at: transactionDate.toISOString(),

      // 이체가 아니게 변경되면 반복이체 정보 제거
      is_recurring:
        updatedForm.type === "transfer"
          ? Boolean(updatedForm.isRecurring)
          : false,

      recurring_day:
        updatedForm.type === "transfer" && updatedForm.isRecurring
          ? Number(updatedForm.recurringDay)
          : null,
      updated_at: new Date().toISOString(),
    };

    // 4. 거래 수정
    const { data: updatedTransaction, error: updateError } =
      await updateTransaction(
        supabase,
        selectedTransaction.id,
        user.id,
        updateData,
      );

    // 5. 수정 실패
    if (updateError) {
      console.error("소비 기록 수정 실패:", updateError);
      setToastMessage("소비 기록을 수정하지 못했어요.");
      return;
    }

    if (!updatedTransaction) {
      console.error("수정 결과가 반환되지 않았습니다.");
      setToastMessage("수정된 소비 기록을 확인하지 못했어요.");
      return;
    }

    //영수증 첨부 수정 처리
    // 새 영수증 선택 → 신규 첨부 또는 기존 첨부 교체
    if (newAttachment) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(newAttachment.type)) {
        setToastMessage("영수증은 JPG, PNG, WEBP 이미지만 등록할 수 있어요.");
        return;
      }

      if (newAttachment.size > maxSize) {
        setToastMessage("영수증 이미지는 5MB 이하만 등록할 수 있어요.");
        return;
      }

      const extension =
        newAttachment.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = `receipt-${Date.now()}.${extension}`;

      const newStoragePath = `${user.id}/${selectedTransaction.id}/${safeFileName}`;

      // 새 파일부터 업로드
      const { error: uploadError } = await uploadReceiptFile(
        supabase,
        newStoragePath,
        newAttachment,
      );

      if (uploadError) {
        console.error("새 영수증 업로드 실패:", uploadError);
        setToastMessage("새 영수증을 업로드하지 못했어요.");
        return;
      }

      let attachmentSaveError = null;

      // 기존 첨부가 있으면 metadata UPDATE
      if (existingAttachment) {
        const { error } = await updateReceiptAttachment(
          supabase,
          existingAttachment.id,
          newStoragePath,
          newAttachment,
        );

        attachmentSaveError = error;
      } else {
        // 기존 첨부가 없으면 INSERT
        const { error } = await createReceiptAttachment(
          supabase,
          selectedTransaction.id,
          newStoragePath,
          newAttachment,
        );

        attachmentSaveError = error;
      }

      // attachment DB 저장 실패 → 방금 올린 Storage 파일 롤백
      if (attachmentSaveError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentSaveError);

        const { error: rollbackStorageError } = await removeReceiptFile(
          supabase,
          newStoragePath,
        );

        if (rollbackStorageError) {
          console.error("새 영수증 Storage 롤백 실패:", rollbackStorageError);
        }

        setToastMessage("영수증 정보를 수정하지 못했어요.");
        return;
      }

      if (
        existingAttachment?.storage_path &&
        existingAttachment.storage_path !== newStoragePath
      ) {
        const { error: oldStorageRemoveError } = await removeReceiptFile(
          supabase,
          existingAttachment.storage_path,
        );

        if (oldStorageRemoveError) {
          console.error(
            "기존 영수증 Storage 정리 실패:",
            oldStorageRemoveError,
          );
        }
      }

      // 새 영수증 상세화면용 signed URL 생성
      const { data: signedUrlData, error: signedUrlError } =
        await createReceiptSignedUrl(supabase, newStoragePath);

      if (signedUrlError) {
        console.error("새 영수증 URL 생성 실패:", signedUrlError);
        nextReceiptImage = null;
      } else {
        nextReceiptImage = signedUrlData.signedUrl;
      }
    }

    // 새 파일은 X "첨부 삭제"를 선택 경우
    else if (updatedForm.removeAttachment) {
      if (existingAttachment) {
        // DB 연결 제거
        const { error: attachmentDeleteError } = await deleteReceiptAttachment(
          supabase,
          existingAttachment.id,
        );

        if (attachmentDeleteError) {
          console.error("영수증 첨부정보 삭제 실패:", attachmentDeleteError);
          setToastMessage("영수증 정보를 삭제하지 못했어요.");
          return;
        }

        // Storage 실제 파일 제거
        if (existingAttachment.storage_path) {
          const { error: storageRemoveError } = await removeReceiptFile(
            supabase,
            existingAttachment.storage_path,
          );

          if (storageRemoveError) {
            // DB 연결은 이미 제거
            // Storage에 파일만 남는 cleanup 문제 -> 사용자 수정은 유지.
            console.error("영수증 Storage 삭제 실패:", storageRemoveError);
          }
        }
      }

      nextReceiptImage = null;
    }

    // 6. DB 데이터 → UI 형식
    const formattedTransaction = formatTransaction(updatedTransaction);

    // 7. 목록 즉시 반영
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === formattedTransaction.id
          ? formattedTransaction
          : transaction,
      ),
    );

    setRecentlyAddedId(formattedTransaction.id);

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1800);

    // 8. 상세도 즉시 수정
    setSelectedTransaction({
      ...formattedTransaction,
      receiptImage: nextReceiptImage,
    });

    // 9. 상세화면으로 복귀
    setPanelView("detail");
    setToastMessage("소비 기록을 수정했어요.");

    console.log("소비 기록 수정 성공:", updatedTransaction);
  };

  const handleOpenDetail = async transaction => {
    const { data: attachmentData, error: attachmentError } =
      await fetchReceiptAttachment(supabase, transaction.id);

    if (attachmentError) {
      console.error("영수증 첨부정보 조회 실패:", attachmentError);
    }

    let receiptImage = null;

    if (attachmentData?.storage_path) {
      const { data: signedUrlData, error: signedUrlError } =
        await createReceiptSignedUrl(supabase, attachmentData.storage_path);

      if (signedUrlError) {
        console.error("영수증 이미지 URL 생성 실패:", signedUrlError);
      } else {
        receiptImage = signedUrlData.signedUrl;
      }
    }

    setSelectedTransaction({
      ...transaction,
      receiptImage,
    });

    setPanelView("detail");
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) {
      setToastMessage("삭제할 거래 정보를 확인할 수 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    // 2. 첨부파일 정보 조회
    const { data: attachmentData, error: attachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (attachmentError) {
      console.error("첨부파일 정보 조회 실패:", attachmentError);
      setToastMessage("첨부파일 정보를 확인하지 못했어요.");
      return;
    }

    // 3. Storage 파일이 있으면 먼저 삭제
    if (attachmentData?.storage_path) {
      const { error: storageDeleteError } = await removeReceiptFile(
        supabase,
        attachmentData.storage_path,
      );

      if (storageDeleteError) {
        console.error("영수증 Storage 삭제 실패:", storageDeleteError);
        setToastMessage("영수증 파일을 삭제하지 못했어요.");
        return;
      }
    }

    // 4. 거래 삭제
    const { error: deleteError } = await deleteTransaction(
      supabase,
      selectedTransaction.id,
      user.id,
    );

    if (deleteError) {
      console.error("소비 기록 삭제 실패:", deleteError);
      setToastMessage("소비 기록을 삭제하지 못했어요.");
      return;
    }

    // 5. 화면에서 즉시 제거
    setTransactions(prevTransactions =>
      prevTransactions.filter(
        transaction => transaction.id !== selectedTransaction.id,
      ),
    );

    // 체크된 상태였다면 같이 제거
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.filter(id => id !== selectedTransaction.id),
    );

    setSelectedTransaction(null);
    setPanelView("closed");

    setIsDeleteConfirmOpen(false);
    setIsDeleteSuccessOpen(true);
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
