import Image from "next/image";
import styles from "../MyPage.module.scss";

export default function StatsSection({ monthlyExpense, monthlyAiAnalysisCount }) {
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
      value: "0%",
      image: "/images/mypage/01-target.png",
    },
    {
      label: "이번 달 절약 랭킹",
      value: "0위",
      image: "/images/mypage/04-achievement.png",
    },
  ];

  return (
    <div className={styles.stats}>
      {stats.map((stat) => (
        <div className={styles.statCard} key={stat.label}>
          <div className={styles.statText}>
            <p className="body-m-plus">{stat.label}</p>
            <strong className="heading-s">{stat.value}</strong>
          </div>

          <Image src={stat.image} alt="" width={140} height={140} />
        </div>
      ))}
    </div>
  );
}
