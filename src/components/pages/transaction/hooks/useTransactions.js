import { useEffect, useRef, useState } from "react";
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
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadedTransactionCount, setLoadedTransactionCount] = useState(0);
  const [transactionTotalCount, setTransactionTotalCount] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailFilters, setDetailFilters] = useState({
    category: "",
    paymentMethod: "",
    hasReceipt: false,
    keyword: "",
  });
  const listRequestIdRef = useRef(0);
  const isListRequestPendingRef = useRef(false);
  const isLoadingMoreRef = useRef(false);

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
    let ignore = false;

    const requestId = ++listRequestIdRef.current;
    isListRequestPendingRef.current = true;

    const loadTransactions = async () => {
      setIsTransactionsLoading(true);

      // 1. 로그인 사용자 확인
      const user = await getCurrentUser();

      if (ignore || requestId !== listRequestIdRef.current) return;

      if (!user) {
        isListRequestPendingRef.current = false;
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
          detailFilters,
        ),
        fetchRecentTransactions(supabase, user.id),
      ]);

      // 이전 요청이면 화면 반영하지 않음
      if (ignore || requestId !== listRequestIdRef.current) return;

      if (transactionError) {
        console.error("소비 기록 조회 실패:", transactionError);
        showToast("소비 기록을 불러오지 못했어요.", "error");
        isListRequestPendingRef.current = false;
        setIsTransactionsLoading(false);
        return;
      }

      if (recentError) {
        console.error("최근 소비 기록 조회 실패:", recentError);
        showToast("최근 소비 기록을 불러오지 못했어요.", "error");
        isListRequestPendingRef.current = false;
        setIsTransactionsLoading(false);
        return;
      }

      // 3. 기간 거래 / 최근 입력 거래 각각 UI 형식으로 변환
      const formattedTransactions = (transactionData ?? []).map(
        formatTransaction,
      );

      const formattedRecentTransactions = (recentData ?? []).map(
        formatTransaction,
      );

      setTransactions(formattedTransactions);
      setRecentTransactions(formattedRecentTransactions);
      setLoadedTransactionCount((transactionData ?? []).length);
      setTransactionTotalCount(transactionCount ?? 0);
      isListRequestPendingRef.current = false;
      setIsTransactionsLoading(false);
    };

    loadTransactions();

    return () => {
      ignore = true;
    };
  }, [dateRange.startDate, dateRange.endDate, activeFilter, detailFilters]);

  const refreshMonthlySummary = async () => {
    const { data, error } = await fetchTransactionMonthlySummary(supabase);

    if (error) {
      console.error("소비 기록 요약 조회 실패:", error);
      showToast("소비 기록 요약을 불러오지 못했어요.", "error");
      setIsSummaryLoading(false);
      return;
    }

    setMonthlySummary(data);
    setIsSummaryLoading(false);
  };

  // 최근 입력 거래 다시 조회
  const refreshRecentTransactions = async () => {
    const user = await getCurrentUser();

    if (!user) return;

    const { data, error } = await fetchRecentTransactions(supabase, user.id);

    if (error) {
      console.error("최근 소비 기록 조회 실패:", error);
      showToast("최근 소비 기록을 불러오지 못했어요.", "error");
      return;
    }

    const formattedRecentTransactions = (data ?? []).map(formatTransaction);

    setRecentTransactions(formattedRecentTransactions);

    return formattedRecentTransactions;
  };

  // CRUD 후 현재까지 불러온 거래 목록 다시 맞추기
  const refreshTransactions = async () => {
    const requestId = ++listRequestIdRef.current;
    isListRequestPendingRef.current = true;

    const user = await getCurrentUser();

    if (requestId !== listRequestIdRef.current) return;

    if (!user) {
      isListRequestPendingRef.current = false;
      setIsTransactionsLoading(false);
      return;
    }

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
      detailFilters,
    );

    // refresh 시작 후 다른 목록 요청이 시작됐다면 결과 폐기
    if (requestId !== listRequestIdRef.current) return;

    if (transactionError) {
      console.error("거래 목록 새로고침 실패:", transactionError);
      showToast("거래 목록을 새로고침하지 못했어요.", "error");
      isListRequestPendingRef.current = false;
      setIsTransactionsLoading(false);
      return;
    }

    const formattedTransactions = (transactionData ?? []).map(
      formatTransaction,
    );

    setTransactions(formattedTransactions);
    setLoadedTransactionCount((transactionData ?? []).length);
    setTransactionTotalCount(transactionCount ?? 0);

    isListRequestPendingRef.current = false;
    setIsTransactionsLoading(false);

    return formattedTransactions;
  };

  const loadMoreTransactions = async () => {
    // 전체 목록 조회 중이거나 이미 더보기 중이면 새 요청 시작하지 않음
    if (isListRequestPendingRef.current || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    // 더보기 시작 당시의 현재 목록 요청 버전
    const requestId = listRequestIdRef.current;

    try {
      const user = await getCurrentUser();

      if (!user || requestId !== listRequestIdRef.current) return;

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
        detailFilters,
      );

      // 기다리는 동안 필터 변경/refresh가 시작됐다면 옛 결과 폐기
      if (requestId !== listRequestIdRef.current) return;

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

      setLoadedTransactionCount(
        prevCount => prevCount + newTransactions.length,
      );

      setTransactionTotalCount(prevCount => count ?? prevCount);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
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

    if (!value) return;

    setSelectedIds([]);

    setDateRange(prevRange => {
      // 시작일이 종료일보다 뒤로 가면 종료일도 시작일에 맞춤
      if (name === "startDate" && value > prevRange.endDate) {
        return {
          startDate: value,
          endDate: value,
        };
      }

      // 종료일이 시작일보다 앞으로 가면 시작일도 종료일에 맞춤
      if (name === "endDate" && value < prevRange.startDate) {
        return {
          startDate: value,
          endDate: value,
        };
      }

      return {
        ...prevRange,
        [name]: value,
      };
    });
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

  const handleDetailFilterApply = nextFilters => {
    setSelectedIds([]);

    setDetailFilters({
      category: nextFilters.category ?? "",
      paymentMethod: nextFilters.paymentMethod ?? "",
      hasReceipt: Boolean(nextFilters.hasReceipt),
      keyword: nextFilters.keyword?.trim() ?? "",
    });
  };

  return {
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
    isLoadingMore,
    activeFilter,
    setActiveFilter,
    detailFilters,
    handleDetailFilterApply,
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
