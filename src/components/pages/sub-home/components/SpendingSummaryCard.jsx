import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "../SubHome.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

export default function SpendingSummaryCard({
  hasSpendingData,
  monthlySpending,
  monthlySpendingDaily,
  spendingComparison,
}) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${Number(context.raw).toLocaleString("ko-KR")}원`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 3,
        },
      },
      y: {
        display: false,
        beginAtZero: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const chartLabels = monthlySpendingDaily.map(item => {
    const date = new Date(`${item.expense_date}T00:00:00`);

    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: monthlySpendingDaily.map(item => Number(item.cumulative_amount)),
        borderColor: "#76C58A",
        backgroundColor: "rgba(118, 197, 138, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: monthlySpendingDaily.length === 1 ? 4 : 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const rawChangeRate = spendingComparison?.change_rate;

  const changeRate =
    rawChangeRate === null || rawChangeRate === undefined
      ? null
      : Number(rawChangeRate);

  let spendingStatus = "noPrevious";

  if (changeRate !== null && changeRate !== undefined) {
    if (changeRate <= -10) {
      spendingStatus = "good";
    } else if (changeRate <= 10) {
      spendingStatus = "similar";
    } else if (changeRate <= 30) {
      spendingStatus = "warning";
    } else {
      spendingStatus = "danger";
    }
  }

  const spendingStatusContent = {
    noPrevious: {
      badge: "비교 기록이 부족해요",
      description: "지난달 비교 기록이 없어요.",
    },
    good: {
      badge: "좋은 흐름이에요!",
      description: `지난달보다 ${Math.abs(changeRate)}% 줄었어요!`,
    },
    similar: {
      badge: "비슷한 흐름이에요",
      description: "지난달과 비슷하게 쓰고 있어요.",
    },
    warning: {
      badge: "소비가 조금 늘었어요",
      description: `지난달보다 ${changeRate}% 늘었어요.`,
    },
    danger: {
      badge: "소비가 많이 늘었어요",
      description: "지난달보다 소비가 많이 늘었어요.",
    },
  };

  const currentSpendingStatus = spendingStatusContent[spendingStatus];

  return (
    <article
      className={styles.spendingSummaryCard}
      aria-labelledby="spending-summary-title"
    >
      <div className={styles.spendingSummaryContent}>
        <p
          className={`${styles.summaryBadge} ${
            !hasSpendingData
              ? styles.emptySummaryBadge
              : styles[`summaryBadge_${spendingStatus}`]
          }`}
        >
          {hasSpendingData
            ? currentSpendingStatus.badge
            : "첫 소비 기록을 기다리고 있어요."}
        </p>

        <h2 id="spending-summary-title">이번 달 소비 요약</h2>

        <strong className={styles.spendingAmount}>
          {hasSpendingData
            ? `${monthlySpending.toLocaleString("ko-KR")}원`
            : "--원"}
        </strong>

        <p className={styles.spendingDescription}>
          {hasSpendingData
            ? currentSpendingStatus.description
            : "소비를 기록하면 이번 달 소비 추이를 보여드릴게요."}
        </p>
      </div>

      <div
        className={`${styles.spendingChart} ${
          !hasSpendingData ? styles.emptySpendingChart : ""
        }`}
      >
        {hasSpendingData ? (
          <Line
            data={chartData}
            options={chartOptions}
            aria-label="이번 달 누적 소비 추이 그래프"
          />
        ) : (
          <Image
            src="/images/common/spending-graph.png"
            alt="소비 기록 전 빈 소비 추이 그래프"
            width={252}
            height={160}
          />
        )}
      </div>
    </article>
  );
}
