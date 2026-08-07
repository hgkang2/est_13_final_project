"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import styles from "./Review.module.scss";

const reviews = [
  {
    id: 1,
    title: "매일 미션 성공!",
    content: "후기 내용입니다.",
  },
  {
    id: 2,
    title: "매일 미션 성공!",
    content: "후기 내용입니다.",
  },
  {
    id: 3,
    title: "매일 미션 성공!",
    content: "후기 내용입니다.",
  },
  {
    id: 4,
    title: "매일 미션 성공!",
    content: "후기 내용입니다.",
  },
  {
    id: 5,
    title: "매일 미션 성공!",
    content: "후기 내용입니다.",
  },
];

export default function Review() {
  return (
    <section className={styles.review}>
      <div className={styles.inner}>
        <div className={`heading-l-plus ${styles.heading}`}>
          <h2>
            <span>모음</span>과 함께 달라진 이야기
          </h2>
          <p className={`body-l`}>
            목표를 향한 작은 실천이 어떻게 변화를 만들었는지,
            <br />
            실제 사용자들의 생생한 경험을 확인해보세요.
          </p>
        </div>

        <div className={styles.phoneArea}>
          <Image src="/images/home/phone_ui.png" width={478} height={732} alt="모음 서비스 화면이 표시된 휴대폰" />
        </div>

        <div className={styles.reviewSlider}>
          <Swiper
            modules={[Navigation]}
            breakpointsBase="container"
            loop={false}
            onBreakpoint={(swiper, breakpointParams) => {
              console.log("현재 slidesPerView:", breakpointParams.slidesPerView);
            }}
            navigation={{
              prevEl: `.${styles.prev}`,
              nextEl: `.${styles.next}`,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 16,
              },
              481: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20,
              },
              1025: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 24,
              },
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <article className={styles.card}>
                  <div className={styles.profile}></div>

                  <h4 className={`body-m-plus`}>{review.title}</h4>

                  <p className={`caption`}>{review.content}</p>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <button type="button" className={styles.prev} aria-label="이전 후기">
            <span className="material-symbols-outlined">keyboard_double_arrow_left</span>
          </button>

          <button type="button" className={styles.next} aria-label="다음 후기">
            <span className="material-symbols-outlined">keyboard_double_arrow_right</span>
          </button>
        </div>
      </div>
    </section>
  );
}
