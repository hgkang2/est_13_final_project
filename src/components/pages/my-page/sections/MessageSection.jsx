"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../MyPage.module.scss";

const messages = [
  {
    first: "천천히 가도 괜찮아요.",
    point: "멈추지 않는다면",
    last: " 목표에 가까워지고 있으니까요.",
    image: "/images/mypage/moa-character-banner.png",
  },
  {
    first: "기록할수록 습관은 단단해져요",
    point: "꾸준함이 가장",
    last: " 든든한 저축이니까요.",
    image: "/images/mypage/banner-saving-habit.png",
  },
  {
    first: "목표가 멀게 느껴져도 괜찮아요",
    point: "지금도 한 칸씩",
    last: " 가까워지고 있어요.",
    image: "/images/mypage/banner-goal-growth.png",
  },
  {
    first: "작은 금액도 괜찮아요.",
    point: "오늘의 한 걸음",
    last: " 이 내일의 여유가 되니까요.",
    image: "/images/mypage/banner-saving-start.png",
  },
];

export default function MessageSection() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const updateMessage = () => {
      const koreaDay = Math.floor((Date.now() + 9 * 60 * 60 * 1000) / 86400000);
      setMessageIndex(koreaDay % messages.length);
    };

    updateMessage();
    const timer = setInterval(updateMessage, 60000);
    return () => clearInterval(timer);
  }, []);

  const message = messages[messageIndex];

  return (
    <div className={styles.message}>
      <p className="heading-s">
        “{message.first}
        <br />
        <span>{message.point}</span>
        {message.last}”
      </p>

      <Image src={message.image} alt="" width={544} height={182} />
    </div>
  );
}
