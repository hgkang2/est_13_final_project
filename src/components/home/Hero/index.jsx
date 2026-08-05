"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import styles from "./Hero.module.scss";

const heroSlides = [
  {
    id: 1,
    title: (
      <>
        돈을 모으는 가장 <span className={styles.highlight}>즐거운</span> 방법, 모음
      </>
    ),
    description: (
      <>
        AI가 분석해주는 맞춤형 소비 리포트와 함께
        <br />
        친구들과 챌린지까지 즐기는 새로운 저축 습관을 시작해보세요.
      </>
    ),
    image: "/images/home/Hero1.png",
    imageAlt: "저축 목표를 세우는 모음 캐릭터",
    href: "#",
  },
  {
    id: 2,
    title: (
      <>
        첫 <span className={styles.highlight}>챌린지</span>를 시작해 보세요!
      </>
    ),
    description: (
      <>
        모음에서만 만날 수 있는 웰컴 미션과 함께 첫 저축을 더욱 즐겁게,
        <br />
        시작해보세요! 다양한 리워드와 특별한 혜택이 기다리고 있습니다.
      </>
    ),
    image: "/images/home/Hero2.png",
    imageAlt: "선물 상자를 안고 있는 모음 캐릭터",
    href: "#",
  },
  {
    id: 3,
    title: (
      <>
        모음 <span className={styles.highlight}>오픈 기념</span> 이벤트
      </>
    ),
    description: (
      <>
        서비스 오픈을 기념하여 특별한 챌린지와 다양한 이벤트를 준비했어요.
        <br />
        모음에서만 경험할 수 있는 특별한 혜택을 바로 지금 만나보세요!
      </>
    ),
    image: "/images/home/Hero3.png",
    imageAlt: "다양한 선물을 보여주는 모음 캐릭터",
    href: "/login",
  },
  {
    id: 4,
    title: (
      <>
        매일 기록하고 <span className={styles.highlight}>보상을 모아</span> 보세요!
      </>
    ),
    description: (
      <>
        매일 한 번의 기록이 더 좋은 소비 습관으로 이어집니다.
        <br />
        출석 배지와 리워드를 모으며 목표를 향해 성장하는 즐거움을 경험해보세요.
      </>
    ),
    image: "/images/home/Hero4.png",
    imageAlt: "소비와 저축을 기록하는 모음 캐릭터",
    href: "#",
  },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <Swiper
        className={styles.swiper}
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        speed={700}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className={styles.slide}>
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                sizes="100vw"
                quality={100}
                className={styles.backgroundImage}
                priority={index === 0}
              />

              <div className={styles.inner}>
                <div className={styles.content}>
                  {index === 0 ? (
                    <h1 className={`heading-l-plus ${styles.title}`}>{slide.title}</h1>
                  ) : (
                    <h2 className={`heading-l-plus ${styles.title}`}>{slide.title}</h2>
                  )}

                  <p className={`body-l ${styles.description}`}>{slide.description}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
