import Image from "next/image";
import styles from "./AiSection.module.scss";

export default function AiSection() {
  return (
    <section id="ai" className={`${styles.section} ${styles.aiSection}`}>
      <div className={styles.inner}>
        <div className={styles.sectionTitle}>
          <span className={`body-xm`}>04</span>

          <div>
            <p className={`body-m-plus`}>MOA AI</p>
            <h2 className={`heading-s`}>모아 AI 소개</h2>
          </div>
        </div>

        <div className={styles.aiLayout}>
          <div className={styles.aiMenu}>
            <article>
              <span>01</span>

              <div>
                <h3 className={`body-m`}>소비 패턴 분석</h3>
                <p className={`body-m`}>소비 기록을 분석해 나의 패턴을 찾아드려요.</p>
              </div>
            </article>

            <article>
              <span>02</span>

              <div>
                <h3 className={`body-m`}>맞춤형 절약 팁</h3>
                <p className={`body-m`}>모아가 나에게 맞는 절약 방법을 추천해 드려요.</p>
              </div>
            </article>

            <article>
              <span>03</span>

              <div>
                <h3 className={`body-m`}>예산 관리</h3>
                <p className={`body-m`}>목표 달성을 위한 예산 계획을 함께 세워 드려요.</p>
              </div>
            </article>
          </div>

          <div className={styles.aiReport}>
            <div className={styles.reportHeader}>
              <span>MOA REPORT</span>
              <strong className={`body-l`}>이번 달 소비 인사이트</strong>
            </div>

            <div className={styles.reportContent}>
              <div className={styles.chart}>
                <div className={styles.chartCenter}>
                  <span>총 지출</span>
                  <strong>850,000원</strong>
                </div>
              </div>

              <div className={styles.reportSide}>
                <div className={styles.reportText}>
                  <span>MOA 추천 TIP</span>

                  <h3 className={`body-l`}>
                    이번 달 카페 소비가
                    <br />
                    지난달보다 늘었어요.
                  </h3>

                  <p className={`body-m`}>
                    최근 카페 소비가 조금 늘어난 것으로 보여요. 주 2회만 줄여도 한 달에 약 24,000원을 절약할 수 있어요.
                  </p>
                </div>

                <div className={styles.moaCharacter}>
                  <Image
                    src="/images/introduce/intro_moa.png"
                    alt="AI 소비 분석을 안내하는 모아"
                    width={150}
                    height={178}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
