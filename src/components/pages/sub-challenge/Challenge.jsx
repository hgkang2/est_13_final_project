"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Challenge.module.scss";
import { createClient } from "@/utils/supabase/client";

// DB의 code 값 또는 title에 맞는 Material Icon 매핑 딕셔너리
const missionIconMap = {
  reduce_dining_out: "restaurant",
  reduce_cafe: "local_cafe",
  reduce_delivery: "two_wheeler",
  save_transportation: "directions_bus",
  organize_subscriptions: "subscriptions",
  use_tumbler: "local_drink",
  prevent_impulse_buying: "shopping_bag",
  save_electricity: "flash_on",
  daily_saving: "savings",
  "외식 줄이기": "restaurant",
  "카페 줄이기": "local_cafe",
  "배달 줄이기": "two_wheeler",
  "교통비 절약": "directions_bus",
  "구독 정리": "subscriptions",
  "텀블러 사용": "local_drink",
  "충동구매 방지": "shopping_bag",
  "전기 절약": "flash_on",
  저축하기: "savings",
};

export default function Challenge() {
  const [missionTemplates, setMissionTemplates] = useState([]);
  const [aiMission, setAiMission] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [hasChallenge, setHasChallenge] = useState(false);

  // DB에서 불러올 카테고리 목록 상태
  const [categories, setCategories] = useState([]);

  // '더 보기' 사이드 탭 열림/닫힘 상태
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

  // 선택된 카테고리 code 상태 ("all"이 기본값)
  const [selectedCategory, setSelectedCategory] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
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

      // 3. transactions 테이블 조회
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .limit(4);

      if (!txError && txData) {
        setTransactions(txData);
      } else if (txError) {
        console.error("거래 내역 조회 실패:", txError.message);
      }
    }

    fetchData();
  }, [supabase]);

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

    const { error } = await supabase.from("user_missions").insert([
      {
        user_id: user.id,
        mission_template_id: templateId,
        title: templateTitle,
      },
    ]);

    if (error) {
      console.error("미션 선택 실패:", error.message);
      alert("미션 선택 중 오류가 발생했습니다.");
    } else {
      alert("미션이 시작되었습니다!");
      setHasChallenge(true);
    }
  };

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const challengeDays = [1, 2, 3, 4, 5, 6, 7];

  // 메인 화면에는 상위 8개만 표시
  const displayedTemplates = missionTemplates.slice(0, 8);

  // 사이드 탭에서 선택된 카테고리(code)에 따라 미션 필터링
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
              {/* 좌측 열: AI 추천 미션 및 진행 현황 */}
              <div className={styles.leftColumn}>
                <section className={styles.card}>
                  <div className={styles.aiBadge}>AI 추천 미션</div>
                  <div className={styles.missionContent}>
                    <div className={styles.missionCardIcon}>
                      <span className="material-icons">
                        {aiMission
                          ? missionIconMap[aiMission.code] ||
                            missionIconMap[aiMission.title] ||
                            "restaurant"
                          : "restaurant"}
                      </span>
                    </div>
                    <h3>{aiMission?.title || "외식 줄이기"}</h3>
                    <p>
                      {aiMission?.description ||
                        "이번 주 1회 이하로 외식하고 집밥으로 해결해보세요!"}
                    </p>
                  </div>
                  <div className={styles.missionGoalRow}>
                    <span className={styles.goalLabel}>이번 주 미션 목표</span>
                    <span className={styles.goalStatus}>0/1회 달성</span>
                  </div>
                  <button
                    className={styles.actionBtn}
                    onClick={() =>
                      aiMission &&
                      handleSelectMission(aiMission.id, aiMission.title)
                    }
                  >
                    미션 시작하기
                  </button>
                </section>

                <section className={styles.card}>
                  <h3>7월 챌린지 진행 현황</h3>
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
                      {challengeDays.map((day, index) => {
                        const weekday = weekDays[index];
                        const isCompleted = hasChallenge && day < 7;
                        const isCurrent = hasChallenge && day === 6;

                        return (
                          <div
                            key={day}
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
                                isCurrent ? styles.currentChallengeIcon : ""
                              } ${!isCompleted ? styles.inactiveChallengeIcon : ""}`}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "#f7f9f8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #eee",
                                opacity: !hasChallenge ? 0.4 : 1,
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
                              {day}일차
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>

              {/* 우측 열: 다른 추천 미션 (최대 8개 제한) */}
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
                      const iconKey =
                        missionIconMap[template.code] ||
                        missionIconMap[template.title] ||
                        "star";
                      return (
                        <div
                          key={template.id}
                          className={styles.missionItemCard}
                        >
                          <div className={styles.missionCardIcon}>
                            <span className="material-icons">{iconKey}</span>
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

                {/* 나의 소비 기록 카드 */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>나의 소비 기록</h3>
                    <span className={styles.moreText}>기록 펼쳐보기 &gt;</span>
                  </div>
                  <div className={styles.historyList}>
                    {transactions.length > 0 ? (
                      transactions.map((tx, index) => (
                        <div key={index} className={styles.historyItemCard}>
                          <div className={styles.historyDate}>
                            {tx.date ||
                              tx.created_at?.slice(0, 10) ||
                              "8/04 (화)"}
                          </div>
                          <div className={styles.historyAmount}>
                            {tx.amount !== undefined && tx.amount !== null
                              ? `${Number(tx.amount).toLocaleString()}원`
                              : "--원"}
                          </div>
                          <div className={styles.historyCharacterBox}>
                            <div className={styles.characterPlaceholder}></div>
                          </div>
                          <div className={styles.historyMessage}>
                            오늘도 실천이
                            <br />
                            기대돼요!
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>최근 소비 기록이 없습니다.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
        <SubFooter />
      </div>
      <BottomTab />

      {/* '더 보기' 클릭 시 나타나는 사이드 탭 (SCSS 클래스 적용) */}
      {isMoreModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsMoreModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            {/* 탭 헤더 */}
            <div className={styles.modalHeader}>
              <h2>모든 추천 미션</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsMoreModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* 카테고리 필터 버튼 그리드 영역 */}
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

            {/* 필터링된 미션 목록 그리드 */}
            <div className={styles.modalMissionGrid}>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => {
                  const iconKey =
                    missionIconMap[template.code] ||
                    missionIconMap[template.title] ||
                    "star";
                  return (
                    <div
                      key={template.id}
                      className={styles.modalMissionItemCard}
                    >
                      <div className={styles.modalMissionCardIcon}>
                        <span className="material-icons">{iconKey}</span>
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
