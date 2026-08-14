"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getRecentTransactions,
  getGoal,
  getSavingGoal,
  getMonthlySpending,
  getMonthlySpendingDaily,
  getPreviousMonthlySpendingDaily,
  getSpendingComparison,
  getAiAnalysis,
  getUserProfile,
  getWeeklyJournals,
} from "../services/subHomeService";

export default function useSubHomeData() {
  const [userName, setUserName] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [goal, setGoal] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlySpendingDaily, setMonthlySpendingDaily] = useState([]);
  const [previousMonthlySpendingDaily, setPreviousMonthlySpendingDaily] =
    useState([]);
  const [spendingComparison, setSpendingComparison] = useState(null);
  const [savingGoal, setSavingGoal] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [recommendedMission, setRecommendedMission] = useState(null);
  const [weeklyJournals, setWeeklyJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const fetchSubHomeData = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("사용자 조회 실패:", userError);
        if (isMounted) {
          setError("사용자 정보를 불러오지 못했습니다.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const [
          recentTransactionsData,
          goalData,
          savingGoalData,
          monthlySpendingData,
          monthlySpendingDailyData,
          previousMonthlySpendingDailyData,
          spendingComparisonData,
          profileData,
          weeklyJournalsData,
        ] = await Promise.all([
          getRecentTransactions(supabase, user.id),
          getGoal(supabase, user.id),
          getSavingGoal(supabase, user.id),
          getMonthlySpending(supabase),
          getMonthlySpendingDaily(supabase),
          getPreviousMonthlySpendingDaily(supabase),
          getSpendingComparison(supabase),
          getUserProfile(supabase, user.id),
          getWeeklyJournals(supabase, user.id),
        ]);

        if (!isMounted) return;

        setRecentTransactions(recentTransactionsData);
        setGoal(goalData);
        setSavingGoal(savingGoalData);
        setMonthlySpending(monthlySpendingData);
        setMonthlySpendingDaily(monthlySpendingDailyData);
        setPreviousMonthlySpendingDaily(previousMonthlySpendingDailyData);
        setSpendingComparison(spendingComparisonData);
        setUserName(profileData?.nickname ?? "");
        setWeeklyJournals(weeklyJournalsData);
        setIsLoading(false);

        // 현재는 서브홈 핵심 데이터 조회 후 AI 분석을 별도 호출
        // 소비기록 연동 후 분석 갱신 시점을 소비기록 저장 시점으로 변경 예정
        setIsAiLoading(true);
        try {
          const aiData = await getAiAnalysis(supabase);
          if (!isMounted) return;
          setAiAnalysis(aiData.analysis);
          setRecommendedMission(aiData.recommendedMission);
        } catch (aiError) {
          console.error("AI 분석 실패:", aiError);
        } finally {
          if (isMounted) {
            setIsAiLoading(false);
          }
        }
      } catch (err) {
        console.error("서브홈 데이터 조회 실패:", err);
        if (isMounted) {
          setError("데이터를 불러오지 못했습니다.");
          setIsLoading(false);
        }
      }
    };

    fetchSubHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    userName,
    recentTransactions,
    goal,
    monthlySpending,
    monthlySpendingDaily,
    previousMonthlySpendingDaily,
    spendingComparison,
    savingGoal,
    aiAnalysis,
    recommendedMission,
    weeklyJournals,
    isLoading,
    isAiLoading,
    error,
  };
}
