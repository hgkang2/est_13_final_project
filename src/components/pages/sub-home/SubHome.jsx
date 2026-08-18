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
    isLoading,
    isAiLoading,
    error,
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

  if (isLoading) {
    return (
      <>
        <div className={styles.page}>
          <Sidebar />

          <main className={styles.main}>
            <div className="container">
              <div
                className={styles.content}
                aria-busy="true"
                aria-label="서브홈 데이터를 불러오는 중"
              >
                {/* 인사 + 목표 */}
                <div className={styles.topRow}>
                  <div className={`${styles.greeting} ${styles.skeletonCard}`}>
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                      />
                    </div>
                  </div>

                  <div className={`${styles.goalCard} ${styles.skeletonCard}`}>
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonProgress}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 소비 요약 + AI */}
                <div className={styles.summaryRow}>
                  <div
                    className={`${styles.spendingSummaryCard} ${styles.skeletonCard}`}
                  >
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonChart}`}
                      />
                    </div>
                  </div>

                  <div className={`${styles.aiCard} ${styles.skeletonCard}`}>
                    <div className={styles.aiContent}>
                      <div
                        className={styles.skeletonTextGroup}
                        aria-hidden="true"
                      >
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonButton}`}
                        />
                      </div>

                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonCharacter}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* 미션 + 최근 거래 */}
                <div className={styles.missionRow}>
                  <div
                    className={`${styles.missionCard} ${styles.skeletonCard}`}
                  >
                    <div className={styles.missionContent}>
                      <div
                        className={styles.skeletonTextGroup}
                        aria-hidden="true"
                      >
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                        />
                        <div
                          className={`${styles.skeletonBlock} ${styles.skeletonButton}`}
                        />
                      </div>

                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonCharacter}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div
                    className={`${styles.recentCard} ${styles.skeletonCard}`}
                  >
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 저축 목표 + 챌린지 */}
                <div className={styles.statusRow}>
                  <div
                    className={`${styles.savingGoalCard} ${styles.skeletonCard}`}
                  >
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonProgress}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`${styles.challengeCard} ${styles.skeletonCard}`}
                  >
                    <div
                      className={styles.skeletonTextGroup}
                      aria-hidden="true"
                    >
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonCalendar}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 그림일기 */}
                <div className={`${styles.journalCard} ${styles.skeletonCard}`}>
                  <div className={styles.skeletonTextGroup} aria-hidden="true">
                    <div
                      className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
                    />

                    <div className={styles.skeletonJournalRow}>
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonJournal}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonJournal}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonJournal}`}
                      />
                      <div
                        className={`${styles.skeletonBlock} ${styles.skeletonJournal}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <SubFooter />
        <BottomTab />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.page}>
          <Sidebar />
          <main className={styles.main}>
            <div className="container">
              <div className={styles.content}>{error}</div>
            </div>
          </main>
        </div>
        <SubFooter />
        <BottomTab />
      </>
    );
  }

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
                  isLoading={isAiLoading}
                />
              </div>

              <div className={styles.missionRow}>
                <MissionCard
                  hasSpendingData={hasAiAnalysis}
                  recommendedMission={recommendedMission}
                  isLoading={isAiLoading}
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
