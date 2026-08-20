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
          console.error("거래 내역 조회 에러:", txRes.error.message);
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
      } catch (err) {
        console.error("Supabase 연동 오류:", err);
      }
    }

    fetchAnalysisData();
  }, [supabase]);

  // ── AI 분석 리포트 별도 fetch (subHomeService와 동일한 구조 연동) ──
  useEffect(() => {
    let isMounted = true;

    async function fetchAi() {
      setIsAiLoading(true);
      setAiError(null);
      try {
        // 1. 유저 정보를 먼저 조회하여 user.id 확보
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("로그인 유저 정보를 찾을 수 없습니다.");
        }

        // 2. getAiAnalysis에 supabase와 user.id를 모두 전달
        let data = await getAiAnalysis(supabase, user.id);

        // 3. 이번 달 리포트가 아직 생성되지 않은 경우(서브홈을 거치지 않은 경우 등)
        //    analyze-spending 함수를 직접 호출해 생성을 요청한다.
        //    이 함수는 auth 세션에서 user를 자동으로 인식하므로 user_id는 보내지 않고,
        //    analysisType / periodStart / periodEnd(camelCase, 문자열)를 반드시 보내야 한다.
        //    이미 동일 기간의 완료된 리포트가 있으면 AI를 다시 호출하지 않고 재사용해서 반환한다.
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

            if (fnError) {
              if (fnError.context) {
                try {
                  const detail = await fnError.context.json();
                  console.error(
                    "AI 분석 리포트 생성 요청 실패 (서버 응답):",
                    detail,
                  );
                } catch {
                  const text = await fnError.context.text?.();
                  console.error(
                    "AI 분석 리포트 생성 요청 실패 (서버 응답 텍스트):",
                    text,
                  );
                }
              } else {
                console.error("AI 분석 리포트 생성 요청 실패:", fnError);
              }
            } else if (fnData?.success && fnData?.analysis) {
              // 함수가 바로 최신 분석 결과를 반환하므로 재조회 없이 그대로 사용
              data = {
                analysis: fnData.analysis,
                recommendedMission: fnData.recommendedMission ?? null,
              };
            } else if (fnData?.success && fnData?.analysisAvailable === false) {
              // 소비 데이터 자체가 없는 경우(NO_DATA) — 빈 상태로 둔다
              data = { analysis: null, recommendedMission: null };
            }
          } catch (fnErr) {
            if (fnErr?.context) {
              try {
                const detail = await fnErr.context.json();
                console.error(
                  "analyze-spending 함수 호출 오류 (서버 응답):",
                  detail,
                );
              } catch {
                const text = await fnErr.context.text?.();
                console.error(
                  "analyze-spending 함수 호출 오류 (서버 응답 텍스트):",
                  text,
                );
              }
            } else {
              console.error("analyze-spending 함수 호출 오류:", fnErr);
            }
          }
        }

        if (!isMounted) return;

        // getAiAnalysis는 { analysis, recommendedMission } 형태로 반환되므로
        // 실제 리포트 내용은 data.analysis에서 꺼내야 함
        setAiAnalysis(data?.analysis ?? null);
        setRecommendedMission(data?.recommendedMission ?? null);
      } catch (err) {
        console.error("AI 분석 리포트 조회 실패:", err);
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
    const allExpenses = txData.filter(tx => {
      const txType = String(tx.transaction_type || tx.type || "").toLowerCase();
      const txLabel = String(tx.typeLabel || "").toLowerCase();

      if (
        txType.includes("income") ||
        txType.includes("수입") ||
        txLabel.includes("수입")
      ) {
        return false;
      }

      const isExpenseType =
        txType.includes("expense") ||
        txType.includes("지출") ||
        txType.includes("out");

      const rawAmount = Number(tx.amount || 0);

      return (
        isExpenseType ||
        rawAmount < 0 ||
        txLabel.includes("지출") ||
        rawAmount > 0
      );
    });

    const today = new Date();
    const targetMonthKeys = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      targetMonthKeys.push(`${yyyy}-${mm}`);
    }

    const recent3MonthsExpenses = allExpenses
      .map(tx => {
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

        let monthKey = "";
        if (yearMatch && monthMatch) {
          const yyyy = yearMatch[0];
          const mm = String(parseInt(monthMatch[1], 10)).padStart(2, "0");
          monthKey = `${yyyy}-${mm}`;
        }

        return {
          ...tx,
          _monthKey: monthKey,
        };
      })
      .filter(tx => targetMonthKeys.includes(tx._monthKey));

    const total = recent3MonthsExpenses.reduce(
      (acc, cur) => acc + Math.abs(Number(cur.amount || 0)),
      0,
    );
    setTotalExpense(total);

    const categoryStatsMap = {};
    recent3MonthsExpenses.forEach(tx => {
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

    const monthlyMap = {};
    targetMonthKeys.forEach(key => {
      monthlyMap[key] = 0;
    });

    recent3MonthsExpenses.forEach(tx => {
      if (monthlyMap[tx._monthKey] !== undefined) {
        monthlyMap[tx._monthKey] += Math.abs(Number(tx.amount || 0));
      }
    });

    const currentKey = targetMonthKeys[targetMonthKeys.length - 1];
    setCurrentMonthExpense(monthlyMap[currentKey] || 0);

    const currentMonthStatsMap = {};
    const currentMonthExpenses = recent3MonthsExpenses.filter(
      tx => tx._monthKey === currentKey,
    );

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

    const lineLabels = targetMonthKeys.map(key => {
      const parts = key.split("-");
      return `${parseInt(parts[1], 10)}월`;
    });
    const lineValues = targetMonthKeys.map(key => monthlyMap[key]);

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

    setMonthlyAverage(Math.round(total / 3));
  };

  const hasExpense = categoryData.length > 0 && totalExpense > 0;
  const hasCurrentMonthExpense =
    currentMonthCategoryData.length > 0 && currentMonthExpense > 0;
  const hasLineData = totalExpense > 0;
  const hasSpendingData = totalExpense > 0;

  const comparison = aiAnalysis?.calculatedData?.comparison;
  const isOverspending =
    comparison?.available === true && comparison?.expenseChangePercent >= 10;

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const aiImageSrc = !hasSpendingData
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
        <main className={styles.main}>
          <div className="container">
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
                          <p className={styles.insightSub}>
                            {aiAnalysis.detail}
                          </p>
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

            <div className={styles.summaryGrid}>
              <div className={styles.card}>
                <span className={styles.summaryLabel}>총 지출</span>
                <div className={styles.summaryValueGroup}>
                  <strong className={styles.summaryAmount}>
                    {totalExpense.toLocaleString()}
                  </strong>
                  <span className={styles.unit}>원</span>
                </div>
                <span className={styles.summarySubText}>최근 3개월 누적</span>
              </div>

              <div className={styles.card}>
                <span className={styles.summaryLabel}>월 평균 지출</span>
                <div className={styles.summaryValueGroup}>
                  <strong className={styles.summaryAmount}>
                    {monthlyAverage.toLocaleString()}
                  </strong>
                  <span className={styles.unit}>원</span>
                </div>
                <span className={styles.summarySubText}>최근 3개월 평균</span>
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
                  현재까지 지출 카테고리
                </span>
              </div>

              <div className={styles.card}>
                <span className={styles.summaryLabel}>이번 달 남은 예산</span>
                <div className={styles.summaryValueGroup}>
                  <strong className={styles.summaryAmount}>
                    {(2000000 - currentMonthExpense).toLocaleString()}
                  </strong>
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
                  <div className={styles.selectBox}>최근 3개월</div>
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
                            <span className={styles.legendName}>
                              {item.name}
                            </span>
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
                    <p className={styles.emptyTitle}>
                      카테고리 데이터가 없어요.
                    </p>
                    <p className={styles.emptyDesc}>
                      지출 내역을 장부에 작성해 확인할 수 있어요.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>예산 대비 지출 랭킹</h3>
                <span className={styles.rankingDate}>2026.08</span>
              </div>
              {hasCurrentMonthExpense ? (
                <div className={styles.rankingList}>
                  {currentMonthCategoryData
                    .slice(
                      0,
                      showAllRanking ? currentMonthCategoryData.length : 3,
                    )
                    .map((item, index) => {
                      const budget = 300000;
                      const percent = Math.min(
                        Math.round((item.amount / budget) * 100),
                        100,
                      );

                      return (
                        <div className={styles.rankingItem} key={item.name}>
                          <span className={`${styles.rankBadge} ${styles.r1}`}>
                            {index + 1}
                          </span>
                          <span className={styles.rankCategory}>
                            {item.name}
                          </span>
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
                  <p className={styles.emptyTitle}>
                    비교 할 소비 내역이 없어요.
                  </p>
                  <p className={styles.emptyDesc}>
                    매달 예산과 지출을 비교해 그래프로 보여드려요.
                  </p>
                </div>
              )}
              {hasCurrentMonthExpense &&
                currentMonthCategoryData.length > 3 && (
                  <button
                    type="button"
                    className={styles.moreBtn}
                    onClick={() => setShowAllRanking(!showAllRanking)}
                  >
                    {showAllRanking ? "접기" : "더보기"}
                  </button>
                )}
            </section>
          </div>
        </main>

        <SubFooter />
      </div>
      <BottomTab />
    </div>
  );
}
