import Image from "next/image";
import styles from "../SubHome.module.scss";
import OutlineButton from "./OutlineButton";

export default function AiCard({ hasSpendingData }) {
  return (
    <article className={styles.aiCard} aria-labelledby="ai-card-title">
      <div className={styles.aiContent}>
        <div className={styles.aiText}>
          <h2 id="ai-card-title">MO:UM AI 한마디</h2>

          {hasSpendingData ? (
            <p className={styles.aiMessage}>
              이번 주 카페 소비가 지난주보다 <strong>23%</strong> 줄었어요!
            </p>
          ) : (
            <div className={styles.aiEmptyMessage}>
              <p className={`${styles.aiMessage} ${styles.aiEmptyTitle}`}>
                AI가 첫 분석을 기다리고 있어요.
              </p>

              <p className={styles.aiEmptyDescription}>
                첫 소비를 기록하면 AI가 소비 습관을 분석해드릴게요.
              </p>
            </div>
          )}
          <OutlineButton>
            {hasSpendingData ? "AI 분석 자세히 보기" : "소비 기록하기"}
          </OutlineButton>
        </div>

        <div className={styles.aiImage}>
          <Image
            src={
              hasSpendingData
                ? "/images/character/ai_moa.png"
                : "/images/character/ai_empty_moa.png"
            }
            alt={hasSpendingData ? "AI 캐릭터" : "첫 분석을 기다리는 AI 캐릭터"}
            width={247}
            height={247}
          />
        </div>
      </div>
    </article>
  );
}
