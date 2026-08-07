import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";

export default function SavingGoalCard({ hasSavingGoal }) {
  return (
    <article
      className={styles.savingGoalCard}
      aria-labelledby="saving-goal-title"
    >
      <div className={styles.cardInner}>
        <header className={styles.cardHeader}>
          <h2 id="saving-goal-title">저축 목표</h2>

          <MoreButton>목표 관리로 이동</MoreButton>
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

                <span className={styles.goalProgressValue}>65%</span>
              </div>

              <p className={styles.goalSchedule}>
                현재 저축 속도로는 목표보다 <strong>13</strong>일 늦어질
                예정이에요.
              </p>
            </div>

            <div className={styles.goalNotice}>
              <span className="material-icons" aria-hidden="true">
                report
              </span>

              <p>하루 150,000원씩 저축하면 목표를 달성할 수 있어요.</p>
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
