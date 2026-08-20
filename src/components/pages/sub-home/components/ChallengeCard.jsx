import Image from "next/image";
import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";

export default function ChallengeCard({ challenge }) {
  const activeMission = challenge?.activeMission ?? null;
  const weekStates = challenge?.weekStates ?? [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  const todayIndex = challenge?.todayIndex ?? -1;
  const weeklyCompletedCount = challenge?.weeklyCompletedCount ?? 0;
  const isTodayCompleted = Boolean(challenge?.isTodayCompleted);

  const hasTodayMission = Boolean(activeMission);
  const isWeekCompleted = weeklyCompletedCount === 7;

  const getChallengeStatusText = () => {
    if (isWeekCompleted) {
      return "7일 모두 달성!";
    }

    if (isTodayCompleted) {
      return "오늘 미션 완료!";
    }

    if (hasTodayMission) {
      return "오늘 미션 진행 중";
    }

    if (weeklyCompletedCount > 0) {
      return `${weeklyCompletedCount}일 성공 중`;
    }

    return null;
  };

  const getChallengeMessage = () => {
    if (isWeekCompleted) {
      return "이번 주 7일 챌린지를 모두 달성했어요!";
    }

    if (isTodayCompleted) {
      return `오늘 미션까지 완료! 이번 주 ${weeklyCompletedCount}일 성공했어요.`;
    }

    if (hasTodayMission && weeklyCompletedCount === 6) {
      return "오늘 미션까지 성공하면 7일 달성!";
    }

    if (hasTodayMission && weeklyCompletedCount > 0) {
      return `오늘 미션 진행 중! 이번 주 ${weeklyCompletedCount}일 성공했어요.`;
    }

    if (hasTodayMission) {
      return "오늘 미션에 도전하고 첫 새싹을 채워보세요.";
    }

    if (weeklyCompletedCount > 0) {
      return `이번 주 ${weeklyCompletedCount}일 성공했어요. 오늘 미션도 이어가보세요.`;
    }

    return "챌린지를 시작하면 매일 새싹 스탬프가 채워져요.";
  };

  const challengeStatusText = getChallengeStatusText();

  return (
    <article className={styles.challengeCard} aria-labelledby="challenge-title">
      <div className={styles.cardInner}>
        <header className={styles.cardHeader}>
          <h2 id="challenge-title">챌린지 현황</h2>

          <MoreButton href="/sub-challenge">챌린지로 이동</MoreButton>
        </header>

        <div className={styles.challengeBody}>
          <div className={styles.challengeSummary}>
            <h3>7일 소비 챌린지</h3>

            {challengeStatusText && <strong>{challengeStatusText}</strong>}
          </div>

          <div className={styles.challengeCalendar}>
            <div className={styles.challengeWeekdays}>
              {["월", "화", "수", "목", "금", "토", "일"].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className={styles.challengeDays}>
              {weekStates.map((isCompleted, index) => {
                const isCurrent = index === todayIndex;

                return (
                  <div key={index} className={styles.challengeDay}>
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

                    <span>{index + 1}일차</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className={styles.challengeMessage}>{getChallengeMessage()}</p>
        </div>
      </div>
    </article>
  );
}
