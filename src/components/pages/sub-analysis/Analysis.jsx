"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

import { getAiAnalysis } from "../sub-home/services/subHomeService";

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
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#94a3b8",
];

export default function Analysis() {
  const router = useRouter();
  const supabase = createClient();

  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [currentMonthExpense, setCurrentMonthExpense] = useState(0);
  const [maxMonthlyExpense, setMaxMonthlyExpense] = useState(0); // 요약 카드용 실제 지표
  const [showAllRanking, setShowAllRanking] = useState(false);

  const [categoryData, setCategoryData] = useState([]);
  const [currentMonthCategoryData, setCurrentMonthCategoryData] = useState([]);
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "지출",
        data: [],
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
      },
    ],
  });

  // ── AI 분석 리포트 상태 ──
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [recommendedMission, setRecommendedMission] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleGoToSubChallenge = () => {
    router.push(
      recommendedMission?.id
        ? `/sub-challenge?mission=${recommendedMission.id}`
        : "/sub-challenge",
    );
  };

  useEffect(() => {
    async function fetchAnalysisData() {
      if (!supabase) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) return;

        const [txRes, catRes] = await Promise.all([
          supabase.from("transactions").select("*").eq("user_id", user.id),
          supabase.from("categories").select("*"),
        ]);

        if (txRes.error) {
          return;
        }

        const categoryMap = {};
        if (catRes.data) {
          catRes.data.forEach(cat => {
            categoryMap[cat.id] = cat.name;
          });
        }

        if (txRes.data) {
          processAnalysisData(txRes.data, categoryMap);
        }
      } catch (err) {}
    }

    fetchAnalysisData();
  }, [supabase]);

  // ── AI 분석 리포트 별도 fetch ──
  useEffect(() => {
    let isMounted = true;

    async function fetchAi() {
      setIsAiLoading(true);
      setAiError(null);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("로그인 유저 정보를 찾을 수 없습니다.");
        }

        let data = await getAiAnalysis(supabase, user.id);

        if (!data?.analysis) {
          const todayKST = new Date().toLocaleDateString("sv-SE", {
            timeZone: "Asia/Seoul",
          });
          const periodStart = `${todayKST.slice(0, 7)}-01`;
          const periodEnd = todayKST;

          try {
            const { data: fnData, error: fnError } =
              await supabase.functions.invoke("analyze-spending", {
                body: {
                  analysisType: "monthly",
                  periodStart,
                  periodEnd,
                },
              });

            if (!fnError && fnData?.success && fnData?.analysis) {
              data = {
                analysis: fnData.analysis,
                recommendedMission: fnData.recommendedMission ?? null,
              };
            }
          } catch (fnErr) {}
        }

        if (!isMounted) return;

        setAiAnalysis(data?.analysis ?? null);
        setRecommendedMission(data?.recommendedMission ?? null);
      } catch (err) {
        if (isMounted) setAiError("AI 분석 데이터를 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    }

    fetchAi();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const processAnalysisData = (txData, categoryMap) => {
    // 1. 피드백 반영: 'expense' 타입인 항목만 정확히 지출로 필터링
    const allExpenses = txData.filter(tx => {
      const txType = String(tx.transaction_type || tx.type || "").toLowerCase();
      return txType === "expense";
    });

    // 2. 실제 데이터가 존재하는 월(YYYY-MM) 목록 동적 추출 및 정렬
    const monthSet = new Set();
    allExpenses.forEach(tx => {
      const rawDate =
        tx.transaction_at ||
        tx.date ||
        tx.dateValue ||
        tx.created_at ||
        tx.createdAt ||
        "";
      const dateString = String(rawDate).trim();
      const yearMatch = dateString.match(/20\d{2}/);
      const monthMatch =
        dateString.match(/[-./](\d{1,2})[-./]/) ||
        dateString.match(/20\d{2}[-./](\d{1,2})/);

      if (yearMatch && monthMatch) {
        const yyyy = yearMatch[0];
        const mm = String(parseInt(monthMatch[1], 10)).padStart(2, "0");
        monthSet.add(`${yyyy}-${mm}`);
      }
    });

    const activeMonths = Array.from(monthSet).sort();
    const totalMonthsCount = activeMonths.length;

    // 전체 지출 및 활성 월 기준 필터링
    const validExpenses = allExpenses.filter(tx => {
      const rawDate =
        tx.transaction_at ||
        tx.date ||
        tx.dateValue ||
        tx.created_at ||
        tx.createdAt ||
        "";
      const yearMatch = String(rawDate).match(/20\d{2}/);
      const monthMatch =
        String(rawDate).match(/[-./](\d{1,2})[-./]/) ||
        String(rawDate).match(/20\d{2}[-./](\d{1,2})/);
      if (!yearMatch || !monthMatch) return false;
      const key = `${yearMatch[0]}-${String(parseInt(monthMatch[1], 10)).padStart(2, "0")}`;
      return activeMonths.includes(key);
    });

    const total = validExpenses.reduce(
      (acc, cur) => acc + Math.abs(Number(cur.amount || 0)),
      0,
    );
    setTotalExpense(total);

    // 3. 피드백 반영: 무조건 /3이 아닌 실제 데이터가 있는 월 개수로 평균 계산
    const average =
      totalMonthsCount > 0 ? Math.round(total / totalMonthsCount) : 0;
    setMonthlyAverage(average);

    // 월별 집계 맵 생성
    const monthlyMap = {};
    activeMonths.forEach(m => {
      monthlyMap[m] = 0;
    });

    validExpenses.forEach(tx => {
      const yearMatch = String(tx.transaction_at || tx.date || "").match(
        /20\d{2}/,
      );
      const monthMatch = String(tx.transaction_at || tx.date || "").match(
        /[-./](\d{1,2})/,
      );
      if (yearMatch && monthMatch) {
        const key = `${yearMatch[0]}-${String(parseInt(monthMatch[1], 10)).padStart(2, "0")}`;
        if (monthlyMap[key] !== undefined) {
          monthlyMap[key] += Math.abs(Number(tx.amount || 0));
        }
      }
    });

    // 최고 월 지출 계산 (실제 지표용)
    const monthlyValues = Object.values(monthlyMap);
    setMaxMonthlyExpense(
      monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0,
    );

    // 전체 카테고리 통계 (도넛 차트용)
    const categoryStatsMap = {};
    validExpenses.forEach(tx => {
      const catName =
        categoryMap[tx.category_id] || tx.category || tx.categoryName || "기타";
      const amt = Math.abs(Number(tx.amount || 0));
      if (!categoryStatsMap[catName]) categoryStatsMap[catName] = 0;
      categoryStatsMap[catName] += amt;
    });

    const formattedCategoryData = Object.keys(categoryStatsMap).map(
      (name, index) => {
        const amount = categoryStatsMap[name];
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        return {
          name,
          amount,
          percentage,
          color: COLORS[index % COLORS.length],
        };
      },
    );
    formattedCategoryData.sort((a, b) => b.amount - a.amount);
    setCategoryData(formattedCategoryData);

    // 이번 달(가장 최근 활성 월) 데이터 추출
    const currentKey = activeMonths[activeMonths.length - 1] || "";
    const currentMonthExpenses = validExpenses.filter(tx => {
      const yearMatch = String(tx.transaction_at || tx.date || "").match(
        /20\d{2}/,
      );
      const monthMatch = String(tx.transaction_at || tx.date || "").match(
        /[-./](\d{1,2})/,
      );
      if (!yearMatch || !monthMatch) return false;
      const key = `${yearMatch[0]}-${String(parseInt(monthMatch[1], 10)).padStart(2, "0")}`;
      return key === currentKey;
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (acc, cur) => acc + Math.abs(Number(cur.amount || 0)),
      0,
    );
    setCurrentMonthExpense(currentMonthTotal);

    const currentMonthStatsMap = {};
    currentMonthExpenses.forEach(tx => {
      const catName =
        categoryMap[tx.category_id] || tx.category || tx.categoryName || "기타";
      const amt = Math.abs(Number(tx.amount || 0));
      if (!currentMonthStatsMap[catName]) currentMonthStatsMap[catName] = 0;
      currentMonthStatsMap[catName] += amt;
    });

    const formattedCurrentMonthData = Object.keys(currentMonthStatsMap).map(
      (name, index) => {
        const amount = currentMonthStatsMap[name];
        return {
          name,
          amount,
          color: COLORS[index % COLORS.length],
        };
      },
    );
    formattedCurrentMonthData.sort((a, b) => b.amount - a.amount);
    setCurrentMonthCategoryData(formattedCurrentMonthData);

    // 라인 차트 데이터 세팅
    const lineLabels = activeMonths.map(key => {
      const parts = key.split("-");
      return `${parseInt(parts[1], 10)}월`;
    });
    const lineValues = activeMonths.map(key => monthlyMap[key]);

    setLineChartData({
      labels: lineLabels,
      datasets: [
        {
          label: "지출",
          data: lineValues,
          borderColor: "#6366f1",
          backgroundColor: "#6366f1",
          tension: 0.3,
        },
      ],
    });
  };

  const hasExpense = categoryData.length > 0 && totalExpense > 0;
  const hasCurrentMonthExpense =
    currentMonthCategoryData.length > 0 && currentMonthExpense > 0;
  const hasLineData = lineChartData.labels.length > 0 && totalExpense > 0;

  // 피드백 반영: 현재 연월 동적 표시 (YYYY.MM)
  const currentDateObj = new Date();
  const currentYearMonthLabel = `${currentDateObj.getFullYear()}.${String(
    currentDateObj.getMonth() + 1,
  ).padStart(2, "0")}`;

  const todayLabel = currentDateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const comparison = aiAnalysis?.calculatedData?.comparison;
  const isOverspending =
    comparison?.available === true && comparison?.expenseChangePercent >= 10;

  const aiImageSrc = !hasExpense
    ? "/images/character/ai_empty_moa.png"
    : isOverspending
      ? "/images/character/poor_moa.png"
      : "/images/character/ai_moa.png";

  const renderAiMessage = message => {
    if (!message) return null;
    const parts = message.split(/(\d+(?:\.\d+)?%)/g);
    return parts.map((part, index) =>
      /^\d+(?:\.\d+)?%$/.test(part) ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      ),
    );
  };

  const doughnutData = {
    labels: hasExpense ? categoryData.map(item => item.name) : ["데이터 없음"],
    datasets: [
      {
        data: hasExpense ? categoryData.map(item => item.amount) : [1],
        backgroundColor: hasExpense
          ? categoryData.map(item => item.color)
          : ["#e2e8f0"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: hasExpense },
    },
    cutout: "75%",
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar />
      <div
        className={styles.contentWrapper}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <main className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>소비 분석</h1>
            <p className={styles.subtitle}>
              내 소비 데이터를 분석하여 체계적으로 관리하세요.
            </p>
          </div>

          <section className={`${styles.card} ${styles.aiReportCard}`}>
            {isAiLoading ? (
              <div
                className={styles.analyzingWrap}
                role="status"
                aria-live="polite"
              >
                <div className={styles.analyzingCharacter}>
                  <Image
                    src="/images/character/ai_moa.png"
                    alt="AI가 분석 중인 모아 캐릭터"
                    width={100}
                    height={100}
                  />
                </div>
                <p className={styles.analyzingTitle}>
                  AI가 소비 습관을 분석하고 있어요
                </p>
                <p className={styles.analyzingDesc}>
                  조금만 기다려주세요, 곧 리포트가 준비돼요.
                </p>
                <div className={styles.analyzingBar}>
                  <div className={styles.analyzingBarFill} />
                </div>
              </div>
            ) : aiError ? (
              <div className={styles.emptyAiReport}>
                <p>{aiError}</p>
              </div>
            ) : !aiAnalysis ? (
              <div className={styles.emptyAiReport}>
                <div className={styles.emptyIconBox}>
                  <span className="material-icons">assignment_add</span>
                </div>
                <h3>분석할 기록이 없어요!</h3>
                <p>소비 기록을 바탕으로 AI가 자산 관리를 도와드려요.</p>
                <button
                  type="button"
                  className={styles.actionBtnPrimary}
                  onClick={handleGoToSubChallenge}
                >
                  맞춤 미션 받기
                </button>
              </div>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <div className={styles.aiTitleGroup}>
                    <h3>AI 분석 리포트</h3>
                    <span className={styles.aiDate}>
                      ({aiAnalysis.updatedAt ?? todayLabel} 기준)
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.actionBtnInline}
                    onClick={handleGoToSubChallenge}
                  >
                    맞춤 미션 받기
                  </button>
                </div>

                <div className={styles.aiReportBody}>
                  <div className={styles.characterArea}>
                    <div className={styles.characterBox}>
                      <Image
                        src={aiImageSrc}
                        alt="AI 소비 분석 결과를 설명하는 모아 캐릭터"
                        width={247}
                        height={247}
                        className={styles.characterImage}
                      />
                    </div>
                  </div>

                  <div className={styles.insightContentArea}>
                    <div className={styles.insightTop}>
                      <div className={styles.insightHeader}>
                        <span className="material-icons">analytics</span>
                        <h4>분석</h4>
                      </div>
                      <p>
                        {renderAiMessage(
                          aiAnalysis.summary || aiAnalysis.homeSummary,
                        )}
                      </p>
                      {aiAnalysis.detail && (
                        <p className={styles.insightSub}>{aiAnalysis.detail}</p>
                      )}
                      {aiAnalysis.insight && (
                        <p className={styles.insightSub}>
                          {aiAnalysis.insight}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.aiReportGrid}>
                  <div className={styles.aiReportGridItem}>
                    <h5>
                      <span className="material-icons">trending_up</span>
                      예측
                    </h5>
                    <p>
                      {aiAnalysis.prediction ||
                        "소비 패턴을 기반으로 한 예측 데이터가 준비 중입니다."}
                    </p>
                  </div>
                  <div className={styles.aiReportGridItem}>
                    <h5>
                      <span className="material-icons">directions_run</span>
                      실행
                    </h5>
                    <p>
                      {aiAnalysis.actionSuggestion ||
                        "지출을 줄이기 위한 맞춤형 미션을 확인해 보세요."}
                    </p>
                  </div>
                  <div className={styles.aiReportGridItem}>
                    <h5>
                      <span className="material-icons">thumb_up</span>
                      피드백
                    </h5>
                    <p>
                      {aiAnalysis.feedback ||
                        "꾸준한 기록이 스마트한 자산 관리의 지름길입니다!"}
                    </p>
                  </div>
                </div>

                {aiAnalysis.mission_message && (
                  <div className={styles.aiMissionBanner}>
                    <span className="material-icons">campaign</span>
                    <p>{aiAnalysis.mission_message}</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* 요약 카드 영역: 200만원 가상 예산 카드 제거 및 실제 집계 지표로 대체 */}
          <div className={styles.summaryGrid}>
            <div className={styles.card}>
              <span className={styles.summaryLabel}>총 지출</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>
                  {totalExpense.toLocaleString()}
                </strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>전체 누적 지출</span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>월 평균 지출</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>
                  {monthlyAverage.toLocaleString()}
                </strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>
                실제 집계 월 기준 평균
              </span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>카테고리 수</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>
                  {categoryData.length}
                </strong>
                <span className={styles.unit}>개</span>
              </div>
              <span className={styles.summarySubText}>
                사용한 지출 카테고리
              </span>
            </div>

            <div className={styles.card}>
              <span className={styles.summaryLabel}>최고 월 지출</span>
              <div className={styles.summaryValueGroup}>
                <strong className={styles.summaryAmount}>
                  {maxMonthlyExpense.toLocaleString()}
                </strong>
                <span className={styles.unit}>원</span>
              </div>
              <span className={styles.summarySubText}>월별 최대 지출 금액</span>
            </div>
          </div>

          <div className={styles.gridContainer}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>지출 추이</h3>
                <div className={styles.selectBox}>활성 데이터 기준</div>
              </div>
              {hasLineData ? (
                <div className={styles.lineChartArea}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              ) : (
                <div className={styles.emptyChartArea}>
                  <div className={styles.emptyChartIcon}>
                    <span className="material-icons">trending_up</span>
                  </div>
                  <p className={styles.emptyTitle}>
                    표시 할 지출 데이터가 없어요.
                  </p>
                  <p className={styles.emptyDesc}>
                    장부에 지출을 기록해 그래프로 보여드려요.
                  </p>
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>카테고리별 소비 비중</h3>
              </div>
              {hasExpense ? (
                <>
                  <div className={styles.donutChartArea}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className={styles.donutCenterText}>
                      <span>총 지출</span>
                      <strong>{totalExpense.toLocaleString()}원</strong>
                    </div>
                  </div>
                  <ul className={styles.categoryLegendList}>
                    {categoryData.map(item => (
                      <li key={item.name}>
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
                </>
              ) : (
                <div className={styles.emptyChartArea}>
                  <div className={styles.emptyChartIcon}>
                    <span className="material-icons">donut_large</span>
                  </div>
                  <p className={styles.emptyTitle}>카테고리 데이터가 없어요.</p>
                  <p className={styles.emptyDesc}>
                    지출 내역을 장부에 작성해 확인할 수 있어요.
                  </p>
                </div>
              )}
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>이번 달 카테고리별 지출 비중</h3>
              <span className={styles.rankingDate}>
                {currentYearMonthLabel}
              </span>
            </div>
            {hasCurrentMonthExpense ? (
              <div className={styles.rankingList}>
                {currentMonthCategoryData
                  .slice(
                    0,
                    showAllRanking ? currentMonthCategoryData.length : 3,
                  )
                  .map((item, index) => {
                    const percent =
                      currentMonthExpense > 0
                        ? Math.min(
                            Math.round(
                              (item.amount / currentMonthExpense) * 100,
                            ),
                            100,
                          )
                        : 0;

                    return (
                      <div className={styles.rankingItem} key={item.name}>
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
                          {item.amount.toLocaleString()}원
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div
                className={styles.emptyChartArea}
                style={{ padding: "40px 0" }}
              >
                <div className={styles.emptyChartIcon}>
                  <span className="material-icons">bar_chart</span>
                </div>
                <p className={styles.emptyTitle}>비교 할 소비 내역이 없어요.</p>
                <p className={styles.emptyDesc}>
                  이번 달 지출 내역을 기록하면 비중을 확인할 수 있어요.
                </p>
              </div>
            )}
            {hasCurrentMonthExpense && currentMonthCategoryData.length > 3 && (
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setShowAllRanking(!showAllRanking)}
              >
                {showAllRanking ? "접기" : "더보기"}
              </button>
            )}
          </section>
        </main>

        <SubFooter />
      </div>
      <BottomTab />
    </div>
  );
}
