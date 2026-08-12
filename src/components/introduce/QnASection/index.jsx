"use client";

import { useState } from "react";
import styles from "./QnASection.module.scss";

const questions = [
  {
    question: "모음은 어떤 서비스인가요?",
    answer:
      "모음은 목표 기반 저축과 소비 기록을 통해 건강한 소비 습관을 만들어가는 금융 챌린지 서비스입니다. AI 소비 분석과 친구 챌린지를 통해 즐겁게 저축할 수 있어요.",
  },
  {
    question: "챌린지는 어떻게 참여하나요?",
    answer:
      "원하는 저축 목표를 설정한 뒤 챌린지를 선택하면 바로 참여할 수 있습니다. 친구를 초대해 함께 진행하거나 혼자서도 자유롭게 도전할 수 있습니다.",
  },
  {
    question: "AI 분석은 어떤 방식으로 이루어지나요?",
    answer: "사용자의 소비 내역을 분석하여 소비 패턴을 파악하고, 절약 포인트와 맞춤형 소비 리포트를 제공합니다.",
  },
  {
    question: "저축한 금액은 안전한가요?",
    answer:
      "모음은 사용자의 저축 목표와 소비 기록을 관리하는 서비스이며, 실제 금융 거래는 제휴 금융기관의 안전한 시스템을 통해 이루어집니다.",
  },
  {
    question: "친구를 초대하면 어떤 혜택이 있나요?",
    answer:
      "친구와 함께 챌린지에 참여하면 특별한 배지와 이벤트 혜택을 받을 수 있으며, 함께 목표를 달성하는 재미도 느낄 수 있습니다.",
  },
];

export default function QnASection() {
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <section id="qna" className={`${styles.section} ${styles.qnaSection}`}>
      <div className={styles.inner}>
        <div className={styles.sectionTitle}>
          <span className={`body-xm`}>02</span>

          <div>
            <p className={`body-m-plus`}>QUESTION & ANSWER</p>
            <h2 className={`heading-s`}>Q&A</h2>
          </div>
        </div>

        <div className={styles.qnaLayout}>
          <div>
            <h3 className={`body-l`}>
              모음이 궁금하다면
              <br />
              먼저 확인해보세요.
            </h3>

            <p className={`body-m`}>자주 묻는 질문을 모아두었어요.</p>
          </div>

          <div className={styles.accordion}>
            {questions.map((item, index) => (
              <div key={item.question} className={styles.question}>
                <button type="button" onClick={() => setOpenQuestion(openQuestion === index ? null : index)}>
                  <span>{item.question}</span>

                  <strong className={openQuestion === index ? styles.openIcon : ""}>+</strong>
                </button>

                {openQuestion === index && <div className={styles.answer}>{item.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
