"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import styles from "./Story.module.scss";

const storyItems = [
  {
    id: 1,
    number: "01.",
    title: "모든 시작은 작은 목표에서.",
    description: (
      <>
        원하는 여행, 갖고 싶은 물건, 미래의 나를 위해.
        <br />
        목표를 정하면 저축은 <strong>더 오래, 더 즐겁게</strong> 이어집니다.
      </>
    ),
    image: "/images/home/main_1.png",
    imageAlt: "저축 목표를 설정하는 모아 캐릭터",
  },
  {
    id: 2,
    number: "02.",
    title: "오늘의 소비를 남겨보세요.",
    description: (
      <>
        하루의 소비를 기록하는 작은 습관이
        <br />내 <strong>돈의 흐름</strong>을 이해하는 가장 좋은 시작입니다.
      </>
    ),
    image: "/images/home/main_2.png",
    imageAlt: "소비 내역을 기록하는 모아 캐릭터",
  },
  {
    id: 3,
    number: "03.",
    title: "모아가 소비 습관을 읽어드려요!",
    description: (
      <>
        어디에서 많이 쓰는지, 어떤 소비를 줄일 수 있는지.
        <br />
        AI가 데이터를 분석해 더 <strong>현명한 소비</strong>를 제안합니다.
      </>
    ),
    image: "/images/home/main_3.png",
    imageAlt: "소비 습관을 분석하는 모음 캐릭터",
  },
  {
    id: 4,
    number: "04.",
    title: "친구와 함께하는 저축 챌린지!",
    description: (
      <>
        혼자보다 함께라면 더 꾸준하게. 같은 목표를 향해
        <br />
        응원하고 경쟁하며 <strong>저축을 습관</strong>으로 만들어보세요.
      </>
    ),
    image: "/images/home/main_4.png",
    imageAlt: "친구들과 챌린지를 완료한 모아 캐릭터",
  },
  {
    id: 5,
    number: "05.",
    title: "성장하는 나를 확인하세요",
    description: (
      <>
        기록은 결국 <strong>성장</strong>이 돼요! 지난 소비와 저축을 되돌아보며
        <br />
        얼마나 달라졌는지 한눈에 확인할 수 있습니다.
      </>
    ),
    image: "/images/home/main_5.png",
    imageAlt: "저축 성장을 확인하는 모아 캐릭터",
  },
  {
    id: 6,
    number: "06.",
    title: "어느새 목표 달성!",
    description: (
      <>
        매일의 작은 기록과 꾸준한 실천이 모여
        <br />
        원하던 <strong>목표를 현실로</strong> 만들어줍니다.
      </>
    ),
    image: "/images/home/main_6.png",
    imageAlt: "저축 목표를 달성한 모아 캐릭터",
  },
];
function StoryItem({ item, index }) {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const isReverse = index % 2 === 1;

  useEffect(() => {
    const currentItem = itemRef.current;
    if (!currentItem) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(currentItem);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <article
      ref={itemRef}
      className={`${styles.storyItem} ${isReverse ? styles.reverse : ""} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles.imageArea}>
        <Image src={item.image} width={790} height={302} alt={item.imageAlt} className={styles.image} />
      </div>

      <div className={styles.content}>
        <div className={styles.numberArea}>
          <span className={`heading-s-plus ${styles.number}`}>{item.number}</span>

          <span className={styles.numberLine} />
        </div>

        <h3 className={`body-l ${styles.itemTitle}`}>{item.title}</h3>

        <p className={`body-m ${styles.description}`}>{item.description}</p>
      </div>
    </article>
  );
}

export default function Story() {
  return (
    <section className={styles.story}>
      <div className={styles.inner}>
        <div className={styles.heading}></div>

        <div className={styles.storyList}>
          {storyItems.map((item, index) => (
            <StoryItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
