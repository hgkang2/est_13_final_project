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
  const hasChallenge = false;

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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [recommendedMission, setRecommendedMission] = useState(null);
  const [weeklyJournals, setWeeklyJournals] = useState([]);

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

    const fetchAiAnalysis = async () => {
      const now = new Date();

      const periodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      });

      const periodEnd = now.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      });

      const { data, error } = await supabase.functions.invoke(
        "analyze-spending",
        {
          body: {
            analysisType: "monthly",
            periodStart,
            periodEnd,
          },
        },
      );

      if (error) {
        console.error("AI 소비 분석 조회 실패:", error);
        return;
      }

      if (!data?.success) {
        console.log("AI 소비 분석 미생성:", data);
        setAiAnalysis(null);
        return;
      }

      console.log("서브홈 AI 소비 분석:", data);

      setAiAnalysis(data.analysis ?? null);
      setRecommendedMission(data.recommendedMission ?? null);
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
      fetchAiAnalysis();
      fetchWeeklyJournals(user.id);

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

    const fetchWeeklyJournals = async userId => {
      const now = new Date();

      const weekStart = new Date(now);
      const day = weekStart.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;

      weekStart.setDate(weekStart.getDate() - diffToMonday);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // 이번 주 실제 지출 조회
      const { data: transactions, error: transactionError } = await supabase
        .from("transactions")
        .select(
          `
      id,
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
        .eq("transaction_type", "expense")
        .gte("transaction_at", weekStart.toISOString())
        .lt("transaction_at", weekEnd.toISOString())
        .order("transaction_at", { ascending: true });

      if (transactionError) {
        console.error("주간 소비 조회 실패:", transactionError);
        return;
      }

      const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

      // 실제 소비가 있는 날짜만 journals 저장용 데이터 생성
      const journalRows = [];

      for (let index = 0; index < 7; index += 1) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);

        const dateKey = date.toLocaleDateString("sv-SE", {
          timeZone: "Asia/Seoul",
        });

        const dailyTransactions = (transactions ?? []).filter(transaction => {
          const transactionDate = new Date(
            transaction.transaction_at,
          ).toLocaleDateString("sv-SE", {
            timeZone: "Asia/Seoul",
          });

          return transactionDate === dateKey;
        });

        if (dailyTransactions.length === 0) continue;

        const totalAmount = dailyTransactions.reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          0,
        );

        // 그날 가장 큰 소비를 대표 소비로 사용
        const representative = [...dailyTransactions].sort(
          (a, b) => Number(b.amount) - Number(a.amount),
        )[0];

        const categoryCode = representative.category?.code;

        if (!categoryCode) continue;

        journalRows.push({
          user_id: userId,
          journal_date: dateKey,
          amount: totalAmount,
          image_path: `journal/${categoryCode}.png`,
          content:
            representative.content ||
            representative.category?.name ||
            "오늘의 소비 기록",
        });
      }

      // 소비가 있었던 날짜의 그림일기 저장/갱신
      if (journalRows.length > 0) {
        const { error: journalError } = await supabase
          .from("journals")
          .upsert(journalRows, {
            onConflict: "user_id,journal_date",
          });

        if (journalError) {
          console.error("그림일기 저장 실패:", journalError);
          return;
        }
      }

      // 이번 주 저장된 그림일기 조회
      const { data: savedJournals, error: savedJournalError } = await supabase
        .from("journals")
        .select("id, journal_date, amount, image_path, content")
        .eq("user_id", userId)
        .gte(
          "journal_date",
          weekStart.toLocaleDateString("sv-SE", {
            timeZone: "Asia/Seoul",
          }),
        )
        .lt(
          "journal_date",
          weekEnd.toLocaleDateString("sv-SE", {
            timeZone: "Asia/Seoul",
          }),
        )
        .order("journal_date", { ascending: true });

      if (savedJournalError) {
        console.error("그림일기 조회 실패:", savedJournalError);
        return;
      }

      // 월~일 7칸 생성
      const journals = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);

        const dateKey = date.toLocaleDateString("sv-SE", {
          timeZone: "Asia/Seoul",
        });

        const savedJournal = (savedJournals ?? []).find(
          journal => journal.journal_date === dateKey,
        );

        if (savedJournal) {
          const { data: imageData } = supabase.storage
            .from("public-assets")
            .getPublicUrl(savedJournal.image_path);

          return {
            id: savedJournal.id,
            date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
            amount: `-${Number(savedJournal.amount).toLocaleString()}원`,
            image: imageData.publicUrl,
            content: savedJournal.content,
            pending: false,
          };
        }

        const { data: emptyImageData } = supabase.storage
          .from("public-assets")
          .getPublicUrl("journal/journal_empty.png");

        return {
          id: dateKey,
          date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
          amount: "--원",
          image: emptyImageData.publicUrl,
          content:
            date > now ? "오늘도 실천이 기대돼요!" : "소비 기록이 없어요.",
          pending: true,
        };
      });

      console.log("서브홈 그림일기:", journals);

      setWeeklyJournals(journals);
    };
  }, []);

  const handleMoveToTransaction = () => {
    router.push("/transaction");
  };

  const hasMonthlySpending = monthlySpending > 0;
  const hasAiAnalysis = Boolean(aiAnalysis);

  const comparison = aiAnalysis?.calculatedData?.comparison;

  const isOverspending =
    comparison?.available === true && comparison?.expenseChangePercent >= 10;

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
                <AiCard
                  hasSpendingData={hasAiAnalysis}
                  aiAnalysis={aiAnalysis}
                  isOverspending={isOverspending}
                />
              </div>

              <div className={styles.missionRow}>
                <MissionCard
                  hasSpendingData={hasAiAnalysis}
                  recommendedMission={recommendedMission}
                />
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

              <JournalCard journals={weeklyJournals} />
            </div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
