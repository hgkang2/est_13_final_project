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
                    {/* 우측 카드와 동일한 원형 아이콘 스타일 클래스 적용 */}
                    <div className={styles.missionCardIcon}>
                      <span className="material-icons">restaurant</span>
                    </div>
                    <h3>외식 줄이기</h3>
                    <p>
                      이번 주 1회 이하로 외식하고
                      <br />
                      집밥으로 해결해보세요!
                    </p>
                  </div>

                  <div className={styles.missionGoalRow}>
                    <span className={styles.goalLabel}>이번 주 미션 목표</span>
                    <span className={styles.goalStatus}>0/1회 달성</span>
                  </div>

                  <button className={styles.actionBtn}>미션 시작하기</button>
                </section>

                {/* 7월 챌린지 진행 현황 카드 */}
                <section className={styles.card}>
                  <h3>7월 챌린지 진행 현황</h3>
                  <div className={styles.statusBox}>
                    {/* 요일별 진행 상황 그리드/flex 영역 */}
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

              {/* 우측 열 */}
              <div className={styles.rightColumn}>
                {/* 다른 추천 미션 카드 */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>다른 추천 미션</h3>
                    <span className={styles.moreText}>더 보기 &gt;</span>
                  </div>
                  <div className={styles.missionGrid}>
                    {/* 미션 아이템 1 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">local_cafe</span>
                      </div>
                      <span className={styles.missionCardTitle}>
                        카페 줄이기
                      </span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 2 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">two_wheeler</span>
                      </div>
                      <span className={styles.missionCardTitle}>
                        배달 줄이기
                      </span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 3 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">directions_bus</span>
                      </div>
                      <span className={styles.missionCardTitle}>
                        교통비 절약
                      </span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 4 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">subscriptions</span>
                      </div>
                      <span className={styles.missionCardTitle}>구독 정리</span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 5 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">local_drink</span>
                      </div>
                      <span className={styles.missionCardTitle}>
                        텀블러 사용
                      </span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 6 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">shopping_bag</span>
                      </div>
                      <span className={styles.missionCardTitle}>
                        충동구매 방지
                      </span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 7 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">flash_on</span>
                      </div>
                      <span className={styles.missionCardTitle}>전기 절약</span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>

                    {/* 미션 아이템 8 */}
                    <div className={styles.missionItemCard}>
                      <div className={styles.missionCardIcon}>
                        <span className="material-icons">savings</span>
                      </div>
                      <span className={styles.missionCardTitle}>저축하기</span>
                      <button className={styles.missionCardBtn}>
                        미션 선택
                      </button>
                    </div>
                  </div>
                </section>

                {/* 나의 소비 기록 카드 */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>나의 소비 기록</h3>
                    <span className={styles.moreText}>기록 펼쳐보기 &gt;</span>
                  </div>
                  <div className={styles.historyList}>
                    {/* 이미지의 5개 카드 구조 반영 */}
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className={styles.historyItemCard}>
                        <div className={styles.historyDate}>8/04 (화)</div>
                        <div className={styles.historyAmount}>--원</div>
                        <div className={styles.historyCharacterBox}>
                          {/* 캐릭터 일러스트 영역 (이미지 경로 또는 아이콘으로 대체 가능) */}
                          <div className={styles.characterPlaceholder}></div>
                        </div>
                        <div className={styles.historyMessage}>
                          오늘도 실천이
                          <br />
                          기대돼요!
                        </div>
                      </div>
                    ))}
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
