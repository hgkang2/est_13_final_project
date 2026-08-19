import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";

export default function SavingGoalCard({ hasSavingGoal, savingGoal }) {
  const currentAmount = Number(savingGoal?.current_amount ?? 0);
  const targetAmount = Number(savingGoal?.target_amount ?? 0);

  const progress =
    targetAmount > 0
      ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
      : 0;

  const isCompleted = targetAmount > 0 && currentAmount >= targetAmount;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasValidGoalDates =
    Boolean(savingGoal?.start_date) && Boolean(savingGoal?.end_date);

  const startDate = hasValidGoalDates
    ? new Date(`${savingGoal.start_date}T00:00:00`)
    : null;

  const endDate = hasValidGoalDates
    ? new Date(`${savingGoal.end_date}T00:00:00`)
    : null;

  const dayDiff =
    endDate && !Number.isNaN(endDate.getTime())
      ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const dDay = Math.max(dayDiff, 0);

  const dDayLabel =
    dayDiff > 0
      ? `D-${dayDiff}`
      : dayDiff === 0
        ? "D-DAY"
        : `D+${Math.abs(dayDiff)}`;

  const isOverdue = dayDiff < 0 && !isCompleted;
  const dDayStatus =
    dayDiff < 0 ? "overdue" : dayDiff <= 30 ? "warning" : "normal";

  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  const hasStarted =
    startDate &&
    !Number.isNaN(startDate.getTime()) &&
    today.getTime() >= startDate.getTime();

  const elapsedDays = hasStarted
    ? Math.max(
        Math.ceil(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
        1,
      )
    : 0;

  const dailySavingAverage = elapsedDays > 0 ? currentAmount / elapsedDays : 0;

  const requiredDailySaving =
    !isCompleted && dDay > 0 ? Math.ceil(remainingAmount / dDay) : 0;

  const expectedRemainingDays =
    !isCompleted && dailySavingAverage > 0
      ? Math.ceil(remainingAmount / dailySavingAverage)
      : null;

  const delayDays =
    expectedRemainingDays !== null
      ? Math.max(expectedRemainingDays - dDay, 0)
      : null;

  const aheadDays =
    expectedRemainingDays !== null
      ? Math.max(dDay - expectedRemainingDays, 0)
      : null;

  const additionalDailySaving = Math.max(
    Math.ceil(requiredDailySaving - dailySavingAverage),
    0,
  );

  let goalNoticeStatus = "required";

  if (isCompleted) {
    goalNoticeStatus = "completed";
  } else if (isOverdue) {
    goalNoticeStatus = "overdue";
  } else if (
    dailySavingAverage > 0 &&
    dailySavingAverage >= requiredDailySaving
  ) {
    goalNoticeStatus = "possible";
  } else if (dailySavingAverage > 0) {
    goalNoticeStatus = "needMore";
  }

  return (
    <article
      className={styles.savingGoalCard}
      aria-labelledby="saving-goal-title"
    >
      <div className={styles.cardInner}>
        <header className={styles.cardHeader}>
          <h2 id="saving-goal-title">저축 목표</h2>

          <MoreButton href="/sub-goalsetting">목표 관리로 이동</MoreButton>
        </header>

        {hasSavingGoal ? (
          <>
            <div className={styles.savingGoalBody}>
              <div className={styles.goalTitleRow}>
                <h3>{savingGoal.title}</h3>
                <span
                  className={`${styles.dDayBadge} ${
                    styles[`dDayBadge_${dDayStatus}`]
                  }`}
                >
                  {dDayLabel}
                </span>
              </div>

              <div className={styles.goalAmountRow}>
                <strong>{currentAmount.toLocaleString("ko-KR")}원</strong>

                <span>/ {targetAmount.toLocaleString("ko-KR")}원</span>
              </div>

              <div className={styles.goalProgressRow}>
                <div
                  className={styles.goalProgressTrack}
                  role="progressbar"
                  aria-label={`${savingGoal.title} 목표 달성률`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progress}
                >
                  <div
                    className={styles.goalProgressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className={styles.goalProgressValue}>{progress}%</span>
              </div>

              <p className={styles.goalSchedule}>
                {isCompleted ? (
                  "목표 금액을 모두 달성했어요!"
                ) : isOverdue ? (
                  "목표 기간이 지났어요. 목표를 다시 확인해보세요."
                ) : expectedRemainingDays === null ? (
                  "저축 기록이 쌓이면 예상 달성 속도를 알려드릴게요."
                ) : delayDays > 0 ? (
                  <>
                    현재 저축 속도로는 목표보다 <strong>{delayDays}</strong>일
                    늦어질 예정이에요.
                  </>
                ) : (
                  <>
                    현재 저축 속도라면 목표보다 <strong>{aheadDays}</strong>일
                    일찍 달성할 수 있어요.
                  </>
                )}
              </p>
            </div>

            <div className={styles.goalNotice}>
              <span
                className={`material-icons ${
                  styles[`goalNoticeIcon_${goalNoticeStatus}`]
                }`}
                aria-hidden="true"
              >
                {goalNoticeStatus === "possible"
                  ? "rocket_launch"
                  : goalNoticeStatus === "needMore"
                    ? "savings"
                    : "report"}
              </span>

              <p>
                {goalNoticeStatus === "completed"
                  ? "목표를 달성했어요. 다음 목표에 도전해보세요!"
                  : goalNoticeStatus === "overdue"
                    ? `${remainingAmount.toLocaleString("ko-KR")}원이 더 필요해요.`
                    : goalNoticeStatus === "possible"
                      ? "지금처럼 저축하면 충분히 가능해요!"
                      : goalNoticeStatus === "needMore"
                        ? `하루 평균 ${additionalDailySaving.toLocaleString("ko-KR")}원 더 저축하면 목표를 달성할 수 있어요.`
                        : `하루 ${requiredDailySaving.toLocaleString("ko-KR")}원씩 저축하면 목표를 달성할 수 있어요.`}
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
                role="group"
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

            <div className={`${styles.goalNotice} ${styles.emptyGoalNotice}`}>
              <span className="material-icons" aria-hidden="true">
                report
              </span>

              <p>목표를 만들면 목표 달성률과 예상 달성일을 확인할 수 있어요.</p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
