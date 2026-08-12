"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Challenge.module.scss";
import { createClient } from "@/utils/supabase/client";

// 미션 제목에 맞는 Material Icon 매핑 딕셔너리
const missionIconMap = {
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
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // mission_templates 테이블 조회[cite: 1]
      const { data: templates, error: templateError } = await supabase
        .from("mission_templates")
        .select("*");

      if (!templateError && templates && templates.length > 0) {
        // 첫 번째 항목을 좌측 'AI 추천 미션'으로 지정하고, 나머지를 '다른 추천 미션'으로 분리
        setAiMission(templates[0]);
        setMissionTemplates(templates.slice(1));
      }

      // transactions 테이블 조회[cite: 1]
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .limit(4);

      if (!txError && txData) {
        setTransactions(txData);
      }
    }

    fetchData();
  }, [supabase]);

  // 미션 선택 버튼 클릭 시 user_missions에 데이터 추가 (title 포함)[cite: 1]
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
              {/* 좌측 열: AI 추천 미션 및 진행 현황 */}
              <div className={styles.leftColumn}>
                <section className={styles.card}>
                  <div className={styles.aiBadge}>AI 추천 미션</div>
                  <div className={styles.missionContent}>
                    <div className={styles.missionCardIcon}>
                      <span className="material-icons">
                        {aiMission
                          ? missionIconMap[aiMission.title] || "restaurant"
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
                  <div className={styles.statusBox}>
                    {["월", "화", "수", "목", "금", "토", "일"].map(
                      (day, index) => (
                        <div key={index} className={styles.dayItem}>
                          <div className={styles.dayBox}></div>
                          <span className={styles.dayLabel}>{day}</span>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              </div>

              {/* 우측 열: 다른 추천 미션 */}
              <div className={styles.rightColumn}>
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>다른 추천 미션</h3>
                    <span className={styles.moreText}>더 보기 &gt;</span>
                  </div>
                  <div className={styles.missionGrid}>
                    {missionTemplates.map(template => {
                      const title = template.title || template.name;
                      return (
                        <div
                          key={template.id}
                          className={styles.missionItemCard}
                        >
                          <div className={styles.missionCardIcon}>
                            <span className="material-icons">
                              {missionIconMap[title] || "star"}
                            </span>
                          </div>
                          <span className={styles.missionCardTitle}>
                            {title}
                          </span>
                          <button
                            className={styles.missionCardBtn}
                            onClick={() =>
                              handleSelectMission(template.id, title)
                            }
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
                            {tx.date || "8/04 (화)"}
                          </div>
                          <div className={styles.historyAmount}>
                            {tx.amount
                              ? `${tx.amount.toLocaleString()}원`
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
    </div>
  );
}
