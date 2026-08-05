import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./MyPage.module.scss";

export default function MyPage() {
  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <main className={styles.container}>
          {/* 상단 프로필 카드 */}
          <section className={styles.MyPage_Profile}>
            <div className={styles.MyPage_Intro}>
              <div className={styles.Avatar}></div>

              <div className={styles.Greeting}>
                {/* 임시 사용자 이름 및 데이터입니다. */}
                <h1>모아님, 오늘도 반가워요!</h1>
                <p>작은 실천을 이어온 지 110일째예요.</p>
              </div>
            </div>

            <div className={styles.MyPage_Summary}>
              <div className={styles.MyPage_summaryItem}>
                <span>진행 중인 목표</span>
                {/* 임시 데이터입니다. */}
                <strong>8</strong>
              </div>

              <div className={styles.MyPage_summaryItem}>
                <span>이번 달 저축 금액</span>
                {/* 임시 데이터입니다. */}
                <strong>123,456원</strong>
              </div>

              <div className={styles.MyPage_summaryItem}>
                <span>완료한 챌린지 수</span>
                {/* 임시 데이터입니다. */}
                <strong>10</strong>
              </div>
            </div>
          </section>

          {/* 프로필 관리, 성장 그래프, 저축 카드 */}
          <div className={styles.MyPage_Content}>
            {/* 프로필 관리 */}
            <section className={styles.Account_Section}>
              <h2>계정 관리</h2>

              <dl className={styles.Account_List}>
                <div className={styles.Account_Item}>
                  <dt>닉네임</dt>
                  <dd>모아</dd>
                </div>

                <div className={styles.Account_Item}>
                  <dt>이메일</dt>
                  <dd>example@google.com</dd>
                </div>

                <div className={styles.Account_Item}>
                  <dt>가입 날짜</dt>
                  <dd>2026.04.07</dd>
                </div>

                <div className={styles.Account_Item}>
                  <dt>알림 설정</dt>
                  <dd>켜짐</dd>
                </div>
              </dl>

              <button type="button" className={styles.Edit_Button}>
                정보 수정
              </button>
            </section>

            {/* 성장 그래프 */}
            <section className={styles.Growth_Section}>
              <h2>이번 달 나의 성장</h2>

              <p>
                지난달보다 <strong>12%</strong> 더 성장했어요!
              </p>

              <strong className={styles.Progress_Value}>65%</strong>

              <div className={styles.Progress_Bar}>
                <div className={styles.Progress_Fill}></div>
              </div>
            </section>

            {/* 저축 및 목표 카드 */}
            <section className={styles.Savings_Section}>
              <h2 className={styles.SrOnly}>저축 및 목표 현황</h2>

              <div className={styles.Savings_Grid}>
                <article className={styles.Savings_Card}>
                  <span>이번 달 저축액</span>
                  <strong>1,905,000원</strong>
                </article>

                <article className={styles.Savings_Card}>
                  <span>AI 분석 횟수</span>
                  <strong>12번</strong>
                </article>

                <article className={styles.Savings_Card}>
                  <span>평균 목표 달성률</span>
                  <strong>80%</strong>
                </article>

                <article className={styles.Savings_Card}>
                  <span>이번 달 목표 랭킹</span>
                  <strong>45위</strong>
                </article>
              </div>
            </section>
          </div>

          {/* 하단 문구 */}
          <section className={styles.Quote_Section}>
            <p>
              천천히 가도 괜찮아요.
              <br />
              멈추지 않는다면 목표에 가까워지고 있으니까요.
            </p>
          </section>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}