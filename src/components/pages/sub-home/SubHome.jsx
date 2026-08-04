import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./SubHome.module.scss";

export default function SubHome() {
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
                    <h1 id="greeting-title">안녕하세요, Moa님!</h1>

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
                  <div className={styles.goalCardInner}>
                    <div className={styles.goalInfo}>
                      <h2 id="goal-card-title">이번 달 목표 달성률</h2>

                      <strong className={styles.goalPercent}>62%</strong>

                      <div className={styles.progressArea}>
                        <div
                          className={styles.progressTrack}
                          role="progressbar"
                          aria-label="이번 달 목표 달성률"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow="62"
                        >
                          <div className={styles.progressFill} />
                          <span
                            className={styles.todayMarker}
                            aria-hidden="true"
                          />
                        </div>

                        <div className={styles.progressLabels}>
                          <span className={styles.currentLabel}>62% 달성</span>
                          <span className={styles.todayLabel}>
                            오늘 기준 90%
                          </span>
                        </div>
                      </div>

                      <p className={styles.goalAmount}>
                        <strong>1,860,000원</strong>
                        <span>/ 3,000,000원</span>
                      </p>

                      <p className={styles.warningBadge}>
                        <span
                          className={styles.warningDot}
                          aria-hidden="true"
                        />
                        계획보다 살짝 느린 속도예요
                      </p>
                    </div>

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
                  </div>
                </article>
              </div>
              <div className={styles.summaryRow}>
                <article
                  className={styles.spendingSummaryCard}
                  aria-labelledby="spending-summary-title"
                >
                  <div className={styles.spendingSummaryContent}>
                    <p className={styles.summaryBadge}>좋은 흐름이에요!</p>

                    <h2 id="spending-summary-title">이번 달 소비 요약</h2>

                    <strong className={styles.spendingAmount}>620,000원</strong>

                    <p className={styles.spendingDescription}>
                      예산보다 12% 적게 사용했어요!
                    </p>
                  </div>

                  <div className={styles.spendingChart}>
                    <Image
                      src="/images/common/spending-graph.png"
                      alt="이번 달 소비 추이 그래프"
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

                      <p className={styles.aiMessage}>
                        이번 주 카페 소비가 지난주보다 <strong>23%</strong>{" "}
                        줄었어요!
                      </p>

                      <button type="button" className={styles.aiButton}>
                        <span>AI 분석 자세히 보기</span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </div>

                    <div className={styles.aiImage}>
                      <Image
                        src="/images/character/ai_moa.png"
                        alt="AI 캐릭터"
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
                        <p className={styles.missionMessage}>
                          편의점 지출 <strong>5,000원</strong> 이하로
                          유지해보세요!
                        </p>

                        <p className={styles.missionSubText}>
                          오늘 미션을 완료하고 새싹을 키워보세요. 🌱
                        </p>
                      </div>

                      <button type="button" className={styles.missionButton}>
                        <span>미션 자세히 보기</span>

                        <span className="material-icons" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </div>

                    <div className={styles.missionImage}>
                      <Image
                        src="/images/character/mission_moa.png"
                        alt="오늘의 미션을 안내하는 모아 캐릭터"
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
                </article>
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
