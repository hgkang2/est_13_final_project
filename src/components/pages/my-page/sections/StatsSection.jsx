import Image from "next/image";
import styles from "../MyPage.module.scss";

export default function StatsSection({
  monthlyExpense,
  monthlyAiAnalysisCount,
  averageGoalRate,
  monthlySavingRank = null,
}) {
  const hasSavingRank = monthlySavingRank > 0;
  const stats = [
    {
      label: "이번 달 총 지출",
      value: `${monthlyExpense.toLocaleString("ko-KR")}원`,
      image: "/images/mypage/07-payment-receipt.png",
    },
    {
      label: "AI 분석 횟수",
      value: `${monthlyAiAnalysisCount}번`,
      image: "/images/mypage/02-report-analysis.png",
    },
    {
      label: "평균 목표 달성률",
      value: `${averageGoalRate}%`,
      image: "/images/mypage/01-target.png",
    },
    {
      label: "이번 달 절약 랭킹",
      value: hasSavingRank ? `${monthlySavingRank}위` : "서비스를 준비중이에요!",
      image: hasSavingRank ? "/images/mypage/04-achievement.png" : null,
      isPending: !hasSavingRank,
    },
  ];

  return (
    <div className={styles.stats}>
      {stats.map((stat) => (
        <div className={styles.statCard} key={stat.label}>
          <div className={styles.statText}>
            <p className="body-m-plus">{stat.label}</p>
            <strong
              className={`heading-s ${
                stat.isPending ? styles.rankingPending : ""
              }`}
            >
              {stat.value}
            </strong>
          </div>

          {stat.image && (
            <Image src={stat.image} alt="" width={140} height={140} />
          )}
        </div>
      ))}
    </div>
  );
}
