"use client";

import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./SubHome.module.scss";
import JournalSlider from "@/components/common/JournalSlider";
import GreetingSection from "./components/GreetingSection";
import GoalCard from "./components/GoalCard";
import SpendingSummaryCard from "./components/SpendingSummaryCard";
import AiCard from "./components/AiCard";
import MissionCard from "./components/MissionCard";
import RecentTransactionsCard from "./components/RecentTransactionsCard";

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
                <article
                  className={styles.savingGoalCard}
                  aria-labelledby="saving-goal-title"
                >
                  <div className={styles.cardInner}>
                    <header className={styles.cardHeader}>
                      <h2 id="saving-goal-title">저축 목표</h2>

                      <button type="button" className={styles.moreButton}>
                        <span>목표 관리로 이동</span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </header>

                    {hasSavingGoal ? (
                      <>
                        <div className={styles.savingGoalBody}>
                          <div className={styles.goalTitleRow}>
                            <h3>여름 여행 자금 모으기</h3>
                            <span className={styles.dDayBadge}>D-7</span>
                          </div>

                          <div className={styles.goalAmountRow}>
                            <strong>1,950,000원</strong>
                            <span>/ 3,000,000원</span>
                          </div>

                          <div className={styles.goalProgressRow}>
                            <div
                              className={styles.goalProgressTrack}
                              role="progressbar"
                              aria-label="여름 여행 자금 목표 달성률"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-valuenow="65"
                            >
                              <div className={styles.goalProgressFill} />
                            </div>

                            <span className={styles.goalProgressValue}>
                              65%
                            </span>
                          </div>

                          <p className={styles.goalSchedule}>
                            현재 저축 속도로는 목표보다 <strong>13</strong>일
                            늦어질 예정이에요.
                          </p>
                        </div>

                        <div className={styles.goalNotice}>
                          <span className="material-icons" aria-hidden="true">
                            report
                          </span>

                          <p>
                            하루 150,000원씩 저축하면 목표를 달성할 수 있어요.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`${styles.savingGoalBody} ${styles.emptySavingGoalBody}`}
                        >
                          <div className={styles.savingGoalEmptyText}>
                            <p>아직 설정한 저축 목표가 없어요.</p>
                            <span>목표를 설정하면 달성률을 보여드릴게요.</span>
                          </div>

                          <div
                            className={styles.savingGoalBadges}
                            aria-label="저축 목표 예시"
                          >
                            <span>여행</span>
                            <span>비상금</span>
                            <span>자유 목표</span>
                            <span>&middot; &middot; &middot;</span>
                          </div>

                          <div className={styles.goalProgressRow}>
                            <div
                              className={styles.goalProgressTrack}
                              role="progressbar"
                              aria-label="저축 목표 달성률"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-valuenow="0"
                            />

                            <span
                              className={`${styles.goalProgressValue} ${styles.emptyGoalProgressValue}`}
                            >
                              0%
                            </span>
                          </div>
                        </div>

                        <div
                          className={`${styles.goalNotice} ${styles.emptyGoalNotice}`}
                        >
                          <span className="material-icons" aria-hidden="true">
                            report
                          </span>

                          <p>
                            목표를 만들면 목표 달성률과 예상 달성일을 확인할 수
                            있어요.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </article>

                <article
                  className={styles.challengeCard}
                  aria-labelledby="challenge-title"
                >
                  <div className={styles.cardInner}>
                    <header className={styles.cardHeader}>
                      <h2 id="challenge-title">챌린지 현황</h2>

                      <button type="button" className={styles.moreButton}>
                        <span>챌린지로 이동</span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </header>

                    <div className={styles.challengeBody}>
                      <div className={styles.challengeSummary}>
                        <h3>7일 소비 챌린지</h3>

                        {hasChallenge && <strong>6일째 진행 중!</strong>}
                      </div>

                      <div className={styles.challengeCalendar}>
                        <div className={styles.challengeWeekdays}>
                          {["월", "화", "수", "목", "금", "토", "일"].map(
                            day => (
                              <span key={day}>{day}</span>
                            ),
                          )}
                        </div>

                        <div className={styles.challengeDays}>
                          {[1, 2, 3, 4, 5, 6, 7].map(day => {
                            const isCompleted = hasChallenge && day < 7;
                            const isCurrent = hasChallenge && day === 6;

                            return (
                              <div key={day} className={styles.challengeDay}>
                                <div
                                  className={`${styles.challengeIcon} ${
                                    isCurrent ? styles.currentChallengeIcon : ""
                                  } ${!isCompleted ? styles.inactiveChallengeIcon : ""}`}
                                >
                                  <Image
                                    src="/images/challenge/sprout.png"
                                    alt=""
                                    width={40}
                                    height={40}
                                    aria-hidden="true"
                                  />
                                </div>

                                <span>{day}일차</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <p className={styles.challengeMessage}>
                        {hasChallenge
                          ? "하루만 더 성공하면 7일 달성!"
                          : "챌린지를 시작하면 매일 새싹 스탬프가 채워져요."}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              <article
                className={styles.journalCard}
                aria-labelledby="journal-card-title"
              >
                <div className={styles.journalInner}>
                  <header className={styles.journalHeader}>
                    <div className={styles.journalTitleGroup}>
                      <h2 id="journal-card-title">
                        이번 주 소비 절약 그림일기
                      </h2>
                    </div>

                    {hasJournal && (
                      <button type="button" className={styles.moreButton}>
                        <span>그림일기로 이동</span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    )}
                  </header>

                  {hasJournal ? (
                    <JournalSlider />
                  ) : (
                    <div className={styles.journalEmpty}>
                      <div
                        className={styles.journalPreviewDeck}
                        aria-hidden="true"
                      >
                        <article
                          className={`${styles.journalPreviewCard} ${styles.journalPreviewCardBack}`}
                        >
                          <div className={styles.journalPreviewMeta}>
                            <time>8/01 (토)</time>
                            <strong>-17,000원</strong>
                          </div>

                          <div className={styles.journalPreviewImage}>
                            <Image
                              src="/images/journal/journal-06.png"
                              alt=""
                              width={140}
                              height={136}
                            />
                          </div>

                          <p className={styles.journalPreviewContent}>
                            무료 취미 활동으로 즐거운 하루!
                          </p>
                        </article>

                        <article
                          className={`${styles.journalPreviewCard} ${styles.journalPreviewCardFront}`}
                        >
                          <div className={styles.journalPreviewMeta}>
                            <time>8/02 (일)</time>
                            <strong>--원</strong>
                          </div>

                          <div
                            className={`${styles.journalPreviewImage} ${styles.journalPreviewImageEmpty}`}
                          >
                            <Image
                              src="/images/journal/journal-empty.png"
                              alt=""
                              width={140}
                              height={136}
                            />
                          </div>

                          <p className={styles.journalPreviewContent}>
                            오늘도 실천이 기대돼요!
                          </p>
                        </article>
                      </div>
                      <div className={styles.journalEmptyText}>
                        <p>이번 주 그림일기를 기다리고 있어요!</p>

                        <span className={styles.journalEmptyDescription}>
                          오늘의 소비를 기록하면 첫 그림일기가 완성돼요.
                        </span>

                        <button
                          type="button"
                          className={styles.journalEmptyButton}
                        >
                          <span>그림일기 보러가기</span>

                          <span className="material-icons" aria-hidden="true">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
