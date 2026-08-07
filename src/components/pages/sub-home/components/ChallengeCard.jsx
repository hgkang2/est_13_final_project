import Image from "next/image";
import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";

export default function ChallengeCard({ hasChallenge }) {
  return (
    <article className={styles.challengeCard} aria-labelledby="challenge-title">
      <div className={styles.cardInner}>
        <header className={styles.cardHeader}>
          <h2 id="challenge-title">챌린지 현황</h2>

          <MoreButton>챌린지로 이동</MoreButton>
        </header>

        <div className={styles.challengeBody}>
          <div className={styles.challengeSummary}>
            <h3>7일 소비 챌린지</h3>

            {hasChallenge && <strong>6일째 진행 중!</strong>}
          </div>

          <div className={styles.challengeCalendar}>
            <div className={styles.challengeWeekdays}>
              {["월", "화", "수", "목", "금", "토", "일"].map(day => (
                <span key={day}>{day}</span>
              ))}
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
  );
}
