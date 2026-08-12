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
  const hasGoal = false;
  const hasSpendingData = true;
  const hasSavingGoal = false;
  const hasChallenge = false;
  const hasJournal = false;

  const [userName, setUserName] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const hasRecentTransactions = recentTransactions.length > 0;
  const router = useRouter();

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

  return (
    <>
      <div className={styles.page}>
        <Sidebar />

        <main className={styles.main}>
          <div className="container">
            <div className={styles.content}>
              <div className={styles.topRow}>
                <GreetingSection userName={userName} />
                <GoalCard hasGoal={hasGoal} />
              </div>

              <div className={styles.summaryRow}>
                <SpendingSummaryCard hasSpendingData={hasSpendingData} />
                <AiCard hasSpendingData={hasSpendingData} />
              </div>

              <div className={styles.missionRow}>
                <MissionCard hasSpendingData={hasSpendingData} />
                <RecentTransactionsCard
                  hasSpendingData={recentTransactions.length > 0}
                  recentTransactions={recentTransactions}
                  onMoreClick={handleMoveToTransaction}
                />
              </div>

              <div className={styles.statusRow}>
                <SavingGoalCard hasSavingGoal={hasSavingGoal} />
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
