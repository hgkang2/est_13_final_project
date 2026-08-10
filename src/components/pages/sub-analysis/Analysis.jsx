"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Analysis.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const COLORS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#94a3b8",
];

export default function Analysis() {
  const supabase = createClient();

  const [totalExpense, setTotalExpense] = useState(1468123);
  const [showAllRanking, setShowAllRanking] = useState(false);

  const [categoryData, setCategoryData] = useState([
    { name: "식비", amount: 660855, percentage: 45, color: "#6366f1" },
    { name: "쇼핑", amount: 293215, percentage: 20, color: "#ef4444" },
    { name: "교통", amount: 176175, percentage: 12, color: "#f59e0b" },
    { name: "여가", amount: 146812, percentage: 10, color: "#10b981" },
    { name: "주거", amount: 117266, percentage: 8, color: "#3b82f6" },
    { name: "기타", amount: 73000, percentage: 5, color: "#94a3b8" },
  ]);

  const [lineChartData] = useState({
    labels: ["6월", "7월", "8월"],
    datasets: [
      {
        label: "지출",
        data: [420000, 510000, 520000],
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
      },
      {
        label: "예산",
        data: [680000, 700000, 720000],
        borderColor: "#94a3b8",
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  });

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  useEffect(() => {
    async function fetchAnalysisData() {
      if (!supabase) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          return;
        }

        const { data, error } = await supabase
          .from("transactions")
          .select(
            `
            id,
            amount,
            date,
            type,
            categories (
              id,
              name
            )
          `,
          )
          .eq("user_id", user.id);

        if (error || !data || data.length === 0) return;

        processCategoryStats(data);
      } catch (err) {
        console.error("Supabase 연동 대기 중:", err);
      }
    }

    fetchAnalysisData();
  }, [supabase]);

  const processCategoryStats = txData => {
    const expenses = txData.filter(tx => tx.type === "지출" || tx.amount > 0);
    const total = expenses.reduce((acc, cur) => acc + cur.amount, 0);
    setTotalExpense(total);

    const categoryMap = {};
    expenses.forEach(tx => {
      const catName = tx.categories?.name || "기타";
      if (!categoryMap[catName]) categoryMap[catName] = 0;
      categoryMap[catName] += tx.amount;
    });

    const formattedData = Object.keys(categoryMap).map((name, index) => {
      const amount = categoryMap[name];
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
      return {
        name,
        amount,
        percentage,
        color: COLORS[index % COLORS.length],
      };
    });

    formattedData.sort((a, b) => b.amount - a.amount);
    setCategoryData(formattedData);
  };

  const doughnutData = {
    labels: categoryData.map(item => item.name),
    datasets: [
      {
        data: categoryData.map(item => item.amount),
        backgroundColor: categoryData.map(item => item.color),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: "75%",
  };

  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />
        <main className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>소비 분석</h1>
            <p className={styles.subtitle}>
              내 소비 데이터를 분석하여 체계적으로 관리하세요.
            </p>
          </div>

          <section className={`${styles.card} ${styles.aiReportCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.aiTitleGroup}>
                <h3>AI 분석 리포트</h3>
                <span className={styles.aiDate}>(2026.08.02 기준)</span>
              </div>
              <button type="button" className={styles.actionBtnInline}>
                맞춤 미션 받기
              </button>
            </div>

            <div className={styles.aiReportBody}>
              <div className={styles.characterArea}>
                <div className={styles.characterBox}>
                  <img
                    src="/images/character/moa analysis.png"
                    alt="AI 소비 분석 결과를 설명하는 모아 캐릭터"
                    className={styles.characterImage}
                  />
                </div>
              </div>

              <div className={styles.insightContentArea}>
                <div className={styles.insightTop}>
                  <div className={styles.insightHeader}>
                    <span className="material-symbols-rounded">analytics</span>
                    <h4>분석</h4>
                  </div>
                  <p>
                    <span className={styles.highlightRed}>식비 지출</span>이
                    186,500으로 가장 높고,{" "}
                    <span className={styles.highlightYellow}>문화생활비</span>가
                    12,000원으로 가장 낮습니다.
                    <br />
                    특히 금요일 저녁 배달과 외식에 지출의 32%가 집중됐고, 전체
                    지출의 38%를 차지했어요.
                  </p>
                </div>

                <div className={styles.insightBottomGrid}>
                  <div className={styles.insightSubItem}>
                    <div className={styles.insightHeader}>
                      <span className="material-symbols-rounded">
                        trending_up
                      </span>
                      <h4>예측</h4>
                    </div>
                    <p>
                      현재 속도라면
                      <br />
                      <span className={styles.highlightGreen}>
                        목표 금액의 41%
                      </span>
                      를 달성하고,
                      <br />
                      3월 18일이면 완수할 수 있어요.
                    </p>
                  </div>

                  <div className={styles.insightSubItem}>
                    <div className={styles.insightHeader}>
                      <span className="material-symbols-rounded">task_alt</span>
                      <h4>실행</h4>
                    </div>
                    <p>일일 2만원 이내로 식비 지출 미션을 추천해요.</p>
                  </div>

                  <div className={styles.insightSubItem}>
                    <div className={styles.insightHeader}>
                      <span className="material-symbols-rounded">thumb_up</span>
                      <h4>피드백</h4>
                    </div>
                    <p>
                      미션을 달성해 18,000원을 절약했고, 목표 달성력이 43%로
                      높아졌어요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.summaryGrid}>
            <div className={styles.card}>
              <span className={styles.summaryLabel}>총 지출</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>1,468,123</strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>최근 3개월 누적</span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>월 평균 지출</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>489,347</strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>최근 3개월 평균</span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>카테고리 수</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>8</strong>
                <span className={styles.unit}>개</span>
              </div>
              <span className={styles.summarySubText}>
                현재까지 지출 카테고리
              </span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>이번 달 남은 예산</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>831,877</strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>
                예산/2,000,000원 기준
              </span>
            </div>
          </div>

          <div className={styles.gridContainer}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>지출 추이</h3>
                <div className={styles.selectBox}>월별</div>
              </div>
              <div className={styles.lineChartArea}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>카테고리별 소비 비중</h3>
              </div>
              <div className={styles.donutChartArea}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className={styles.donutCenterText}>
                  <span>총 지출</span>
                  <strong>{totalExpense.toLocaleString()}원</strong>
                </div>
              </div>
              <ul className={styles.categoryLegendList}>
                {categoryData.map((item, idx) => (
                  <li key={idx}>
                    <div className={styles.legendLeft}>
                      <span
                        className={styles.dot}
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={styles.legendName}>{item.name}</span>
                      <span className={styles.legendPercent}>
                        {item.percentage}%
                      </span>
                    </div>
                    <span className={styles.price}>
                      {item.amount.toLocaleString()}원
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>예산 대비 지출 랭킹</h3>
              <span className={styles.rankingDate}>2026.08</span>
            </div>
            <div className={styles.rankingList}>
              {categoryData
                .slice(0, showAllRanking ? categoryData.length : 3)
                .map((item, index) => {
                  const budget = 300000;
                  const percent = Math.min(
                    Math.round((item.amount / budget) * 100),
                    100,
                  );

                  return (
                    <div className={styles.rankingItem} key={index}>
                      <span className={`${styles.rankBadge} ${styles.r1}`}>
                        {index + 1}
                      </span>
                      <span className={styles.rankCategory}>{item.name}</span>
                      <div className={styles.progressBarWrapper}>
                        <div
                          className={styles.progressBar}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={styles.rankPercent}>{percent}%</span>
                      <span className={styles.rankAmount}>
                        {item.amount.toLocaleString()} /{" "}
                        {budget.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
            </div>
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => setShowAllRanking(!showAllRanking)}
            >
              {showAllRanking ? "접기" : "더보기"}
            </button>
          </section>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
