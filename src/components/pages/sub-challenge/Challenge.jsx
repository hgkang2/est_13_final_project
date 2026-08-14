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

  // 요일별 달성 상태 (월~일, 총 7개 boolean 배열)
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

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. mission_templates 테이블 조회
      const { data: templates, error: templateError } = await supabase
        .from("mission_templates")
        .select("*");

      if (!templateError && templates && templates.length > 0) {
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
        // 3. 사용자가 이미 시작한 미션 조회
        const { data: userMissions, error: userMissionError } = await supabase
          .from("user_missions")
          .select("*")
          .eq("user_id", user.id);

        if (!userMissionError && userMissions && userMissions.length > 0) {
          setHasChallenge(true);
          setCompletedCount(userMissions[0].completed_count || 0);
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

        // 4. 미션 기록 조회 (400 에러 방지를 위해 전체 컬럼 SELECT 후 클라이언트 측에서 필터링)
        const { data: records, error: recordError } = await supabase
          .from("mission_records")
          .select("*")
          .eq("user_id", user.id);

        if (!recordError && records) {
          const newWeekStates = weekDates.map(dateStr => {
            return records.some(record => {
              const recordDate =
                record.completed_date ||
                record.date ||
                (record.created_at ? record.created_at.split("T")[0] : "");
              return recordDate === dateStr;
            });
          });
          setWeekStates(newWeekStates);
        } else if (recordError) {
          console.warn(
            "미션 기록 조회 스킵 또는 테이블 확인 필요:",
            recordError.message,
          );
        }

        // 5. 주간 소비 일기 데이터 조회 (getWeeklyJournals 유틸 함수 활용, 월~일 7일치 전체)
        const weeklyJournals = await getWeeklyJournals(supabase, user.id);
        if (weeklyJournals) {
          setJournals(weeklyJournals);
        }
      }
    }

    fetchData();
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

    const { error } = await supabase.from("user_missions").insert([
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
    ]);

    if (error) {
      console.error("미션 선택 실패:", error.message);
      alert("미션 선택 중 오류가 발생했습니다: " + error.message);
    } else {
      alert("미션이 시작되었습니다!");
      setHasChallenge(true);
      setCompletedCount(0);
    }
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
                  <div className={styles.aiBadge}>AI 추천 미션</div>
                  <div className={styles.missionContent}>
                    <div className={styles.missionCardIcon}>
                      <Image
                        src={
                          aiMission
                            ? getMissionIconPath(aiMission)
                            : "/images/category/food.png"
                        }
                        alt="미션 아이콘"
                        width={28}
                        height={28}
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
                      {hasChallenge
                        ? `${completedCount}/1회 달성 (진행 중)`
                        : "0/1회 달성"}
                    </span>
                  </div>
                  <button
                    className={`${styles.actionBtn} ${hasChallenge ? styles.actionBtnDisabled : ""}`}
                    onClick={() =>
                      aiMission &&
                      !hasChallenge &&
                      handleSelectMission(aiMission.id, aiMission.title)
                    }
                  >
                    {hasChallenge ? "미션 진행 중" : "미션 시작하기"}
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
                                !isCompleted ? styles.inactiveChallengeIcon : ""
                              }`}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "#f7f9f8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #eee",
                                opacity: !isCompleted ? 0.4 : 1,
                              }}
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
                              width={24}
                              height={24}
                            />
                          </div>
                          <span className={styles.missionCardTitle}>
                            {template.title}
                          </span>
                          <button
                            className={styles.missionCardBtn}
                            onClick={() => handleSwitchAiMission(template)}
                          >
                            미션 선택
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 그림일기 스타일 그대로, 제목만 "나의 소비 기록"으로 유지한 카드 */}
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
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className={styles.modalMissionCardTitle}>
                        {template.title}
                      </span>
                      <button
                        className={styles.modalMissionCardBtn}
                        onClick={() => handleSwitchAiMission(template)}
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
