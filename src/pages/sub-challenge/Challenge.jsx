import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Challenge.module.scss";

export default function Challenge() {
  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <main className={styles.main}>
          <div className="container">
            {/* 페이지 타이틀 영역 */}
            <div className={styles.pageHeader}>
              <h1 className={styles.title}>챌린지</h1>
              <p className={styles.subtitle}>
                미션으로 작은 습관을 만들어 보세요!
              </p>
            </div>

            {/* 메인 콘텐츠 그리드 영역 (2단 구조) */}
            <div className={styles.gridContainer}>
              {/* 좌측 열 */}
              <div className={styles.leftColumn}>
                {/* AI 추천 미션 카드 */}
                <section className={styles.card}>
                  <div className={styles.aiBadge}>AI 추천 미션</div>
                  <div className={styles.missionContent}>
                    <div className={styles.missionIcon}></div>
                    <h3>외식 줄이기</h3>
                    <p>지난 주 대비 식비로 20%를 줄여보세요</p>
                  </div>
                  <button className={styles.actionBtn}>미션 시작하기</button>
                </section>

                {/* 7월 챌린지 진행 현황 카드 */}
                <section className={styles.card}>
                  <h3>7월 챌린지 진행 현황</h3>
                  <div className={styles.statusBox}></div>
                </section>
              </div>

              {/* 우측 열 */}
              <div className={styles.rightColumn}>
                {/* 다른 추천 미션 카드 */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>다른 추천 미션</h3>
                    <span className={styles.moreText}>더 보기 &gt;</span>
                  </div>
                  <div className={styles.missionGrid}>
                    {/* 미션 아이템 반복 영역 (예시 4개) */}
                    <div className={styles.missionItem}>카페 줄이기</div>
                    <div className={styles.missionItem}>배달 줄이기</div>
                    <div className={styles.missionItem}>교통비 절약</div>
                    <div className={styles.missionItem}>구독 정리</div>
                  </div>
                </section>

                {/* 나의 소비 기록 카드 */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>나의 소비 기록</h3>
                    <span className={styles.moreText}>기록 둘러보기 &gt;</span>
                  </div>
                  <div className={styles.historyList}>
                    {/* 소비 기록 아이템 영역 */}
                    <div className={styles.historyItem}>-12,000원</div>
                    <div className={styles.historyItem}>-4,500원</div>
                    <div className={styles.historyItem}>-25,900원</div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
