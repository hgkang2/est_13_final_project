import Image from "next/image";
import styles from "../SubHome.module.scss";

export default function GoalCard({ hasGoal }) {
  return (
    <article className={styles.goalCard} aria-labelledby="goal-card-title">
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
            {hasGoal ? "62%" : "--%"}
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

                  <span className={styles.todayMarker} aria-hidden="true" />
                </>
              )}
            </div>

            {hasGoal && (
              <div className={styles.progressLabels}>
                <span className={styles.currentLabel}>62% 달성</span>

                <span className={styles.todayLabel}>오늘 기준 90%</span>
              </div>
            )}
          </div>

          <p className={styles.goalAmount}>
            <strong>{hasGoal ? "1,860,000원" : "--원"}</strong>
            <span>{hasGoal ? "/ 3,000,000원" : "/ --원"}</span>
          </p>

          {!hasGoal && (
            <div className={styles.emptyGoalDescription}>
              <p>목표 달성률을 기다리고 있어요.</p>
              <span>목표를 설정하면 달성률을 확인할 수 있어요.</span>
            </div>
          )}

          {hasGoal && (
            <p className={styles.warningBadge}>
              <span className={styles.warningDot} aria-hidden="true" />
              계획보다 살짝 느린 속도예요
            </p>
          )}
        </div>

        {hasGoal && (
          <figure className={styles.goalVisual}>
            <div className={styles.goalImageBox}>
              <span className={styles.goalImageBackground} aria-hidden="true" />

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
                맥북까지 <strong className={styles.pointText}>62%</strong>{" "}
                왔어요!
              </p>

              <span>목표까지 38% 남았어요</span>
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}
