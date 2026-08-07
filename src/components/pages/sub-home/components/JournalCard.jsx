import Image from "next/image";
import JournalSlider from "@/components/common/JournalSlider";
import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";

export default function JournalCard({ hasJournal }) {
  return (
    <article
      className={styles.journalCard}
      aria-labelledby="journal-card-title"
    >
      <div className={styles.journalInner}>
        <header className={styles.journalHeader}>
          <div className={styles.journalTitleGroup}>
            <h2 id="journal-card-title">이번 주 소비 절약 그림일기</h2>
          </div>

          {hasJournal && <MoreButton>그림일기로 이동</MoreButton>}
        </header>

        {hasJournal ? (
          <JournalSlider />
        ) : (
          <div className={styles.journalEmpty}>
            <div className={styles.journalPreviewDeck} aria-hidden="true">
              <article
                className={`${styles.journalPreviewCard} ${styles.journalPreviewCardBack}`}
              >
                <div className={styles.journalPreviewMeta}>
                  <time>8/01 (토)</time>
                  <strong>-17,000원</strong>
                </div>

                <div className={styles.journalPreviewImage}>
                  <Image
                    src="/images/journal/journal-06.png"
                    alt=""
                    width={140}
                    height={136}
                  />
                </div>

                <p className={styles.journalPreviewContent}>
                  무료 취미 활동으로 즐거운 하루!
                </p>
              </article>

              <article
                className={`${styles.journalPreviewCard} ${styles.journalPreviewCardFront}`}
              >
                <div className={styles.journalPreviewMeta}>
                  <time>8/02 (일)</time>
                  <strong>--원</strong>
                </div>

                <div
                  className={`${styles.journalPreviewImage} ${styles.journalPreviewImageEmpty}`}
                >
                  <Image
                    src="/images/journal/journal-empty.png"
                    alt=""
                    width={140}
                    height={136}
                  />
                </div>

                <p className={styles.journalPreviewContent}>
                  오늘도 실천이 기대돼요!
                </p>
              </article>
            </div>

            <div className={styles.journalEmptyText}>
              <p>이번 주 그림일기를 기다리고 있어요!</p>

              <span className={styles.journalEmptyDescription}>
                오늘의 소비를 기록하면 첫 그림일기가 완성돼요.
              </span>

              <button type="button" className={styles.journalEmptyButton}>
                <span>그림일기 보러가기</span>

                <span className="material-icons" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
