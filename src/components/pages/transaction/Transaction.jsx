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

const formatDateTime = value => {
  if (!value) return "-";

  const date = new Date(value);

  const formattedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");

  const formattedTime = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");

  return `${formattedDate} ${formattedTime}`;
};

const formatTransaction = transaction => {
  const transactionDate = new Date(transaction.transaction_at);

  const date = [
    transactionDate.getFullYear(),
    String(transactionDate.getMonth() + 1).padStart(2, "0"),
    String(transactionDate.getDate()).padStart(2, "0"),
  ].join(".");

  const time = [
    String(transactionDate.getHours()).padStart(2, "0"),
    String(transactionDate.getMinutes()).padStart(2, "0"),
  ].join(":");

  const dateValue = [
    transactionDate.getFullYear(),
    String(transactionDate.getMonth() + 1).padStart(2, "0"),
    String(transactionDate.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    id: transaction.id,
    date,
    time,
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

    createdAt: formatDateTime(transaction.created_at),
    updatedAt: formatDateTime(transaction.updated_at),
  };
};

const initialTransactionForm = {
  type: "income",
  amount: "",
  category: "",
  date: getToday(),
  time: "",
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
  time: "",
  paymentMethod: "",
  content: "",
  memo: "",
  receipt: null,
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
  withdrawAccount: "",
  depositAccount: "",
  memo: "",
});

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const supabase = createClient();

  const testAnalyzeReceipt = async () => {
    const { data, error } = await supabase.functions.invoke("analyze-receipt", {
      body: {
        name: "MO:UM",
      },
    });

    console.log("Edge Function data:", data);
    console.log("Edge Function error:", error);
  };

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
    createMultipleTransactionRow(1),
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);

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
        created_at,
        updated_at,
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

  const isValidMultipleRow = row =>
    row.date &&
    row.type &&
    row.category &&
    row.amount &&
    (row.type === "transfer"
      ? row.withdrawAccount && row.depositAccount
      : row.paymentMethod);

  const multipleRowStatus = multipleRows.reduce(
    (status, row) => {
      const hasRequiredFields = isValidMultipleRow(row);

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

  const hasTransactionData = thisMonthTransactions.length > 0;

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

  const handleResetTransactionForm = () => {
    setTransactionForm(prev => ({
      ...initialTransactionForm,
      type: prev.type,
    }));

    setTransactionErrors({});
    setCopiedRecentId(null);
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

    // 입력값 검증
    const errors = validateTransactionForm(transactionForm);

    if (Object.keys(errors).length > 0) {
      setTransactionErrors(errors);
      return;
    }

    setTransactionErrors({});

    // 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    const attachment = transactionForm.attachment;

    if (attachment) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(attachment.type)) {
        setToastMessage("영수증은 JPG, PNG, WEBP 이미지만 등록할 수 있어요.");
        return;
      }

      if (attachment.size > maxSize) {
        setToastMessage("영수증 이미지는 5MB 이하만 등록할 수 있어요.");
        return;
      }
    }

    // transaction_at 생성
    const now = new Date();

    const [hour, minute] = transactionForm.time
      ? transactionForm.time.split(":").map(Number)
      : [now.getHours(), now.getMinutes()];

    const transactionDate = new Date(
      Number(transactionForm.date.slice(0, 4)),
      Number(transactionForm.date.slice(5, 7)) - 1,
      Number(transactionForm.date.slice(8, 10)),
      hour,
      minute,
      transactionForm.time ? 0 : now.getSeconds(),
    );

    // DB 저장값 구성
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
          ? Boolean(transactionForm.isRecurring)
          : false,

      recurring_day:
        transactionForm.type === "transfer" && transactionForm.isRecurring
          ? Number(transactionForm.recurringDay)
          : null,
    };

    // 거래 저장
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
          created_at,
          updated_at,
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

    // 저장 실패
    if (insertError) {
      console.error("소비 기록 저장 실패:", insertError);
      setToastMessage("소비 기록을 저장하지 못했어요.");
      return;
    }

    if (!insertedTransaction) {
      console.error("저장 결과가 반환되지 않았습니다.");
      setToastMessage("소비 기록 저장 결과를 확인하지 못했어요.");
      return;
    }

    // 영수증 첨부파일 저장
    if (attachment) {
      const extension =
        attachment.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = `receipt-${Date.now()}.${extension}`;

      const storagePath = `${user.id}/${insertedTransaction.id}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("transaction-attachments")
        .upload(storagePath, attachment, {
          contentType: attachment.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("영수증 Storage 업로드 실패:", uploadError);

        // 영수증까지 포함해서 하나의 저장 작업으로 취급
        const { error: rollbackTransactionError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", insertedTransaction.id)
          .eq("user_id", user.id);

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        setToastMessage("영수증 업로드에 실패해 거래 저장을 취소했어요.");
        return;
      }

      const { error: attachmentInsertError } = await supabase
        .from("transaction_attachments")
        .insert({
          transaction_id: insertedTransaction.id,
          storage_path: storagePath,
          file_name: attachment.name,
          mime_type: attachment.type,
        });

      if (attachmentInsertError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentInsertError);

        // DB 연결 실패 → 이미 올라간 Storage 파일 제거
        const { error: storageRemoveError } = await supabase.storage
          .from("transaction-attachments")
          .remove([storagePath]);

        if (storageRemoveError) {
          console.error("영수증 Storage 롤백 실패:", storageRemoveError);
        }

        const { error: rollbackTransactionError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", insertedTransaction.id)
          .eq("user_id", user.id);

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        setToastMessage("영수증 정보를 저장하지 못해 거래 저장을 취소했어요.");
        return;
      }

      console.log("영수증 저장 성공:", storagePath);
    }

    // 저장 성공
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
      prevRows.map(row => {
        if (row.id !== id) {
          return row;
        }

        // 이체 계좌 조합 선택
        if (name === "transferRoute") {
          if (!value) {
            return {
              ...row,
              withdrawAccount: "",
              depositAccount: "",
            };
          }

          const [withdrawAccount, depositAccount] = value.split("|");

          return {
            ...row,
            withdrawAccount,
            depositAccount,
          };
        }

        // 거래구분 변경
        if (name === "type") {
          return {
            ...row,
            type: value,
            category: "",
            paymentMethod: "",
            withdrawAccount: "",
            depositAccount: "",
          };
        }

        return {
          ...row,
          [name]: value,
        };
      }),
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
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      setToastMessage("저장할 수 있는 거래가 없어요.");
      return;
    }

    setIsMultipleConfirmOpen(true);
  };

  const handleConfirmMultipleSubmit = async () => {
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      setIsMultipleConfirmOpen(false);
      setToastMessage("저장할 수 있는 거래가 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setIsMultipleConfirmOpen(false);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    // 2. UI row → DB 저장 데이터 변환
    const transactionData = validRows.map(row => {
      const now = new Date();

      const [hour, minute] = row.time
        ? row.time.split(":").map(Number)
        : [now.getHours(), now.getMinutes()];

      const transactionDate = new Date(
        Number(row.date.slice(0, 4)),
        Number(row.date.slice(5, 7)) - 1,
        Number(row.date.slice(8, 10)),
        hour,
        minute,
        row.time ? 0 : now.getSeconds(),
      );

      return {
        user_id: user.id,
        transaction_type: row.type,
        amount: Number(row.amount),
        category_id: row.category,

        payment_method_id: row.type === "transfer" ? null : row.paymentMethod,

        withdraw_account_id:
          row.type === "transfer" ? row.withdrawAccount : null,

        deposit_account_id: row.type === "transfer" ? row.depositAccount : null,

        content: row.content.trim() || null,
        memo: row.memo.trim() || null,

        transaction_at: transactionDate.toISOString(),

        input_method: "manual",

        is_recurring: false,
        recurring_day: null,
      };
    });

    // 3. 다건 INSERT
    const { data: insertedTransactions, error: insertError } = await supabase
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
        created_at,
        updated_at,
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
      );

    if (insertError) {
      console.error("다건 소비 기록 저장 실패:", insertError);
      setIsMultipleConfirmOpen(false);
      setToastMessage("소비 기록을 저장하지 못했어요.");
      return;
    }

    // 4. DB 데이터 → 기존 UI 형식
    const newTransactions = (insertedTransactions ?? []).map(formatTransaction);

    // 5. 화면 즉시 반영
    setTransactions(prevTransactions => [
      ...newTransactions,
      ...prevTransactions,
    ]);

    // 6. 입력창 초기화
    setMultipleRows([
      createMultipleTransactionRow(1),
      createMultipleTransactionRow(2),
      createMultipleTransactionRow(3),
    ]);

    setIsMultipleConfirmOpen(false);
    setToastMessage(`${newTransactions.length}건의 소비 기록을 저장했어요.`);
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

    reader.onload = async () => {
      const imageDataUrl = reader.result;

      setAiPreview(imageDataUrl);
      setAiStatus("analyzing");

      const { data, error } = await supabase.functions.invoke(
        "analyze-receipt",
        {
          body: {
            imageDataUrl,
            transactionTypes: [
              { value: "income", label: "수입" },
              { value: "expense", label: "지출" },
              { value: "transfer", label: "이체" },
            ],
            categories: categories.map(category => ({
              name: category.name,
              transactionType: category.transaction_type,
            })),
            paymentMethods: paymentMethods.map(method => method.name),
          },
        },
      );

      console.log("AI 분석 data:", data);
      console.log("AI 분석 error:", error);

      if (error) {
        setAiStatus("idle");
        setToastMessage("AI 분석 요청을 보내지 못했어요.");
        return;
      }

      if (!data?.success || !data?.data) {
        setAiStatus("idle");
        setToastMessage(data?.message ?? "거래 정보를 인식하지 못했어요.");
        return;
      }

      const aiResult = data.data;

      const matchedCategory = categories.find(
        category =>
          category.name === aiResult.category &&
          category.transaction_type === aiResult.type,
      );

      const matchedPaymentMethod = paymentMethods.find(
        method => method.name === aiResult.paymentMethod,
      );

      setAiTransactionForm(prevForm => ({
        ...prevForm,
        type: aiResult.type ?? "",
        amount:
          aiResult.amount !== null && aiResult.amount !== undefined
            ? String(aiResult.amount)
            : "",
        category: matchedCategory?.id ?? "",
        date: aiResult.date ?? "",
        time: aiResult.time ?? "",
        paymentMethod:
          aiResult.type === "transfer" ? "" : (matchedPaymentMethod?.id ?? ""),
        content: aiResult.content ?? "",
        memo: aiResult.memo ?? "",
        receipt: prevForm.receipt,
      }));

      setAiTransactionErrors({});
      setAiStatus("success");
    };

    reader.readAsDataURL(file);
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
      await supabase
        .from("transaction_attachments")
        .select("id, storage_path, file_name, mime_type")
        .eq("transaction_id", selectedTransaction.id)
        .maybeSingle();

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
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", selectedTransaction.id)
      .eq("user_id", user.id)
      .select(
        `
        id,
        transaction_type,
        amount,
        content,
        memo,
        transaction_at,
        created_at,
        updated_at,
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
      const { error: uploadError } = await supabase.storage
        .from("transaction-attachments")
        .upload(newStoragePath, newAttachment, {
          contentType: newAttachment.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("새 영수증 업로드 실패:", uploadError);
        setToastMessage("새 영수증을 업로드하지 못했어요.");
        return;
      }

      let attachmentSaveError = null;

      // 기존 첨부가 있으면 metadata UPDATE
      if (existingAttachment) {
        const { error } = await supabase
          .from("transaction_attachments")
          .update({
            storage_path: newStoragePath,
            file_name: newAttachment.name,
            mime_type: newAttachment.type,
          })
          .eq("id", existingAttachment.id);

        attachmentSaveError = error;
      } else {
        // 기존 첨부가 없으면 INSERT
        const { error } = await supabase
          .from("transaction_attachments")
          .insert({
            transaction_id: selectedTransaction.id,
            storage_path: newStoragePath,
            file_name: newAttachment.name,
            mime_type: newAttachment.type,
          });

        attachmentSaveError = error;
      }

      // attachment DB 저장 실패 → 방금 올린 Storage 파일 롤백
      if (attachmentSaveError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentSaveError);

        const { error: rollbackStorageError } = await supabase.storage
          .from("transaction-attachments")
          .remove([newStoragePath]);

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
        const { error: oldStorageRemoveError } = await supabase.storage
          .from("transaction-attachments")
          .remove([existingAttachment.storage_path]);

        if (oldStorageRemoveError) {
          console.error(
            "기존 영수증 Storage 정리 실패:",
            oldStorageRemoveError,
          );
        }
      }

      // 새 영수증 상세화면용 signed URL 생성
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("transaction-attachments")
          .createSignedUrl(newStoragePath, 60 * 10);

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
        const { error: attachmentDeleteError } = await supabase
          .from("transaction_attachments")
          .delete()
          .eq("id", existingAttachment.id);

        if (attachmentDeleteError) {
          console.error("영수증 첨부정보 삭제 실패:", attachmentDeleteError);
          setToastMessage("영수증 정보를 삭제하지 못했어요.");
          return;
        }

        // Storage 실제 파일 제거
        if (existingAttachment.storage_path) {
          const { error: storageRemoveError } = await supabase.storage
            .from("transaction-attachments")
            .remove([existingAttachment.storage_path]);

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
    const { data: attachmentData, error: attachmentError } = await supabase
      .from("transaction_attachments")
      .select("storage_path")
      .eq("transaction_id", transaction.id)
      .maybeSingle();

    if (attachmentError) {
      console.error("영수증 첨부정보 조회 실패:", attachmentError);
    }

    let receiptImage = null;

    if (attachmentData?.storage_path) {
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("transaction-attachments")
          .createSignedUrl(attachmentData.storage_path, 60 * 10);

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
    const { data: attachmentData, error: attachmentError } = await supabase
      .from("transaction_attachments")
      .select("storage_path")
      .eq("transaction_id", selectedTransaction.id)
      .maybeSingle();

    if (attachmentError) {
      console.error("첨부파일 정보 조회 실패:", attachmentError);
      setToastMessage("첨부파일 정보를 확인하지 못했어요.");
      return;
    }

    // 3. Storage 파일이 있으면 먼저 삭제
    if (attachmentData?.storage_path) {
      const { error: storageDeleteError } = await supabase.storage
        .from("transaction-attachments")
        .remove([attachmentData.storage_path]);

      if (storageDeleteError) {
        console.error("영수증 Storage 삭제 실패:", storageDeleteError);
        setToastMessage("영수증 파일을 삭제하지 못했어요.");
        return;
      }
    }

    // 4. 거래 삭제
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", selectedTransaction.id)
      .eq("user_id", user.id);

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
                <button type="button" onClick={testAnalyzeReceipt}>
                  Edge Function 테스트
                </button>
              </header>

              <SummaryCards
                hasTransactionData={hasTransactionData}
                summaryData={summaryData}
              />
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
                  onResetTransactionForm: handleResetTransactionForm,
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
          setPanelView("entry");
        }}
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
