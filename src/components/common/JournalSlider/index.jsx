"use client";

import Image from "next/image";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";

import styles from "./JournalSlider.module.scss";

function JournalNavigation() {
  const swiper = useSwiper();

  return (
    <>
      <button
        type="button"
        className={`${styles.sliderButton} ${styles.prevButton}`}
        onClick={() => swiper.slidePrev()}
        aria-label="이전 그림일기 보기"
      >
        <span className="material-icons" aria-hidden="true">
          chevron_left
        </span>
      </button>

      <button
        type="button"
        className={`${styles.sliderButton} ${styles.nextButton}`}
        onClick={() => swiper.slideNext()}
        aria-label="다음 그림일기 보기"
      >
        <span className="material-icons" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </>
  );
}

export default function JournalSlider({
  journals = [],
  spaceBetween = 16,
  showContent = true,
}) {
  return (
    <div className={styles.journalSlider}>
      <Swiper
        spaceBetween={spaceBetween}
        slidesPerView="auto"
        breakpointsBase="container"
        breakpoints={{
          1162: {
            slidesPerView: 7,
            allowTouchMove: false,
          },
        }}
      >
        <JournalNavigation />

        {journals.map(journal => (
          <SwiperSlide key={journal.id}>
            <article className={styles.journalItem}>
              <div className={styles.journalMeta}>
                <time>{journal.date}</time>
                <strong>{journal.amount}</strong>
              </div>

              <div
                className={`${styles.journalImage} ${
                  journal.pending ? styles.pendingJournalImage : ""
                }`}
              >
                <Image
                  src={journal.image}
                  alt={
                    journal.pending ? "" : `${journal.date} 소비 절약 그림일기`
                  }
                  width={220}
                  height={220}
                  aria-hidden={journal.pending}
                />
              </div>

              {showContent && journal.content && (
                <div className={styles.journalContentBox}>
                  <p className={styles.journalContent}>{journal.content}</p>
                </div>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
