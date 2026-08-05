"use client";

import Image from "next/image";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";

import styles from "./JournalSlider.module.scss";

const defaultJournals = [
  {
    id: 1,
    date: "7/27 (월)",
    amount: "-4,500원",
    image: "/images/journal/journal-01.png",
    content: "커피 대신 텀블러 사용!",
  },
  {
    id: 2,
    date: "7/28 (화)",
    amount: "-6,200원",
    image: "/images/journal/journal-02.png",
    content: "편의점 지출 5천원 이하 성공!",
  },
  {
    id: 3,
    date: "7/29 (수)",
    amount: "-1,450원",
    image: "/images/journal/journal-03.png",
    content: "걸어서 이동하고 교통비 절약!",
  },
  {
    id: 4,
    date: "7/30 (목)",
    amount: "-23,000원",
    image: "/images/journal/journal-04.png",
    content: "집밥으로 식비 아끼기!",
  },
  {
    id: 5,
    date: "7/31 (금)",
    amount: "-200,000원",
    image: "/images/journal/journal-05.png",
    content: "오늘 저축 성공!",
  },
  {
    id: 6,
    date: "8/01 (토)",
    amount: "-17,000원",
    image: "/images/journal/journal-06.png",
    content: "무료 취미 활동으로 즐거운 하루!",
  },
  {
    id: 7,
    date: "8/02 (일)",
    amount: "--원",
    image: "/images/journal/journal-empty.png",
    content: "오늘도 실천이 기대돼요!",
    pending: true,
  },
];

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
  journals = defaultJournals,
  desktopSlidesPerView = 7,
  spaceBetween = 16,
  showContent = true,
  isEmpty = false,
}) {
  return (
    <div className={styles.journalSlider}>
      <Swiper
        spaceBetween={spaceBetween}
        slidesPerView="auto"
        breakpoints={{
          1025: {
            spaceBetween,
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
                <strong>{isEmpty ? "--원" : journal.amount}</strong>
              </div>

              <div
                className={`${styles.journalImage} ${
                  isEmpty || journal.pending ? styles.pendingJournalImage : ""
                }`}
              >
                <Image
                  src={
                    isEmpty
                      ? "/images/journal/journal-empty.png"
                      : journal.image
                  }
                  alt={isEmpty ? "" : `${journal.date} 소비 절약 그림일기`}
                  width={220}
                  height={220}
                  aria-hidden={isEmpty}
                />
              </div>

              {showContent && journal.content && (
                <div className={styles.journalContentBox}>
                  <p className={styles.journalContent}>
                    {isEmpty ? "오늘도 실천이 기대돼요!" : journal.content}
                  </p>
                </div>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
