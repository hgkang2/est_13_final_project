import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";
import { formatTransaction } from "../utils/transactionFormatter";

// 날짜 초기값
const getCurrentMonthRange = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  const startDate = [year, String(month + 1).padStart(2, "0"), "01"].join("-");

  const lastDay = new Date(year, month + 1, 0).getDate();

  const endDate = [
    year,
    String(month + 1).padStart(2, "0"),
    String(lastDay).padStart(2, "0"),
  ].join("-");

  return {
    startDate,
    endDate,
  };
};

// 사용자 거래 목록 조회와 상태 관리
export const useTransactions = (supabase, showToast) => {
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsTransactionsLoading(true);

      // 1. 로그인 사용자 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("사용자 확인 실패:", userError);
        showToast("로그인 정보를 확인할 수 없어요.", "error");
        setIsTransactionsLoading(false);
        return;
      }

      // 2. 거래 목록 조회
      const { data, error } = await fetchTransactions(supabase, user.id);

      if (error) {
        console.error("소비 기록 조회 실패:", error);
        showToast("소비 기록을 불러오지 못했어요.", "error");
        setIsTransactionsLoading(false);
        return;
      }

      // 3. DB 데이터 → 현재 UI 형식으로 변환
      const formattedTransactions = (data ?? []).map(formatTransaction);

      setTransactions(formattedTransactions);
      setIsTransactionsLoading(false);

      console.log("소비 기록 조회 성공:", formattedTransactions);
    };

    loadTransactions();
  }, []);

  const visibleTransactions = transactions.filter(transaction => {
    const matchesType =
      activeFilter === "all" || transaction.type === activeFilter;

    const matchesDate =
      transaction.dateValue >= dateRange.startDate &&
      transaction.dateValue <= dateRange.endDate;

    return matchesType && matchesDate;
  });

  const hasTransactionData = visibleTransactions.length > 0;

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

  const handleDateRangeChange = event => {
    const { name, value } = event.target;

    setDateRange(prevRange => ({
      ...prevRange,
      [name]: value,
    }));
  };

  return {
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
  };
};
