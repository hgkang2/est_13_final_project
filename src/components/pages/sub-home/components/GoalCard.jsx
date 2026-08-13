import Image from "next/image";
import styles from "../SubHome.module.scss";

const GOAL_AHEAD_GAP = 5;
const GOAL_ON_TRACK_GAP = -5;
const GOAL_BEHIND_GAP = -15;

function getPlannedProgress(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today <= start) return 0;
  if (today >= end) return 100;

  const totalPeriod = end.getTime() - start.getTime();
  const elapsedPeriod = today.getTime() - start.getTime();

  if (totalPeriod <= 0) return 0;

  return Math.round((elapsedPeriod / totalPeriod) * 100);
}

function getGoalProgressStatus(progress, plannedProgress) {
  const progressGap = progress - plannedProgress;

  if (progressGap >= GOAL_AHEAD_GAP) {
    return "ahead";
  }

  if (progressGap >= GOAL_ON_TRACK_GAP) {
    return "onTrack";
  }

  if (progressGap >= GOAL_BEHIND_GAP) {
    return "slow";
  }

  return "behind";
}

export default function GoalCard({ hasGoal, goal }) {
  const currentAmount = goal?.current_amount ?? 0;
  const targetAmount = goal?.target_amount ?? 0;

  const progress =
    targetAmount > 0
      ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
      : 0;

  const remainingProgress = Math.max(100 - progress, 0);

  const plannedProgress = hasGoal
    ? getPlannedProgress(goal.start_date, goal.end_date)
    : 0;

  const progressStatus = hasGoal
    ? getGoalProgressStatus(progress, plannedProgress)
    : null;

  const progressStatusMessage = {
    ahead: "계획보다 앞서고 있어요",
    onTrack: "계획대로 잘 진행하고 있어요",
    slow: "계획보다 살짝 느린 속도예요",
    behind: "목표 달성을 위해 조금 더 저축이 필요해요",
  };

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
            {hasGoal ? `${progress}%` : "--%"}
          </strong>

          <div className={styles.progressArea}>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="이번 달 목표 달성률"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={hasGoal ? progress : 0}
            >
              {hasGoal && (
                <>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />

                  <span
                    className={styles.todayMarker}
                    style={{ left: `${plannedProgress}%` }}
                    aria-hidden="true"
                  />

                  <span
                    className={styles.todayLabel}
                    style={{ left: `${plannedProgress}%` }}
                  >
                    오늘 기준 {plannedProgress}%
                  </span>
                </>
              )}
            </div>

            {hasGoal && (
              <div className={styles.progressLabels}>
                <span
                  className={styles.currentLabel}
                  style={{ left: `${progress}%` }}
                >
                  {progress}% 달성
                </span>
              </div>
            )}
          </div>

          <p className={styles.goalAmount}>
            <strong>
              {hasGoal ? `${currentAmount.toLocaleString("ko-KR")}원` : "--원"}
            </strong>

            <span>
              {hasGoal
                ? `/ ${targetAmount.toLocaleString("ko-KR")}원`
                : "/ --원"}
            </span>
          </p>

          {!hasGoal && (
            <div className={styles.emptyGoalDescription}>
              <p>목표 달성률을 기다리고 있어요.</p>
              <span>목표를 설정하면 달성률을 확인할 수 있어요.</span>
            </div>
          )}

          {hasGoal && (
            <p
              className={`${styles.warningBadge} ${
                styles[`warningBadge_${progressStatus}`]
              }`}
            >
              <span
                className={`${styles.warningDot} ${
                  styles[`warningDot_${progressStatus}`]
                }`}
                aria-hidden="true"
              />

              {progressStatusMessage[progressStatus]}
            </p>
          )}
        </div>

        {hasGoal && (
          <figure className={styles.goalVisual}>
            <div className={styles.goalImageBox}>
              <span className={styles.goalImageBackground} aria-hidden="true" />

              <Image
                className={styles.goalImage}
                // src={goal.imageUrl || "/images/character/goal_image.png"}
                src="/images/character/goal_image.png"
                alt=""
                width={240}
                height={200}
              />
            </div>

            <figcaption className={styles.goalCaption}>
              <p>
                {goal.title}까지{" "}
                <strong className={styles.pointText}>{progress}%</strong>{" "}
                왔어요!
              </p>

              <span>목표까지 {remainingProgress}% 남았어요</span>
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}
