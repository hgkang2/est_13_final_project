import Image from "next/image";
import JournalSlider from "@/components/common/JournalSlider";
import styles from "../SubHome.module.scss";
import MoreButton from "./MoreButton";
import { createClient } from "@/utils/supabase/client";

export default function JournalCard({ journals = [] }) {
  const hasJournal = journals.some(journal => !journal.pending);

  const supabase = createClient();

  const { data: hobbyImageData } = supabase.storage
    .from("public-assets")
    .getPublicUrl("journal/hobby.png");

  const { data: emptyImageData } = supabase.storage
    .from("public-assets")
    .getPublicUrl("journal/journal_empty.png");

  return (
    <article
      className={styles.journalCard}
      aria-labelledby="journal-card-title"
    >
      <div className={styles.journalInner}>
        <header className={styles.journalHeader}>
          <div className={styles.journalTitleGroup}>
            <h2 id="journal-card-title">이번 주 소비 그림일기</h2>
          </div>

          {hasJournal && (
            <div className={styles.preparingButton}>
              <MoreButton>그림일기로 이동</MoreButton>

              <span className={styles.preparingTooltip} role="tooltip">
                서비스 준비 중이에요.
              </span>
            </div>
          )}
        </header>

        {hasJournal ? (
          <JournalSlider journals={journals} />
        ) : (
          <div className={styles.journalEmpty}>
            <div className={styles.journalPreviewDeck} aria-hidden="true">
              <div
                className={`${styles.journalPreviewCard} ${styles.journalPreviewCardBack}`}
              >
                <div className={styles.journalPreviewMeta}>
                  <time dateTime="2026-08-01">8/01 (토)</time>
                  <strong>-17,000원</strong>
                </div>

                <div className={styles.journalPreviewImage}>
                  <Image
                    src={hobbyImageData.publicUrl}
                    alt=""
                    width={140}
                    height={136}
                  />
                </div>

                <p className={styles.journalPreviewContent}>
                  무료 취미 활동으로 즐거운 하루!
                </p>
              </div>

              <div
                className={`${styles.journalPreviewCard} ${styles.journalPreviewCardFront}`}
              >
                <div className={styles.journalPreviewMeta}>
                  <time dateTime="2026-08-02">8/02 (일)</time>
                  <strong>--원</strong>
                </div>

                <div
                  className={`${styles.journalPreviewImage} ${styles.journalPreviewImageEmpty}`}
                >
                  <Image
                    src={emptyImageData.publicUrl}
                    alt=""
                    width={140}
                    height={136}
                  />
                </div>

                <p className={styles.journalPreviewContent}>
                  오늘도 실천이 기대돼요!
                </p>
              </div>
            </div>

            <div className={styles.journalEmptyText}>
              <p>이번 주 그림일기를 기다리고 있어요!</p>

              <span className={styles.journalEmptyDescription}>
                오늘의 소비를 기록하면 첫 그림일기가 완성돼요.
              </span>

              <div className={styles.preparingButton}>
                <button type="button" className={styles.journalEmptyButton}>
                  <span>그림일기 보러가기</span>
                  <span className="material-icons" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>

                <span className={styles.preparingTooltip} role="tooltip">
                  서비스 준비 중이에요.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
