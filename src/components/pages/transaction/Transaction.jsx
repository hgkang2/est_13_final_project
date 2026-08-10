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

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTransaction = transaction => {
  const transactionDate = new Date(transaction.transaction_at);

  const date = transactionDate.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateValue = [
    transactionDate.getFullYear(),
    String(transactionDate.getMonth() + 1).padStart(2, "0"),
    String(transactionDate.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    id: transaction.id,
    date,
    dateValue,

    type: transaction.transaction_type,

    typeLabel:
      transaction.transaction_type === "income"
        ? "수입"
        : transaction.transaction_type === "expense"
          ? "지출"
          : "이체",

    category: transaction.category?.name ?? "-",
    categoryType: transaction.category?.code ?? "",
    categoryId: transaction.category?.id ?? "",

    content: transaction.content ?? "-",

    amount:
      transaction.transaction_type === "income"
        ? transaction.amount
        : -transaction.amount,

    paymentMethod:
      transaction.transaction_type === "transfer"
        ? "계좌이체"
        : (transaction.payment_method?.name ?? "-"),

    paymentMethodId: transaction.payment_method?.id ?? "",

    memo: transaction.memo ?? "",

    withdrawAccount: transaction.withdraw_account?.name ?? null,
    withdrawAccountId: transaction.withdraw_account?.id ?? "",

    depositAccount: transaction.deposit_account?.name ?? null,
    depositAccountId: transaction.deposit_account?.id ?? "",

    isRecurring: transaction.is_recurring,
    recurringDay: transaction.recurring_day,
  };
};

const initialTransactionForm = {
  type: "income",
  amount: "",
  category: "",
  date: getToday(),
  time: "", // 추가
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
  time: "",
  type: "",
  category: "",
  content: "",
  amount: "",
  paymentMethod: "",
  memo: "",
});

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const hasTransactionData = transactions.length > 0;
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const supabase = createClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [panelView, setPanelView] = useState("entry");
  // "entry" | "recent" | "detail" | "edit" | "closed"

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
  const [copiedRecentId, setCopiedRecentId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [copyTarget, setCopyTarget] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isMultipleConfirmOpen, setIsMultipleConfirmOpen] = useState(false);
  const [transactionErrors, setTransactionErrors] = useState({});
  const [aiTransactionErrors, setAiTransactionErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transferAccounts, setTransferAccounts] = useState([]);

  useEffect(() => {
    const fetchTransactionOptions = async () => {
      const [
        { data: categoryData, error: categoryError },
        { data: paymentMethodData, error: paymentMethodError },
        { data: transferAccountData, error: transferAccountError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, code, name, transaction_type, sort_order")
          .eq("is_active", true)
          .order("sort_order"),

        supabase
          .from("payment_methods")
          .select("id, code, name, sort_order")
          .eq("is_active", true)
          .order("sort_order"),

        supabase
          .from("transfer_accounts")
          .select("id, code, name, sort_order")
          .eq("is_active", true)
          .order("sort_order"),
      ]);

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

    fetchTransactionOptions();
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

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsTransactionsLoading(true);

      // 1. 로그인 사용자 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("사용자 확인 실패:", userError);
        setIsTransactionsLoading(false);
        return;
      }

      // 2. 거래 목록 조회
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
        id,
        transaction_type,
        amount,
        content,
        memo,
        transaction_at,
        is_recurring,
        recurring_day,

        category:categories (
          id,
          code,
          name
        ),

        payment_method:payment_methods (
          id,
          code,
          name
        ),

        withdraw_account:transfer_accounts!transactions_withdraw_account_id_fkey (
          id,
          code,
          name
        ),

        deposit_account:transfer_accounts!transactions_deposit_account_id_fkey (
          id,
          code,
          name
        )
      `,
        )
        .eq("user_id", user.id)
        .order("transaction_at", { ascending: false });

      if (error) {
        console.error("소비 기록 조회 실패:", error);
        setIsTransactionsLoading(false);
        return;
      }

      // 3. DB 데이터 → 현재 UI 형식으로 변환
      const formattedTransactions = (data ?? []).map(formatTransaction);

      setTransactions(formattedTransactions);
      setIsTransactionsLoading(false);

      console.log("소비 기록 조회 성공:", formattedTransactions);
    };

    fetchTransactions();
  }, []);

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
      paymentMethod: copyTarget.paymentMethodId,
      content: copyTarget.content === "-" ? "" : copyTarget.content,
      memo: "",
    }));

    setEntryTab("manual");
    setEntryMode("single");
    setPanelView("entry");
    setCopiedRecentId(copyTarget.id);

    setIsCopyModalOpen(false);
    setCopyTarget(null);

    setToastMessage("거래 정보를 입력창에 복사했어요.");
  };

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

  const recentTransactions = transactions.slice(0, 6);
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

  const onTransactionFormChange = event => {
    const { name, value, files } = event.target;

    setTransactionErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));
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

  const onToggleRecurring = () => {
    setTransactionForm(prevForm => ({
      ...prevForm,
      isRecurring: !prevForm.isRecurring,
    }));
  };

  const validateTransactionForm = (
    form,
    { validateTransferAccounts = true } = {},
  ) => {
    const errors = {};

    if (!form.amount) {
      errors.amount = "금액을 입력해주세요.";
    } else if (
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      errors.amount = "금액은 0보다 큰 숫자로 입력해주세요.";
    }

    if (!form.category) {
      errors.category = "카테고리를 선택해주세요.";
    }

    if (!form.date) {
      errors.date = "날짜를 선택해주세요.";
    }

    if (!form.paymentMethod && form.type !== "transfer") {
      errors.paymentMethod = "결제수단을 선택해주세요.";
    }

    if (form.type === "transfer" && validateTransferAccounts) {
      if (!form.withdrawAccount) {
        errors.withdrawAccount = "출금 계좌를 선택해주세요.";
      }

      if (!form.depositAccount) {
        errors.depositAccount = "입금 계좌를 선택해주세요.";
      }
    }

    return errors;
  };

  const onTransactionSubmit = async event => {
    event.preventDefault();

    // 1. 입력값 검증
    const errors = validateTransactionForm(transactionForm);

    if (Object.keys(errors).length > 0) {
      setTransactionErrors(errors);
      return;
    }

    setTransactionErrors({});

    // 2. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    // 3. transaction_at 생성
    const now = new Date();

    const transactionDate = new Date(
      Number(transactionForm.date.slice(0, 4)),
      Number(transactionForm.date.slice(5, 7)) - 1,
      Number(transactionForm.date.slice(8, 10)),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    );

    if (Number.isNaN(transactionDate.getTime())) {
      setTransactionErrors(prev => ({
        ...prev,
        date: "올바른 날짜를 선택해주세요.",
      }));
      return;
    }

    // 4. DB 저장값 구성
    const transactionData = {
      user_id: user.id,
      transaction_type: transactionForm.type,
      amount: Number(transactionForm.amount),
      category_id: transactionForm.category,

      payment_method_id:
        transactionForm.type === "transfer"
          ? null
          : transactionForm.paymentMethod,

      withdraw_account_id:
        transactionForm.type === "transfer"
          ? transactionForm.withdrawAccount
          : null,

      deposit_account_id:
        transactionForm.type === "transfer"
          ? transactionForm.depositAccount
          : null,

      content: transactionForm.content.trim() || null,
      memo: transactionForm.memo.trim() || null,

      transaction_at: transactionDate.toISOString(),

      input_method: "manual",

      is_recurring:
        transactionForm.type === "transfer"
          ? transactionForm.isRecurring
          : false,

      recurring_day:
        transactionForm.type === "transfer" && transactionForm.isRecurring
          ? Number(transactionForm.recurringDay)
          : null,
    };

    // 5. 거래 저장
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select(
        `
          id,
          transaction_type,
          amount,
          content,
          memo,
          transaction_at,
          is_recurring,
          recurring_day,

          category:categories (
            id,
            code,
            name
          ),

          payment_method:payment_methods (
            id,
            code,
            name
          ),

          withdraw_account:transfer_accounts!transactions_withdraw_account_id_fkey (
            id,
            code,
            name
          ),

          deposit_account:transfer_accounts!transactions_deposit_account_id_fkey (
            id,
            code,
            name
          )
        `,
      )
      .single();

    // 6. 저장 실패
    if (insertError) {
      console.error("소비 기록 저장 실패:", insertError);
      setToastMessage("소비 기록을 저장하지 못했어요.");
      return;
    }

    // 방어 코드
    if (!insertedTransaction) {
      console.error("저장 결과가 반환되지 않았습니다.");
      setToastMessage("소비 기록 저장 결과를 확인하지 못했어요.");
      return;
    }

    // 7. 저장 성공
    console.log("소비 기록 저장 성공:", insertedTransaction);

    const newTransaction = formatTransaction(insertedTransaction);

    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

    setRecentlyAddedId(insertedTransaction.id);

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1800);

    setToastMessage("소비 기록을 저장했어요.");
    setTransactionForm(initialTransactionForm);
  };

  const onContinueEntry = () => {
    setTransactionForm(initialTransactionForm);
  };

  const onMultipleRowChange = (id, event) => {
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

  const onAddMultipleRow = () => {
    setMultipleRows(prevRows => {
      const nextId =
        prevRows.length === 0
          ? 1
          : Math.max(...prevRows.map(row => row.id)) + 1;

      return [...prevRows, createMultipleTransactionRow(nextId)];
    });
  };

  const onRemoveMultipleRow = id => {
    setMultipleRows(prevRows => prevRows.filter(row => row.id !== id));
  };

  const onCancelMultipleEntry = () => {
    setEntryMode("single");
  };

  const onMultipleSubmit = () => {
    const validRows = multipleRows.filter(
      row =>
        row.date && row.type && row.category && row.amount && row.paymentMethod,
    );

    if (validRows.length === 0) {
      setToastMessage("저장할 수 있는 거래가 없어요.");
      return;
    }

    setIsMultipleConfirmOpen(true);
  };

  const handleConfirmMultipleSubmit = () => {
    const validRows = multipleRows.filter(
      row =>
        row.date && row.type && row.category && row.amount && row.paymentMethod,
    );

    console.log("다건 저장값", validRows);

    setIsMultipleConfirmOpen(false);
    setToastMessage(`${validRows.length}건의 소비 기록을 저장했어요.`);
  };

  const onAiFormChange = event => {
    const { name, value } = event.target;

    setAiTransactionErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));

    setAiTransactionForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleAiReceipt = file => {
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

  const onAiReceiptChange = event => {
    handleAiReceipt(event.target.files?.[0]);
  };

  const onAiDragOver = event => {
    event.preventDefault();
  };

  const onAiDrop = event => {
    event.preventDefault();

    handleAiReceipt(event.dataTransfer.files?.[0]);
  };

  const onAiTransactionSubmit = event => {
    event.preventDefault();

    if (aiStatus !== "success") return;

    const errors = validateTransactionForm(aiTransactionForm, {
      validateTransferAccounts: false,
    });

    if (Object.keys(errors).length > 0) {
      setAiTransactionErrors(errors);
      return;
    }

    setAiTransactionErrors({});
    console.log("AI 자동 인식 입력값", aiTransactionForm);
  };

  const handleOpenDetail = transaction => {
    setSelectedTransaction({
      ...transaction,

      // UI 개발용 임시값
      // 1번 거래만 영수증이 있는 상태로 테스트
      receiptImage: transaction.id === 1 ? "/images/receipt-sample.jpg" : null,

      createdAt: "2026.07.29 18:42",
      updatedAt: "2026.07.30 09:11",
    });

    setPanelView("detail");
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

              <SummaryCards hasTransactionData={hasTransactionData} />
              <section className={styles.transactionSection}>
                <TransactionToolbar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
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
                onClose={() => {
                  setPanelView("closed");
                  setSelectedTransaction(null);
                }}
                onCancel={() => {
                  setPanelView("detail");
                }}
                onSave={updatedForm => {
                  console.log("수정 저장값", updatedForm);

                  setPanelView("detail");
                }}
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

      {toastMessage && (
        <div className={styles.toast} role="status" aria-live="polite">
          <span
            className={`material-icons ${styles.toastIcon}`}
            aria-hidden="true"
          >
            check_circle
          </span>

          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
