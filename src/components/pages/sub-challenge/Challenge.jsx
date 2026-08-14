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

  // 오늘 해당 카테고리 지출이 있는지 확인해서 완료 가능 여부 세팅
  const checkTodayEligibility = async (
    categoryCode,
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

    if (!user || !categoryCode) return;

    const todayStr = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });

    const { data: todayTx, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        category:categories ( code )
      `,
      )
      .eq("user_id", user.id)
      .eq("transaction_type", "expense")
      .gte("transaction_at", `${todayStr}T00:00:00`)
      .lte("transaction_at", `${todayStr}T23:59:59`);

    if (error) {
      console.error("오늘 소비 내역 조회 실패:", error.message);
      return;
    }

    const hasCategorySpending = (todayTx ?? []).some(
      tx => tx.category?.code === categoryCode,
    );

    // 해당 카테고리 지출이 없으면 완료 가능
    setCanCompleteMission(!hasCategorySpending);
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

      // ✅ 전체 템플릿 목록을 별도로 보관 (나중에 진행중인 미션과 매칭하기 위함)
      let allTemplates = [];

      if (!templateError && templates && templates.length > 0) {
        allTemplates = templates;
        setAiMission(templates[0]);
        setMissionTemplates(templates.slice(1));
      } else if (templateError) {
        console.error("미션 템플릿 조회 실패:", templateError.message);
      }

      // 2. categories 테이블 조회 (수입 관련 항목 제외 필터링)
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

      if (user) {
        // 3. 사용자가 이미 시작한(진행중인) 미션 조회 - 카테고리 정보 함께 조인
        //    status 필터 없이 우선 전체 조회 → 최신순으로 클라이언트에서 진행중 판단
        //    (status 컬럼명/값이 실제 스키마와 다를 수 있어 원인 파악을 위해 전체 조회로 변경)
        const { data: userMissions, error: userMissionError } = await supabase
          .from("user_missions")
          .select(
            `
            *,
            mission_template:mission_templates (
              id,
              category_code,
              title
            )
          `,
          )
          .eq("user_id", user.id)
          .order("start_date", { ascending: false })
          .limit(5);

        // 디버깅용 - 콘솔에서 실제 응답 확인 (원인 파악되면 삭제해도 됩니다)
        console.log("userMissions 조회 결과:", userMissions, userMissionError);

        let currentMission = null;

        if (!userMissionError && userMissions && userMissions.length > 0) {
          // status 값이 실제로 뭔지 모르므로, "completed_count가 0이거나 아직 안 끝난 것으로 보이는" 최신 미션을 진행중으로 간주
          // → 정확한 필터링은 status 실제 값 확인 후 .eq("status", "실제값")으로 되돌려야 함
          currentMission =
            userMissions.find(m => m.status === "in_progress") ??
            userMissions[0];

          setHasChallenge(true);
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
        } else if (userMissionError) {
          console.error("진행중인 미션 조회 실패:", userMissionError.message);
        }

        // 이번 주 월~일 날짜 구하기
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        const distanceToMonday =
          currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          weekDates.push(d.toISOString().split("T")[0]);
        }

        // 4. 미션 기록 조회 (완료된 기록만)
        const { data: records, error: recordError } = await supabase
          .from("mission_records")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_completed", true);

        let newWeekStates = weekStates;

        if (!recordError && records) {
          newWeekStates = weekDates.map(dateStr => {
            return records.some(record => record.record_date === dateStr);
          });
          setWeekStates(newWeekStates);
        } else if (recordError) {
          console.warn("미션 기록 조회 실패:", recordError.message);
        }

        // 5. 오늘 미션 완료 가능 여부 체크 (진행중인 미션이 있을 때만)
        if (currentMission) {
          const categoryCode = currentMission.mission_template?.category_code;
          await checkTodayEligibility(
            categoryCode,
            getTodayIndex(),
            newWeekStates,
          );
        }

        // 6. 주간 소비 일기 데이터 조회 (getWeeklyJournals 유틸 함수 활용, 월~일 7일치 전체)
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

  // 다른 추천 미션의 "미션 선택" 클릭 → 진행중인 미션이 있으면 차단
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

    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

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
          category_code,
          title
        )
      `,
      )
      .single();

    console.log("미션 insert 결과:", inserted, error);

    if (error) {
      console.error("미션 선택 실패:", error.message);
      alert("미션 선택 중 오류가 발생했습니다: " + error.message);
    } else {
      alert("미션이 시작되었습니다!");
      setHasChallenge(true);
      setCompletedCount(0);
      setActiveMission(inserted);

      // 새로 시작한 미션 기준으로 오늘 완료 가능 여부 재확인
      const categoryCode = inserted?.mission_template?.category_code;
      await checkTodayEligibility(categoryCode, getTodayIndex(), weekStates);
    }
  };

  // 미션 완료 처리
  const handleCompleteMission = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !activeMission) return;

    const todayStr = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });

    // 미션 기록 추가
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

    // user_missions의 completed_count 갱신
    const { error: updateError } = await supabase
      .from("user_missions")
      .update({ completed_count: newCompletedCount })
      .eq("id", activeMission.id);

    if (updateError) {
      console.error("완료 횟수 업데이트 실패:", updateError.message);
    }

    setCompletedCount(newCompletedCount);

    // 오늘 요일 스탬프 채우기
    const todayIndex = getTodayIndex();
    setWeekStates(prev => {
      const next = [...prev];
      next[todayIndex] = true;
      return next;
    });

    setIsTodayCompleted(true);
    setCanCompleteMission(false);
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

  // 버튼 상태 계산
  const getButtonLabel = () => {
    if (!hasChallenge) return "미션 시작하기";
    if (isTodayCompleted) return "오늘 미션 완료 ✅";
    if (canCompleteMission) return "미션 완료하기";
    return "미션 진행 중";
  };

  // 목표 달성 라인의 상태 텍스트 (완료 가능 / 불가능 여부 표시)
  const getGoalStatusText = () => {
    if (!hasChallenge) return "0/1회 달성";
    if (isTodayCompleted) return `${completedCount}/1회 달성 (오늘 완료)`;
    //완료 가능한 상태면 완료했을 때의 값(+1)을 미리 보여줌
    if (canCompleteMission) return `${completedCount + 1}/1회 달성 (완료 가능)`;
    return `${completedCount}/1회 달성 (완료 불가 · 해당 카테고리 지출 있음)`;
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
                    <h3>{aiMission?.title || "외식 줄이기"}</h3>
                    <p>
                      {aiMission?.description ||
                        "이번 주 1회 이하로 외식하고 집밥으로 해결해보세요!"}
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
