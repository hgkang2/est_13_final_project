import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";
import { formatTransaction } from "../utils/transactionFormatter";

// 사용자 거래 목록 조회와 상태 관리
export const useTransactions = supabase => {
  const [transactions, setTransactions] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

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
        setIsTransactionsLoading(false);
        return;
      }

      // 2. 거래 목록 조회
      const { data, error } = await fetchTransactions(supabase, user.id);

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

    loadTransactions();
  }, []);

  return {
    transactions,
    setTransactions,
    isTransactionsLoading,
  };
};
