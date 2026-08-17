"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Challenge.module.scss";
import { createClient } from "@/utils/supabase/client";
import { getWeeklyJournals } from "../sub-home/services/subHomeService";

export default function Challenge() {
  const [missionTemplates, setMissionTemplates] = useState([]);
  const [aiMission, setAiMission] = useState(null);
  const [hasChallenge, setHasChallenge] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // 현재 진행중인 미션
  const [activeMission, setActiveMission] = useState(null);

  // 오늘 미션 완료 가능 여부 / 오늘 완료 여부
  const [canCompleteMission, setCanCompleteMission] = useState(false);
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);

  const [weekStates, setWeekStates] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // DB에서 불러올 카테고리 목록 상태
  const [categories, setCategories] = useState([]);

  // '더 보기' 사이드 탭 열림/닫힘 상태
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

  // 선택된 카테고리 code 상태 ("all"이 기본값)
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 소비 일기(저널) 데이터 상태 - 월~일 7일치 전체
  const [journals, setJournals] = useState([]);

  const supabase = createClient();

  const getTodayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  // KST 기준 오늘 날짜 문자열(YYYY-MM-DD) 반환 헬퍼 함수
  const getKstTodayString = () => {
    return new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  // 오늘 미션 완료 가능 여부 세팅 (저축 vs 일반 지출 미션 분기 처리)
  const checkTodayEligibility = async (
    currentMissionObj,
    todayIndex,
    weekStatesArr,
  ) => {
    // 이미 오늘 완료했다면 재확인할 필요 없음
    if (weekStatesArr[todayIndex]) {
      setIsTodayCompleted(true);
      setCanCompleteMission(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !currentMissionObj) return;

    const todayStr = getKstTodayString();

    const { data: todayTx, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        amount,
        transaction_type,
        category:categories ( code, name )
      `,
      )
      .eq("user_id", user.id)
      .gte("transaction_at", `${todayStr}T00:00:00`)
      .lte("transaction_at", `${todayStr}T23:59:59`);

    if (error) {
      console.error("오늘 거래 내역 조회 실패:", error.message);
      return;
    }

    const templateCode =
      currentMissionObj.mission_template?.code || currentMissionObj.code || "";
    const templateTitle =
      currentMissionObj.mission_template?.title ||
      currentMissionObj.title ||
      "";
    const categoryCode =
      currentMissionObj.mission_template?.category_code || "";

    // 저축 미션 여부 판별
    const isSavingMission =
      templateCode === "daily_saving" ||
      templateCode.includes("saving") ||
      templateTitle.includes("저축") ||
      categoryCode.includes("saving") ||
      categoryCode.includes("deposit");

    if (isSavingMission) {
      const hasSavingTx = (todayTx ?? []).some(tx => {
        const txCode = tx.category?.code || "";
        const txName = tx.category?.name || "";
        const lowerCode = txCode.toLowerCase();
        const lowerName = txName.toLowerCase();

        return (
          lowerCode.includes("saving") ||
          lowerCode.includes("deposit") ||
          lowerName.includes("저축") ||
          lowerName.includes("예금") ||
          lowerName.includes("적금") ||
          tx.transaction_type === "transfer"
        );
      });

      setCanCompleteMission(hasSavingTx);
    } else {
      const hasCategorySpending = (todayTx ?? []).some(
        tx => tx.category?.code === categoryCode,
      );
      setCanCompleteMission(!hasCategorySpending);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. mission_templates 테이블 조회
      const { data: templates, error: templateError } = await supabase
        .from("mission_templates")
        .select("*");

      let allTemplates = [];

      if (!templateError && templates && templates.length > 0) {
        allTemplates = templates;
        setAiMission(templates[0]);
        setMissionTemplates(templates.slice(1));
      } else if (templateError) {
        console.error("미션 템플릿 조회 실패:", templateError.message);
      }

      // 2. categories 테이블 조회
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!catError && catData) {
        const excludedNames = [
          "월급",
          "부수입",
          "상여",
          "금융소득",
          "용돈",
          "기타",
        ];
        const filteredCategories = catData.filter(
          cat => !excludedNames.includes(cat.name),
        );
        setCategories(filteredCategories);
      } else if (catError) {
        console.error("카테고리 조회 실패:", catError.message);
      }

      const todayStr = getKstTodayString();

      if (user) {
        // 이번 주 월~일 날짜 범위 계산
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        const distanceToMonday =
          currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);
        const mondayStr = monday.toISOString().split("T")[0];

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const sundayStr = sunday.toISOString().split("T")[0];

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          weekDates.push(d.toISOString().split("T")[0]);
        }

        // 3. 미션 기록 조회 (이번 주에 오늘 날짜로 완료된 기록이 있는지 확인)
        const { data: records, error: recordError } = await supabase
          .from("mission_records")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_completed", true)
          .gte("record_date", mondayStr)
          .lte("record_date", sundayStr);

        let newWeekStates = weekStates;
        let todayCompleted = false;

        if (!recordError && records) {
          newWeekStates = weekDates.map(dateStr => {
            return records.some(record => record.record_date === dateStr);
          });
          setWeekStates(newWeekStates);

          // 오늘 날짜에 해당하는 기록이 있는지 체크
          const todayIndex = getTodayIndex();
          todayCompleted = newWeekStates[todayIndex];
        }

        // 4. 사용자가 시작한 미션 조회
        const { data: userMissions, error: userMissionError } = await supabase
          .from("user_missions")
          .select(
            `
            *,
            mission_template:mission_templates (
              id,
              code,
              category_code,
              title
            )
          `,
          )
          .eq("user_id", user.id)
          .order("start_date", { ascending: false })
          .limit(5);

        let currentMission = null;

        if (!userMissionError && userMissions && userMissions.length > 0) {
          // 오늘 날짜이거나 진행 중인 미션 찾기
          currentMission =
            userMissions.find(
              m => m.status === "in_progress" || m.start_date === todayStr,
            ) || userMissions[0];
        }

        if (currentMission) {
          setActiveMission(currentMission);
          setCompletedCount(currentMission.completed_count || 0);

          const matchedTemplate = allTemplates.find(
            t => t.id === currentMission.mission_template_id,
          );

          if (matchedTemplate) {
            setAiMission(matchedTemplate);
            setMissionTemplates(
              allTemplates.filter(t => t.id !== matchedTemplate.id),
            );
          }

          if (todayCompleted) {
            // 오늘 이미 완료했다면 상태를 완료로 고정
            setHasChallenge(true);
            setIsTodayCompleted(true);
            setCanCompleteMission(false);
          } else {
            setHasChallenge(true);
            await checkTodayEligibility(
              currentMission,
              getTodayIndex(),
              newWeekStates,
            );
          }
        }

        // 5. 주간 소비 일기 데이터 조회
        const weeklyJournals = await getWeeklyJournals(supabase, user.id);
        if (weeklyJournals) {
          setJournals(weeklyJournals);
        }
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const getMissionIconPath = template => {
    let code = template?.category_code || template?.category;
    if (!code) return "/images/category/food.png";
    if (code === "saving_transfer") {
      code = "savings";
    }
    return `/images/category/${code}.png`;
  };

  const handleSwitchAiMission = selectedTemplate => {
    if (hasChallenge) {
      alert(
        "이미 진행 중인 미션이 있어요. 현재 미션을 완료한 뒤에 다른 미션을 선택할 수 있습니다.",
      );
      return;
    }

    if (!aiMission) return;
    const updatedTemplates = missionTemplates.map(t =>
      t.id === selectedTemplate.id ? aiMission : t,
    );
    setAiMission(selectedTemplate);
    setMissionTemplates(updatedTemplates);
    setIsMoreModalOpen(false);
  };

  const handleSelectMission = async (templateId, templateTitle) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const dateString = getKstTodayString();

    const { data: inserted, error } = await supabase
      .from("user_missions")
      .insert([
        {
          user_id: user.id,
          mission_template_id: templateId,
          title: templateTitle,
          start_date: dateString,
          end_date: dateString,
          status: "in_progress",
          recommendation_source: "system",
          completed_count: 0,
        },
      ])
      .select(
        `
        *,
        mission_template:mission_templates (
          id,
          code,
          category_code,
          title
        )
      `,
      )
      .single();

    if (error) {
      console.error("미션 선택 실패:", error.message);
      alert("미션 선택 중 오류가 발생했습니다: " + error.message);
    } else {
      alert("미션이 시작되었습니다!");
      setHasChallenge(true);
      setCompletedCount(0);
      setActiveMission(inserted);

      await checkTodayEligibility(inserted, getTodayIndex(), weekStates);
    }
  };

  const handleCompleteMission = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !activeMission) return;

    const todayStr = getKstTodayString();

    const { error } = await supabase.from("mission_records").insert([
      {
        user_mission_id: activeMission.id,
        user_id: user.id,
        record_date: todayStr,
        is_completed: true,
      },
    ]);

    if (error) {
      console.error("미션 완료 처리 실패:", error.message);
      alert("미션 완료 처리 중 오류가 발생했습니다: " + error.message);
      return;
    }

    const newCompletedCount = completedCount + 1;

    const { error: updateError } = await supabase
      .from("user_missions")
      .update({
        completed_count: newCompletedCount,
        status: "completed",
      })
      .eq("id", activeMission.id);

    if (updateError) {
      console.error("완료 상태 업데이트 실패:", updateError.message);
    }

    setCompletedCount(newCompletedCount);

    const todayIndex = getTodayIndex();
    setWeekStates(prev => {
      const next = [...prev];
      next[todayIndex] = true;
      return next;
    });

    setIsTodayCompleted(true);
    setCanCompleteMission(false);
    // 완료 후에도 미션 카드가 유지되도록 hasChallenge를 false로 바꾸지 않고 그대로 유지합니다.
    setHasChallenge(true);
  };

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const challengeDays = [1, 2, 3, 4, 5, 6, 7];
  const displayedTemplates = missionTemplates.slice(0, 8);

  const filteredTemplates =
    selectedCategory === "all"
      ? missionTemplates
      : missionTemplates.filter(
          t =>
            t.category === selectedCategory ||
            t.category_code === selectedCategory,
        );

  const getButtonLabel = () => {
    if (!hasChallenge) return "미션 시작하기";
    if (isTodayCompleted) return "오늘 미션 완료 ✅";
    if (canCompleteMission) return "미션 완료하기";
    return "미션 진행 중";
  };

  const getGoalStatusText = () => {
    if (!hasChallenge) return "0/1회 달성";
    if (isTodayCompleted) return `${completedCount}/1회 달성 (오늘 완료)`;

    const templateCode = aiMission?.code || "";
    const title = aiMission?.title || "";
    const isSaving = templateCode === "daily_saving" || title.includes("저축");

    if (canCompleteMission) {
      return `${completedCount + 1}/1회 달성 (완료 가능)`;
    }
    return `${completedCount}/1회 달성 (완료 불가 · ${isSaving ? "저축 내역 없음" : "해당 카테고리 지출 있음"})`;
  };

  const isButtonDisabled = hasChallenge && !canCompleteMission;

  const handleActionBtnClick = () => {
    if (!hasChallenge) {
      aiMission && handleSelectMission(aiMission.id, aiMission.title);
      return;
    }
    if (canCompleteMission) {
      handleCompleteMission();
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <main className={styles.main}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.title}>챌린지</h1>
              <p className={styles.subtitle}>
                미션으로 작은 습관을 만들어 보세요!
              </p>
            </div>

            <div className={styles.gridContainer}>
              <div className={styles.leftColumn}>
                <section className={styles.card}>
                  <div className={styles.aiBadge}>추천 미션</div>
                  <div className={styles.missionContent}>
                    <div className={styles.missionCardIcon}>
                      <Image
                        src={
                          aiMission
                            ? getMissionIconPath(aiMission)
                            : "/images/category/food.png"
                        }
                        alt="미션 아이콘"
                        width={56}
                        height={56}
                      />
                    </div>
                    <h3>{aiMission?.title || "저축하기"}</h3>
                    <p>
                      {aiMission?.description ||
                        "정해둔 금액을 저축하며 목표에 가까워져 보세요."}
                    </p>
                  </div>
                  <div className={styles.missionGoalRow}>
                    <span className={styles.goalLabel}>오늘의 미션 목표</span>
                    <span className={styles.goalStatus}>
                      {getGoalStatusText()}
                    </span>
                  </div>
                  <button
                    className={`${styles.actionBtn} ${
                      isButtonDisabled ? styles.actionBtnDisabled : ""
                    }`}
                    onClick={handleActionBtnClick}
                    disabled={isButtonDisabled}
                  >
                    {getButtonLabel()}
                  </button>
                </section>

                <section className={styles.card}>
                  <h3>주간 챌린지 진행 현황</h3>
                  <div
                    className={styles.challengeCalendar}
                    style={{ marginTop: "16px" }}
                  >
                    <div
                      className={styles.challengeDays}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {challengeDays.map((dayNum, index) => {
                        const weekday = weekDays[index];
                        const isCompleted = weekStates[index];

                        return (
                          <div
                            key={dayNum}
                            className={styles.challengeDay}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: "bold",
                                color: "#333",
                                fontSize: "14px",
                              }}
                            >
                              {weekday}
                            </span>
                            <div
                              className={`${styles.challengeIcon} ${
                                isCompleted
                                  ? styles.completedChallengeIcon
                                  : styles.inactiveChallengeIcon
                              }`}
                            >
                              <Image
                                src="/images/challenge/sprout.png"
                                alt=""
                                width={24}
                                height={24}
                                aria-hidden="true"
                              />
                            </div>
                            <span style={{ fontSize: "12px", color: "#888" }}>
                              {dayNum}일차
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>

              <div className={styles.rightColumn}>
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>다른 추천 미션</h3>
                    <span
                      className={styles.moreText}
                      onClick={() => {
                        setSelectedCategory("all");
                        setIsMoreModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      더 보기 &gt;
                    </span>
                  </div>
                  <div className={styles.missionGrid}>
                    {displayedTemplates.map(template => {
                      return (
                        <div
                          key={template.id}
                          className={styles.missionItemCard}
                        >
                          <div className={styles.missionCardIcon}>
                            <Image
                              src={getMissionIconPath(template)}
                              alt={template.title}
                              width={48}
                              height={48}
                            />
                          </div>
                          <span className={styles.missionCardTitle}>
                            {template.title}
                          </span>
                          <button
                            className={`${styles.missionCardBtn} ${
                              hasChallenge ? styles.actionBtnDisabled : ""
                            }`}
                            onClick={() => handleSwitchAiMission(template)}
                            disabled={hasChallenge}
                          >
                            미션 선택
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>나의 소비 기록</h3>
                    <span
                      className={styles.moreText}
                      style={{ cursor: "pointer" }}
                    >
                      기록 더보기 &gt;
                    </span>
                  </div>

                  <div className={styles.historyList}>
                    {journals.map(journal => (
                      <div key={journal.id} className={styles.historyItemCard}>
                        <span className={styles.historyDate}>
                          {journal.date}
                        </span>
                        <span className={styles.historyAmount}>
                          {journal.amount}
                        </span>

                        <div
                          className={`${styles.historyCharacterBox} ${
                            journal.pending
                              ? styles.historyCharacterBoxEmpty
                              : ""
                          }`}
                        >
                          <Image
                            src={journal.image}
                            alt={journal.content}
                            width={80}
                            height={80}
                          />
                        </div>

                        <p className={styles.historyMessage}>
                          {journal.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
        <SubFooter />
      </div>
      <BottomTab />

      {isMoreModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsMoreModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>모든 추천 미션</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsMoreModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.categoryFilterGrid}>
              <button
                className={`${styles.categoryFilterBtn} ${selectedCategory === "all" ? styles.active : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                전체
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryFilterBtn} ${selectedCategory === cat.code ? styles.active : ""}`}
                  onClick={() => setSelectedCategory(cat.code)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className={styles.modalMissionGrid}>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => {
                  return (
                    <div
                      key={template.id}
                      className={styles.modalMissionItemCard}
                    >
                      <div className={styles.modalMissionCardIcon}>
                        <Image
                          src={getMissionIconPath(template)}
                          alt={template.title}
                          width={48}
                          height={48}
                        />
                      </div>
                      <span className={styles.modalMissionCardTitle}>
                        {template.title}
                      </span>
                      <button
                        className={`${styles.modalMissionCardBtn} ${
                          hasChallenge ? styles.actionBtnDisabled : ""
                        }`}
                        onClick={() => handleSwitchAiMission(template)}
                        disabled={hasChallenge}
                      >
                        미션 선택
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className={styles.emptyMessage}>
                  해당 카테고리의 미션이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
