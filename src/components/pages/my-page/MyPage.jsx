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

          {/* 프로필 관리 */}
          <section className={styles.MyPage_Account}>
            <h2>계정 관리</h2>

            {/* <dl className={styles.Account_List}> */}

            <div className={styles.Account_Item}>
              <dt>
                <span className={styles.Account_Icon}>person</span>
                <span className={styles.Account_Label}>닉네임</span>
              </dt>
              <dd>모아</dd>
            </div>

            <div className={styles.Account_Item}>
              <dt>
                <span className={styles.Account_Icon}>alternate_email</span>
                <span className={styles.Account_Label}>이메일</span>
              </dt>
              <dd>ESTFE13MO:UM@google.com</dd>
            </div>

            <div className={styles.Account_Item}>
              <dt>
                <span className={styles.Account_Icon}>calendar_today</span>
                <span className={styles.Account_Label}>가입 날짜</span>
              </dt>
              <dd>2026.04.07</dd>
            </div>

            <div className={styles.Account_Item}>
              <dt>
                <span className={styles.Account_Icon}>notifications</span>
                <span className={styles.Account_Label}>알림 설정</span>
              </dt>
              <dd>켜짐</dd>
            </div>
            {/* </dl> */}

            <button type="button" className={styles.Edit_Button}>
              정보 수정
            </button>
          </section>

          {/* 성장 그래프 */}
          <section className={styles.MyPage_Growth}>
            <div className={styles.Growth_Info}>
              <div className={styles.Title_Group}>
                <h2>이번 달 나의 성장</h2>
                <p>
                  지난달보다 <strong>12%p</strong> 더 성장했어요!
                </p>
              </div>

              <div className={styles.Progress_Group}>
                <strong className={styles.Progress_Value}>65%</strong>
                <div className={styles.Progress_Bar}>
                  <div className={styles.Progress_Fill}></div>
                </div>
              </div>
            </div>
            <img
              src="/images/mypage/moa-cheering.webp"
              alt="성장 캐릭터"
              className={styles.Character_Image}
            />
          </section>

          {/* 저축 및 목표 카드 */}
          <section className={styles.MyPage_Stats}>
            <div className={styles.Savings_Grid}>
              <article className={styles.Savings_Card}>
                <div className={styles.Stat_Content}>
                  <span>이번 달 총 지출</span>
                  <strong>1,905,000원</strong>
                </div>
                <img
                  src="/images/mypage/finance.webp"
                  alt="지출 아이콘"
                  className={styles.Savings_Image}
                />
              </article>

              <article className={styles.Savings_Card}>
                <div className={styles.Stat_Content}>
                  <span>AI 분석 횟수</span>
                  <strong>12번</strong>
                </div>
                <img
                  src="/images/mypage/analytics.webp"
                  alt="AI 분석아이콘"
                  className={styles.Savings_Image}
                />
              </article>

              <article className={styles.Savings_Card}>
                <div className={styles.Stat_Content}>
                  <span>평균 목표 달성률</span>
                  <strong>80%</strong>
                </div>
                <img
                  src="/images/mypage/goal-target.webp"
                  alt="목표 아이콘"
                  className={styles.Savings_Image}
                />
              </article>

              <article className={styles.Savings_Card}>
                <div className={styles.Stat_Content}>
                  <span>이번 달 절약 랭킹</span>
                  <strong>45위</strong>
                </div>
                <img
                  src="/images/mypage/achievement.webp"
                  alt="랭킹 아이콘"
                  className={styles.Savings_Image}
                />
              </article>
            </div>
          </section>

          {/* 하단 문구 */}
          <section className={styles.MyPage_Message}>
            <p>
              "천천히 가도 괜찮아요.
              <br />
              <strong>멈추지 않는다면</strong> 목표에 가까워지고 있으니까요."
            </p>
            <img
              src="/images/mypage/moa-character-banner.webp"
              alt="성장 캐릭터"
              className={styles.Character_Image}
            />
          </section>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
