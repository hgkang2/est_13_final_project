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
    title: "아이패드 구매 성공!",
    content: "매일 모은 돈으로 샀어요. 계획적으로 저축하니 생각보다 빨랐네요!",
    profile: "/images/home/profile1.png",
  },
  {
    id: 2,
    title: "제주도 여행 다녀왔어요!",
    content: "충동소비를 줄이고 여행 통장을 채웠더니 부담 없이 다녀올 수 있었어요.",
    profile: "/images/home/profile2.png",
  },
  {
    id: 3,
    title: "목표 금액 100만 원 달성!",
    content: "매일 기록하는 습관이 생각보다 큰 힘이 됐어요. 저축이 재미있어졌습니다.",
    profile: "/images/home/profile3.png",
  },
  {
    id: 4,
    title: "드디어 노트북 바꿨어요",
    content: "모아의 소비 분석 덕분에 새는 돈을 줄였어요. 노트북도 무사히 구매!",
    profile: "/images/home/profile4.png",
  },
  {
    id: 5,
    title: "비상금 통장 완성!",
    content: "갑작스러운 지출에도 마음이 편해졌어요. 불안감이 훨씬 줄었습니다.",
    profile: "/images/home/profile5.png",
  },
  {
    id: 6,
    title: "유럽 여행 준비 끝!",
    content: "친구랑 챌린지를 하니까 포기하지 않게 되더라고요. 곧 떠나요!",
    profile: "/images/home/profile6.png",
  },
  {
    id: 7,
    title: "카메라 구매 성공!",
    content: "사진 찍는 게 취미인데 드디어 사고 싶던 카메라를 샀어요~!",
    profile: "/images/home/profile7.png",
  },
  {
    id: 8,
    title: "월급이 남기 시작했어요",
    content: "소비 내역을 한눈에 보니까 불필요한 지출이 정말 많았더라고요.",
    profile: "/images/home/profile8.png",
  },
  {
    id: 9,
    title: "결혼 자금 차곡차곡",
    content: "큰 목표라 막막했는데 작은 목표부터 달성하니 자신감이 생겼어요.",
    profile: "/images/home/profile9.png",
  },
  {
    id: 10,
    title: "첫 500만 원 모았어요!",
    content: "매달 목표를 세워서 달성하는 재미가 생겼어요. 이제 다음 목표를 향해!",
    profile: "/images/home/profile10.png",
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
            onBreakpoint={(swiper, breakpointParams) => {}}
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
                  <div className={styles.profile}>
                    <Image src={review.profile} alt={"작성자 프로필 사진"} width={45} height={45} />
                  </div>

                  <h3 className={`body-m-plus`}>{review.title}</h3>

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
