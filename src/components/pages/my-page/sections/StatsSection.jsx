import StatCard from "./StatCard";
import styles from "../MyPage.module.scss";

const stats = [
  {
    label: "이번 달 총 지출",
    value: "1,905,000원",
    image: "/images/mypage/07-payment-receipt.png",
    alt: "이번 달 총지출 이미지",
  },
  {
    label: "AI 분석 횟수",
    value: "12번",
    image: "/images/mypage/02-report-analysis.png",
    alt: "AI 분석 이미지",
  },
  {
    label: "평균 목표 달성률",
    value: "80%",
    image: "/images/mypage/01-target.png",
    alt: "목표 달성 이미지",
  },
  {
    label: "이번 달 절약 랭킹",
    value: "45위",
    image: "/images/mypage/04-achievement.png",
    alt: "절약 랭킹 이미지",
  },
];

export default function StatsSection() {
  return (
    <section className={styles.MyPage_Stats}>
      <div className={styles.Savings_Grid}>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            image={stat.image}
            alt={stat.alt}
          />
        ))}
      </div>
    </section>
  );
}
