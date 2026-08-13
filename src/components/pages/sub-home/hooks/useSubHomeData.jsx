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

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const fetchSubHomeData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("사용자 조회 실패:", userError);
        return;
      }

      const [
        recentTransactionsData,
        goalData,
        savingGoalData,
        monthlySpendingData,
        monthlySpendingDailyData,
        previousMonthlySpendingDailyData,
        spendingComparisonData,
        aiData,
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
        getAiAnalysis(supabase),
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

      setAiAnalysis(aiData.analysis);
      setRecommendedMission(aiData.recommendedMission);

      setUserName(profileData?.nickname ?? "");
      setWeeklyJournals(weeklyJournalsData);
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
  };
}
