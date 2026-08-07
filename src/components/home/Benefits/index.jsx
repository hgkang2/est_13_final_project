"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Benefits.module.scss";

const benefits = [
  {
    id: 1,
    title: "매일의 소비를 자동으로 정리하고 분석해 불필요한 지출을 쉽게 발견할 수 있어요.",
    image: "/images/home/benefit1.png",
  },
  {
    id: 2,
    title: "작은 저축도 꾸준히 이어질 수 있도록 목표와 진행 상황을 한눈에 확인할 수 있어요.",
    image: "/images/home/benefit2.png",
  },
  {
    id: 3,
    title: "AI가 소비 패턴을 분석해 더 효율적인 저축 방법과 맞춤형 절약 팁을 제안해드려요.",
    image: "/images/home/benefit3.png",
  },
  {
    id: 4,
    title: "매일의 기록과 실천이 쌓여 더 좋은 소비 습관과 건강한 자산 관리로 이어져요.",
    image: "/images/home/benefit4.png",
  },
];

export default function Benefits() {
  const [selected, setSelected] = useState(0);

  return (
    <section className={styles.benefits}>
      <div className={styles.divider}></div>

      <div className={styles.content}>
        <div className={`heading-s-plus ${styles.textArea}`}>
          <h2>왜 많은 사람들이 '모음'을 선택할까요?</h2>
        </div>
        <div className={`body-xm ${styles.list}`}>
          {benefits.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              className={`
                  ${styles.item}
                  ${selected === index ? styles.active : ""}
              `}
            >
              <span className={styles.arrow}>▶</span>

              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.imageArea}>
        <Image src={benefits[selected].image} width={307} height={311} alt="" />
      </div>
    </section>
  );
}
