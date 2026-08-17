import Image from "next/image";
import styles from "../SubHome.module.scss";
import OutlineButton from "./OutlineButton";

export default function MissionCard({
  hasSpendingData,
  recommendedMission,
  isLoading,
}) {
  if (isLoading) {
    return (
      <article
        className={`${styles.missionCard} ${styles.skeletonCard}`}
        aria-busy="true"
        aria-label="오늘의 미션을 불러오는 중"
      >
        <div className={styles.missionContent}>
          <div className={styles.skeletonTextGroup} aria-hidden="true">
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
            />
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonLineLong}`}
            />
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonLineMedium}`}
            />
            <div
              className={`${styles.skeletonBlock} ${styles.skeletonButton}`}
            />
          </div>

          <div
            className={`${styles.skeletonBlock} ${styles.skeletonCharacter}`}
            aria-hidden="true"
          />
        </div>
      </article>
    );
  }

  const hasMission = hasSpendingData && Boolean(recommendedMission?.title);
  return (
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
            {hasMission ? (
              <>
                <p className={styles.missionMessage}>
                  {recommendedMission.title}
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

          <OutlineButton href={hasMission ? "/sub-challenge" : "/transaction"}>
            {hasMission ? "미션 자세히 보기" : "소비 기록하기"}
          </OutlineButton>
        </div>

        <div className={styles.missionImage}>
          <Image
            className={!hasMission ? styles.emptyMissionCharacter : ""}
            src={
              hasMission
                ? "/images/character/mission_moa.png"
                : "/images/character/mission_empty_moa.png"
            }
            alt={
              hasMission
                ? "오늘의 미션을 안내하는 모아 캐릭터"
                : "기록을 시작하도록 안내하는 모아 캐릭터"
            }
            width={220}
            height={220}
          />
        </div>
      </div>
    </article>
  );
}
