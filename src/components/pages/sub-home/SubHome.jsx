"use client";

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
import useSubHomeData from "./hooks/useSubHomeData";

export default function SubHome() {
  // UI 개발용 상태값 [챌린지와, 목표연동은 소비기록과 각 다른 페이지 연동이 필요함]
  const hasChallenge = false;

  const {
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
  } = useSubHomeData();

  const router = useRouter();

  const handleMoveToTransaction = () => {
    router.push("/transaction");
  };

  const hasRecentTransactions = recentTransactions.length > 0;
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
