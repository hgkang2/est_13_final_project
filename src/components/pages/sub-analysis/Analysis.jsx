import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Analysis.module.scss";

export default function Analysis() {
  return (
    <>
      <div className={styles.pageLayout}>
        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 영역 */}
        <main className={styles.container}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>소비 분석</h1>
            <p className={styles.subtitle}>
              내 소비 데이터를 분석하여 체계적으로 관리하세요.
            </p>
          </div>

          {/* AI 분석 리포트 섹션 */}
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
              {/* 캐릭터 영역 */}
              <div className={styles.characterArea}>
                <div className={styles.characterBox}>
                  <img
                    src="/images/character/moa analysis.png"
                    alt="AI 소비 분석 결과를 설명하는 모아 캐릭터"
                    className={styles.characterImage}
                  />
                </div>
              </div>

              {/* 인사이트 영역 (분석 + 하단 3열) */}
              <div className={styles.insightContentArea}>
                {/* 상단 분석 */}
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

                {/* 하단 3열 (예측 / 실행 / 피드백) */}
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

          {/* 4개 지표 요약 카드 섹션 */}
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

          {/* 2단 그래프/비중 섹션 */}
          <div className={styles.gridContainer}>
            {/* 지출 추이 그래프 카드 */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>지출 추이</h3>
                <div className={styles.selectBox}>일일</div>
              </div>
              <div className={styles.chartPlaceholderBox}>
                {/* 그래프 컴포넌트나 이미지 영역 */}
              </div>
            </section>

            {/* 카테고리별 소비 비중 카드 */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>카테고리별 소비 비중</h3>
              </div>
              <div className={styles.donutChartArea}>
                <div className={styles.donutCenterText}>
                  <span>총 지출</span>
                  <strong>1,468,123원</strong>
                </div>
              </div>
              <ul className={styles.categoryLegendList}>
                <li>
                  <span className={`${styles.dot} ${styles.c1}`} /> 식비 45%{" "}
                  <span className={styles.price}>660,855원</span>
                </li>
                <li>
                  <span className={`${styles.dot} ${styles.c2}`} /> 쇼핑 20%{" "}
                  <span className={styles.price}>293,215원</span>
                </li>
                <li>
                  <span className={`${styles.dot} ${styles.c3}`} /> 교통 12%{" "}
                  <span className={styles.price}>176,175원</span>
                </li>
                <li>
                  <span className={`${styles.dot} ${styles.c4}`} /> 여가 10%{" "}
                  <span className={styles.price}>146,812원</span>
                </li>
                <li>
                  <span className={`${styles.dot} ${styles.c5}`} /> 주거 8%{" "}
                  <span className={styles.price}>117,260원</span>
                </li>
                <li>
                  <span className={`${styles.dot} ${styles.c6}`} /> 기타 5%{" "}
                  <span className={styles.price}>73,406원</span>
                </li>
              </ul>
            </section>
          </div>

          {/* 예산 대비 지출 랭킹 섹션 */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>예산 대비 지출 랭킹</h3>
              <span className={styles.rankingDate}>2026.08</span>
            </div>
            <div className={styles.rankingList}>
              <div className={styles.rankingItem}>
                <span className={`${styles.rankBadge} ${styles.r1}`}>1</span>
                <span className={styles.rankCategory}>식비</span>
                <div className={styles.progressBarWrapper}>
                  <div
                    className={styles.progressBar}
                    style={{ width: "100%" }}
                  />
                </div>
                <span className={styles.rankPercent}>100%</span>
                <span className={styles.rankAmount}>123,467 / 250,000</span>
              </div>
            </div>
            <button type="button" className={styles.moreBtn}>
              더보기{" "}
              <span className="material-symbols-rounded">expand_more</span>
            </button>
          </section>
        </main>
      </div>

      {/* 서브 푸터 */}
      <SubFooter />

      {/* 모바일 하단 탭 */}
      <BottomTab />
    </>
  );
}
