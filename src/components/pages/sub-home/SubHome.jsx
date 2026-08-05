"use client";

import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./SubHome.module.scss";
import JournalSlider from "@/components/common/JournalSlider";

export default function SubHome() {
  const userName = "Moa";
  const hasGoal = true;
  const hasSpendingData = true;
  const hasSavingGoal = true;
  const hasChallenge = true;
  const hasJournal = true;

  return (
    <>
      <div className={styles.page}>
        <Sidebar />

        <main className={styles.main}>
          <div className="container">
            <div className={styles.content}>
              <div className={styles.topRow}>
                <section
                  className={styles.greeting}
                  aria-labelledby="greeting-title"
                >
                  <div className={styles.greetingTitle}>
                    <h1 id="greeting-title">안녕하세요, {userName}님!</h1>

                    <Image
                      src="/images/challenge/sprout.png"
                      alt=""
                      width={40}
                      height={40}
                      aria-hidden="true"
                    />
                  </div>

                  <p>오늘도 작은 실천으로 더 나은 내일을 만들어봐요</p>
                </section>

                <article
                  className={styles.goalCard}
                  aria-labelledby="goal-card-title"
                >
                  <div
                    className={`${styles.goalCardInner} ${
                      !hasGoal ? styles.emptyGoalCardInner : ""
                    }`}
                  >
                    <div
                      className={`${styles.goalInfo} ${
                        !hasGoal ? styles.emptyGoalInfo : ""
                      }`}
                    >
                      <h2 id="goal-card-title">이번 달 목표 달성률</h2>

                      <strong className={styles.goalPercent}>
                        {hasGoal ? "62%" : "0%"}
                      </strong>

                      <div className={styles.progressArea}>
                        <div
                          className={styles.progressTrack}
                          role="progressbar"
                          aria-label="이번 달 목표 달성률"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow={hasGoal ? 62 : 0}
                        >
                          {hasGoal && (
                            <>
                              <div className={styles.progressFill} />

                              <span
                                className={styles.todayMarker}
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </div>

                        {hasGoal && (
                          <div className={styles.progressLabels}>
                            <span className={styles.currentLabel}>
                              62% 달성
                            </span>

                            <span className={styles.todayLabel}>
                              오늘 기준 90%
                            </span>
                          </div>
                        )}
                      </div>

                      <p className={styles.goalAmount}>
                        <strong>{hasGoal ? "1,860,000원" : "0원"}</strong>
                        <span>{hasGoal ? "/ 3,000,000원" : "/ 0원"}</span>
                      </p>

                      {hasGoal && (
                        <p className={styles.warningBadge}>
                          <span
                            className={styles.warningDot}
                            aria-hidden="true"
                          />
                          계획보다 살짝 느린 속도예요
                        </p>
                      )}
                    </div>

                    {hasGoal && (
                      <figure className={styles.goalVisual}>
                        <div className={styles.goalImageBox}>
                          <span
                            className={styles.goalImageBackground}
                            aria-hidden="true"
                          />

                          <Image
                            className={styles.goalImage}
                            src="/images/character/macbook.png"
                            alt="새싹 장식이 달린 맥북"
                            width={240}
                            height={200}
                          />
                        </div>

                        <figcaption className={styles.goalCaption}>
                          <p>
                            맥북까지{" "}
                            <strong className={styles.pointText}>62%</strong>{" "}
                            왔어요!
                          </p>

                          <span>목표까지 38% 남았어요</span>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                </article>
              </div>
              <div className={styles.summaryRow}>
                <article
                  className={styles.spendingSummaryCard}
                  aria-labelledby="spending-summary-title"
                >
                  <div className={styles.spendingSummaryContent}>
                    {hasSpendingData && (
                      <p className={styles.summaryBadge}>좋은 흐름이에요!</p>
                    )}

                    <h2 id="spending-summary-title">이번 달 소비 요약</h2>

                    <strong className={styles.spendingAmount}>
                      {hasSpendingData ? "620,000원" : "0원"}
                    </strong>

                    <p className={styles.spendingDescription}>
                      {hasSpendingData
                        ? "예산보다 12% 적게 사용했어요!"
                        : "소비를 기록하면 이번 달 소비 추이를 보여드릴게요."}
                    </p>
                  </div>

                  <div
                    className={`${styles.spendingChart} ${
                      !hasSpendingData ? styles.emptySpendingChart : ""
                    }`}
                  >
                    <Image
                      src="/images/common/spending-graph.png"
                      alt={
                        hasSpendingData
                          ? "이번 달 소비 추이 그래프"
                          : "소비 기록 전 빈 소비 추이 그래프"
                      }
                      width={252}
                      height={160}
                    />
                  </div>
                </article>

                <article
                  className={styles.aiCard}
                  aria-labelledby="ai-card-title"
                >
                  <div className={styles.aiContent}>
                    <div className={styles.aiText}>
                      <h2 id="ai-card-title">MO:UM AI 한마디</h2>

                      {hasSpendingData ? (
                        <p className={styles.aiMessage}>
                          이번 주 카페 소비가 지난주보다 <strong>23%</strong>{" "}
                          줄었어요!
                        </p>
                      ) : (
                        <div className={styles.aiEmptyMessage}>
                          <p
                            className={`${styles.aiMessage} ${styles.aiEmptyTitle}`}
                          >
                            AI가 첫 분석을 기다리고 있어요.
                          </p>

                          <p className={styles.aiEmptyDescription}>
                            첫 소비를 기록하면 AI가 소비 습관을 분석해드릴게요.
                          </p>
                        </div>
                      )}
                      <button type="button" className={styles.outlineButton}>
                        <span>
                          {hasSpendingData
                            ? "AI 분석 자세히 보기"
                            : "소비 기록하기"}
                        </span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </div>

                    <div className={styles.aiImage}>
                      <Image
                        src={
                          hasSpendingData
                            ? "/images/character/ai_moa.png"
                            : "/images/character/ai_empty_moa.png"
                        }
                        alt={
                          hasSpendingData
                            ? "AI 캐릭터"
                            : "첫 분석을 기다리는 AI 캐릭터"
                        }
                        width={247}
                        height={247}
                      />
                    </div>
                  </div>
                </article>
              </div>
              <div className={styles.missionRow}>
                <article
                  className={styles.missionCard}
                  aria-labelledby="mission-card-title"
                >
                  <div className={styles.missionContent}>
                    <div className={styles.missionText}>
                      <header className={styles.missionHeader}>
                        <Image
                          src="/images/challenge/star.png"
                          alt=""
                          width={40}
                          height={40}
                          aria-hidden="true"
                        />

                        <h2 id="mission-card-title">오늘의 미션</h2>
                      </header>

                      <div className={styles.missionDescription}>
                        {hasSpendingData ? (
                          <>
                            <p className={styles.missionMessage}>
                              편의점 지출 <strong>5,000원</strong> 이하로
                              유지해보세요!
                            </p>

                            <p className={styles.missionSubText}>
                              오늘 미션을 완료하고 새싹을 키워보세요. 🌱
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              className={`${styles.missionMessage} ${styles.emptyMissionTitle}`}
                            >
                              오늘의 소비 데이터를 기다리고 있어요.
                            </p>

                            <p className={styles.missionSubText}>
                              기록을 시작하면 오늘의 절약 미션을 추천해드릴게요!
                            </p>
                          </>
                        )}
                      </div>

                      <button type="button" className={styles.outlineButton}>
                        <span>
                          {hasSpendingData
                            ? "미션 자세히 보기"
                            : "소비 기록하기"}
                        </span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </div>

                    <div className={styles.missionImage}>
                      <Image
                        className={
                          !hasSpendingData ? styles.emptyMissionCharacter : ""
                        }
                        src={
                          hasSpendingData
                            ? "/images/character/mission_moa.png"
                            : "/images/character/mission_empty_moa.png"
                        }
                        alt={
                          hasSpendingData
                            ? "오늘의 미션을 안내하는 모아 캐릭터"
                            : "기록을 시작하도록 안내하는 모아 캐릭터"
                        }
                        width={220}
                        height={220}
                      />
                    </div>
                  </div>
                </article>
                <article
                  className={styles.recentCard}
                  aria-labelledby="recent-card-title"
                >
                  <header className={styles.recentHeader}>
                    <h2 id="recent-card-title">최근 소비 내역</h2>

                    <button type="button" className={styles.moreButton}>
                      <span>더보기</span>

                      <span className="material-icons" aria-hidden="true">
                        arrow_forward
                      </span>
                    </button>
                  </header>

                  {hasSpendingData ? (
                    <ul className={styles.transactionList}>
                      <li className={styles.transactionItem}>
                        <Image
                          src="/images/category/cafe-snack.png"
                          alt=""
                          width={40}
                          height={40}
                          aria-hidden="true"
                        />

                        <div className={styles.transactionInfo}>
                          <strong>스타벅스</strong>
                          <span className={styles.cafeCategory}>카페/간식</span>
                        </div>

                        <div className={styles.transactionAmount}>
                          <strong>-4,500원</strong>
                          <span>오늘 09:24</span>
                        </div>
                      </li>

                      <li className={styles.transactionItem}>
                        <Image
                          src="/images/category/salary.png"
                          alt=""
                          width={40}
                          height={40}
                          aria-hidden="true"
                        />

                        <div className={styles.transactionInfo}>
                          <strong>급여</strong>
                          <span className={styles.salaryCategory}>급여</span>
                        </div>

                        <div className={styles.transactionAmount}>
                          <strong className={styles.incomeAmount}>
                            +2,850,000원
                          </strong>
                          <span>7/25 09:00</span>
                        </div>
                      </li>

                      <li className={styles.transactionItem}>
                        <Image
                          src="/images/category/food.png"
                          alt=""
                          width={40}
                          height={40}
                          aria-hidden="true"
                        />

                        <div className={styles.transactionInfo}>
                          <strong>배달의 민족</strong>
                          <span className={styles.foodCategory}>식비</span>
                        </div>

                        <div className={styles.transactionAmount}>
                          <strong>-23,000원</strong>
                          <span>7/24 22:05</span>
                        </div>
                      </li>

                      <li className={styles.transactionItem}>
                        <Image
                          src="/images/category/savings.png"
                          alt=""
                          width={40}
                          height={40}
                          aria-hidden="true"
                        />

                        <div className={styles.transactionInfo}>
                          <strong>적금 계좌로 이체</strong>
                          <span className={styles.savingsCategory}>저축</span>
                        </div>

                        <div className={styles.transactionAmount}>
                          <strong>-200,000원</strong>
                          <span>7/24 14:00</span>
                        </div>
                      </li>
                    </ul>
                  ) : (
                    <div className={styles.recentEmpty}>
                      <span
                        className={`material-icons ${styles.recentEmptyIcon}`}
                        aria-hidden="true"
                      >
                        format_list_bulleted_add
                      </span>

                      <div className={styles.recentEmptyText}>
                        <p>기록된 소비가 없어요.</p>
                        <span>첫 소비를 입력해보세요.</span>
                      </div>
                    </div>
                  )}
                </article>
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
                    <h2 id="journal-card-title">이번 주 소비 절약 그림일기</h2>

                    <button type="button" className={styles.moreButton}>
                      <span>그림일기로 이동</span>

                      <span className="material-icons" aria-hidden="true">
                        arrow_forward
                      </span>
                    </button>
                  </header>

                  <JournalSlider isEmpty={!hasJournal} />
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
