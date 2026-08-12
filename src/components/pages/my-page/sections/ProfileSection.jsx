import styles from "../MyPage.module.scss";

export default function ProfileSection({ profile, activeGoalCount }) {
  const nickname = profile.nickname || "회원";
  const dayCount = 0;
  const stats = [
    { label: "진행중인 목표", value: `${activeGoalCount}개` },
    { label: "이번 달 저축 금액", value: "0원" },
    { label: "완료한 챌린지수", value: "0개" },
  ];

  return (
    <div className={styles.profile}>
      <div className={styles.greeting}>
        <div className={styles.profileImage}>
          {profile.image && <img src={profile.image} alt="" />}
        </div>

        <div className={styles.greetingText}>
          <p className="heading-s-plus">
            {nickname}님, {dayCount === 0 ? "반가워요!" : "오늘도 반가워요!"}
          </p>

          <p className="heading-xs">
            {dayCount === 0
              ? "목표를 달성하기까지 함께해요!"
              : `작은 실천을 이어온지 ${dayCount}일째예요.`}
          </p>
        </div>
      </div>

      <div className={styles.profileStats}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`${styles.profileStat} ${
              index === 1 ? styles.middleStat : ""
            }`}
          >
            <span className="body-m">{stat.label}</span>
            <strong className="heading-s">{stat.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
