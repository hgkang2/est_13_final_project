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
            </div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
