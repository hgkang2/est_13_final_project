"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./SubHome.module.scss";
import GreetingSection from "./components/GreetingSection";
import GoalCard from "./components/GoalCard";
import SpendingSummaryCard from "./components/SpendingSummaryCard";
import AiCard from "./components/AiCard";
import MissionCard from "./components/MissionCard";
import RecentTransactionsCard from "./components/RecentTransactionsCard";
import SavingGoalCard from "./components/SavingGoalCard";
import ChallengeCard from "./components/ChallengeCard";
import JournalCard from "./components/JournalCard";
import { useRouter } from "next/navigation";

export default function SubHome() {
  // UI 개발용 상태값
  const hasSpendingData = true;
  const hasChallenge = false;
  const hasJournal = false;

  const [userName, setUserName] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const hasRecentTransactions = recentTransactions.length > 0;
  const router = useRouter();
  const [goal, setGoal] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlySpendingDaily, setMonthlySpendingDaily] = useState([]);
  const [spendingComparison, setSpendingComparison] = useState(null);
  const [previousMonthlySpendingDaily, setPreviousMonthlySpendingDaily] =
    useState([]);
  const [savingGoal, setSavingGoal] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchRecentTransactions = async userId => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
      id,
      transaction_type,
      amount,
      content,
      transaction_at,
      category:categories (
        code,
        name
      )
    `,
        )
        .eq("user_id", userId)
        .order("transaction_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("최근 소비 내역 조회 실패:", error);
        return;
      }

      console.log("서브홈 최근 소비 내역:", data);

      setRecentTransactions(data ?? []);
    };

    const fetchGoal = async userId => {
      const { data, error } = await supabase
        .from("saving_goals")
        .select(
          "id, title, current_amount, target_amount, start_date, end_date, image_path",
        )
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .gte("end_date", new Date().toISOString().slice(0, 10))
        .order("end_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("서브홈 목표 조회 실패:", error);
        return;
      }

      if (!data) {
        setGoal(null);
        return;
      }

      let imageUrl = "";

      if (data.image_path) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from("user-images")
          .createSignedUrl(data.image_path, 60 * 60);

        if (imageError) {
          console.error("목표 이미지 조회 실패:", imageError);
        } else {
          imageUrl = imageData.signedUrl;
        }
      }

      setGoal({
        ...data,
        imageUrl,
      });
    };

    const fetchSavingGoal = async userId => {
      const { data, error } = await supabase
        .from("saving_goals")
        .select(
          "id, title, current_amount, target_amount, start_date, end_date",
        )
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .gte("end_date", new Date().toISOString().slice(0, 10))
        .order("end_date", { ascending: true })
        .range(1, 1)
        .maybeSingle();

      if (error) {
        console.error("서브홈 저축 목표 조회 실패:", error);
        return;
      }

      console.log("서브홈 저축 목표:", data);

      setSavingGoal(data);
    };

    const fetchMonthlySpending = async () => {
      const now = new Date();

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      ).toISOString();

      const { data, error } = await supabase.rpc("get_monthly_expense_total", {
        p_start_at: monthStart,
        p_end_at: nextMonthStart,
      });

      if (error) {
        console.error("이번 달 소비 합계 조회 실패:", error);
        return;
      }

      console.log("서브홈 이번 달 소비 합계:", data);

      setMonthlySpending(Number(data) || 0);
    };

    const fetchMonthlySpendingDaily = async () => {
      const now = new Date();

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      ).toISOString();

      const { data, error } = await supabase.rpc("get_monthly_expense_daily", {
        p_start_at: monthStart,
        p_end_at: nextMonthStart,
      });

      if (error) {
        console.error("이번 달 일별 소비 조회 실패:", error);
        return;
      }

      console.log("서브홈 이번 달 일별 소비:", data);

      setMonthlySpendingDaily(data ?? []);
    };

    const fetchPreviousMonthlySpendingDaily = async () => {
      const now = new Date();

      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const previousMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate() + 1,
      );

      const { data, error } = await supabase.rpc("get_monthly_expense_daily", {
        p_start_at: previousMonthStart.toISOString(),
        p_end_at: previousMonthEnd.toISOString(),
      });

      if (error) {
        console.error("지난달 일별 소비 조회 실패:", error);
        return;
      }

      console.log("서브홈 지난달 일별 소비:", data);

      setPreviousMonthlySpendingDaily(data ?? []);
    };

    const fetchSpendingComparison = async () => {
      const now = new Date();

      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const previousEnd = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate() + 1,
      );

      const { data, error } = await supabase.rpc(
        "get_monthly_expense_comparison",
        {
          p_current_start: currentStart.toISOString(),
          p_current_end: now.toISOString(),
          p_previous_start: previousStart.toISOString(),
          p_previous_end: previousEnd.toISOString(),
        },
      );

      if (error) {
        console.error("지난달 소비 비교 조회 실패:", error);
        return;
      }

      console.log("서브홈 지난달 소비 비교:", data);

      setSpendingComparison(data?.[0] ?? null);
    };

    const fetchUserProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("사용자 조회 실패:", userError);
        return;
      }

      fetchRecentTransactions(user.id);
      fetchGoal(user.id);
      fetchSavingGoal(user.id);
      fetchMonthlySpending();
      fetchMonthlySpendingDaily();
      fetchPreviousMonthlySpendingDaily();
      fetchSpendingComparison();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("프로필 조회 실패:", profileError);
        return;
      }

      console.log("서브홈 프로필:", profile);

      setUserName(profile.nickname);
    };

    fetchUserProfile();
  }, []);

  const handleMoveToTransaction = () => {
    router.push("/transaction");
  };

  const hasMonthlySpending = monthlySpending > 0;

  return (
    <>
      <div className={styles.page}>
        <Sidebar />

        <main className={styles.main}>
          <div className="container">
            <div className={styles.content}>
              <div className={styles.topRow}>
                <GreetingSection userName={userName} />
                <GoalCard hasGoal={Boolean(goal)} goal={goal} />
              </div>

              <div className={styles.summaryRow}>
                <SpendingSummaryCard
                  hasSpendingData={hasMonthlySpending}
                  monthlySpending={monthlySpending}
                  monthlySpendingDaily={monthlySpendingDaily}
                  previousMonthlySpendingDaily={previousMonthlySpendingDaily}
                  spendingComparison={spendingComparison}
                />
                <AiCard hasSpendingData={hasSpendingData} />
              </div>

              <div className={styles.missionRow}>
                <MissionCard hasSpendingData={hasSpendingData} />
                <RecentTransactionsCard
                  hasSpendingData={hasRecentTransactions}
                  recentTransactions={recentTransactions}
                  onMoreClick={handleMoveToTransaction}
                />
              </div>

              <div className={styles.statusRow}>
                <SavingGoalCard
                  hasSavingGoal={Boolean(savingGoal)}
                  savingGoal={savingGoal}
                />
                <ChallengeCard hasChallenge={hasChallenge} />
              </div>

              <JournalCard hasJournal={hasJournal} />
            </div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
