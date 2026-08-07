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

export default function SubHome() {
  // UI 개발용 상태값
  const userName = "Moa";
  const hasGoal = false;
  const hasSpendingData = false;
  const hasSavingGoal = false;
  const hasChallenge = false;
  const hasJournal = false;

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
                <RecentTransactionsCard hasSpendingData={hasSpendingData} />
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
