import { useEffect, useState } from "react";
import {
  fetchTransactions,
  fetchRecentTransactions,
  fetchTransactionMonthlySummary,
} from "../services/transactionService";
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

const INITIAL_TRANSACTION_COUNT = 8;
const LOAD_MORE_COUNT = 20;

// 사용자 거래 목록 조회와 상태 관리
export const useTransactions = (supabase, showToast) => {
  const [transactions, setTransactions] = useState([]);
  const [loadedTransactionCount, setLoadedTransactionCount] = useState(0);
  const [transactionTotalCount, setTransactionTotalCount] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const [selectedIds, setSelectedIds] = useState([]);

  // 로그인 사용자 확인
  const getCurrentUser = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      showToast("로그인 정보를 확인할 수 없어요.", "error");
      return null;
    }

    return user;
  };

  useEffect(() => {
    const loadTransactions = async () => {
      setIsTransactionsLoading(true);
      // 1. 로그인 사용자 확인
      const user = await getCurrentUser();

      if (!user) {
        setIsTransactionsLoading(false);
        return;
      }

      // 2. 거래 목록 조회
      const [
        {
          data: transactionData,
          error: transactionError,
          count: transactionCount,
        },
        { data: recentData, error: recentError },
      ] = await Promise.all([
        fetchTransactions(
          supabase,
          user.id,
          dateRange.startDate,
          dateRange.endDate,
          activeFilter,
          0,
          INITIAL_TRANSACTION_COUNT - 1,
        ),
        fetchRecentTransactions(supabase, user.id),
      ]);

      if (transactionError) {
        console.error("소비 기록 조회 실패:", transactionError);
        showToast("소비 기록을 불러오지 못했어요.", "error");
        setIsTransactionsLoading(false);
        return;
      }

      if (recentError) {
        console.error("최근 소비 기록 조회 실패:", recentError);
        showToast("최근 소비 기록을 불러오지 못했어요.", "error");
        setIsTransactionsLoading(false);
        return;
      }

      // 3. 기간 거래 + 최근 거래 중복 제거
      const transactionMap = new Map();

      (transactionData ?? []).forEach(transaction => {
        transactionMap.set(transaction.id, transaction);
      });

      (recentData ?? []).forEach(transaction => {
        transactionMap.set(transaction.id, transaction);
      });

      const formattedTransactions = [...transactionMap.values()]
        .sort(
          (a, b) =>
            new Date(b.transaction_at).getTime() -
            new Date(a.transaction_at).getTime(),
        )
        .map(formatTransaction);

      setTransactions(formattedTransactions);

      // 4. 이번 달 거래 요약 조회
      // const { data: monthlySummaryData, error: monthlySummaryError } =
      //   await fetchTransactionMonthlySummary(supabase);

      // if (monthlySummaryError) {
      //   console.error("소비 기록 요약 조회 실패:", monthlySummaryError);
      //   showToast("소비 기록 요약을 불러오지 못했어요.", "error");
      // } else {
      //   setMonthlySummary(monthlySummaryData);
      //   console.log("소비 기록 요약 조회 성공:", monthlySummaryData);
      // }
      setLoadedTransactionCount((transactionData ?? []).length);
      setTransactionTotalCount(transactionCount ?? 0);

      setIsTransactionsLoading(false);

      console.log("소비 기록 조회 성공:", formattedTransactions);
    };

    loadTransactions();
  }, [dateRange.startDate, dateRange.endDate, activeFilter]);

  const refreshMonthlySummary = async () => {
    const { data, error } = await fetchTransactionMonthlySummary(supabase);

    if (error) {
      console.error("소비 기록 요약 조회 실패:", error);
      showToast("소비 기록 요약을 불러오지 못했어요.", "error");
      return;
    }

    setMonthlySummary(data);

    console.log("소비 기록 요약 조회 성공:", data);
  };

  // CRUD 후 현재까지 불러온 거래 목록 다시 맞추기
  const refreshTransactions = async () => {
    const user = await getCurrentUser();

    if (!user) return;

    const refreshCount = Math.max(
      loadedTransactionCount,
      INITIAL_TRANSACTION_COUNT,
    );

    const {
      data: transactionData,
      error: transactionError,
      count: transactionCount,
    } = await fetchTransactions(
      supabase,
      user.id,
      dateRange.startDate,
      dateRange.endDate,
      activeFilter,
      0,
      refreshCount - 1,
    );

    if (transactionError) {
      console.error("거래 목록 새로고침 실패:", transactionError);
      showToast("거래 목록을 새로고침하지 못했어요.", "error");
      return;
    }

    const formattedTransactions = (transactionData ?? []).map(
      formatTransaction,
    );

    setTransactions(formattedTransactions);
    setLoadedTransactionCount((transactionData ?? []).length);
    setTransactionTotalCount(transactionCount ?? 0);

    return formattedTransactions;
  };

  const loadMoreTransactions = async () => {
    const user = await getCurrentUser();

    if (!user) return;
    const from = loadedTransactionCount;
    const to = from + LOAD_MORE_COUNT - 1;

    const { data, error, count } = await fetchTransactions(
      supabase,
      user.id,
      dateRange.startDate,
      dateRange.endDate,
      activeFilter,
      from,
      to,
    );

    if (error) {
      console.error("추가 소비 기록 조회 실패:", error);
      showToast("추가 소비 기록을 불러오지 못했어요.", "error");
      return;
    }

    const newTransactions = (data ?? []).map(formatTransaction);

    setTransactions(prevTransactions => [
      ...prevTransactions,
      ...newTransactions,
    ]);

    setLoadedTransactionCount(prevCount => prevCount + newTransactions.length);

    setTransactionTotalCount(count ?? transactionTotalCount);
  };

  useEffect(() => {
    refreshMonthlySummary();
  }, []);

  const visibleTransactions = transactions.filter(transaction => {
    const matchesType =
      activeFilter === "all" || transaction.type === activeFilter;

    const matchesDate =
      transaction.dateValue >= dateRange.startDate &&
      transaction.dateValue <= dateRange.endDate;

    return matchesType && matchesDate;
  });

  const hasMoreTransactions = loadedTransactionCount < transactionTotalCount;

  const hasTransactionData = visibleTransactions.length > 0;

  const currentMonthRange = getCurrentMonthRange();

  const isCurrentMonthRange =
    dateRange.startDate === currentMonthRange.startDate &&
    dateRange.endDate === currentMonthRange.endDate;

  const handleToggleTransaction = id => {
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter(selectedId => selectedId !== id)
        : [...prevSelectedIds, id],
    );
  };

  const handleToggleAll = targetIds => {
    if (!targetIds?.length) return;

    setSelectedIds(prevSelectedIds => {
      const areAllSelected = targetIds.every(id =>
        prevSelectedIds.includes(id),
      );

      if (areAllSelected) {
        return prevSelectedIds.filter(id => !targetIds.includes(id));
      }

      return [...new Set([...prevSelectedIds, ...targetIds])];
    });
  };

  const handleDateRangeChange = event => {
    const { name, value } = event.target;

    setSelectedIds([]);

    setDateRange(prevRange => ({
      ...prevRange,
      [name]: value,
    }));
  };

  // 저장한 거래 날짜만 보기
  const handleMoveToDate = dateValue => {
    if (!dateValue) return;

    setSelectedIds([]);

    setDateRange({
      startDate: dateValue,
      endDate: dateValue,
    });
  };

  // 이번 달 전체로 돌아오기
  const handleMoveToCurrentMonth = () => {
    setSelectedIds([]);
    setDateRange(getCurrentMonthRange());
  };

  return {
    transactions,
    setTransactions,
    monthlySummary,
    refreshMonthlySummary,
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
  };
};
