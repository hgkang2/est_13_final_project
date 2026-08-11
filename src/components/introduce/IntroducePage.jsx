"use client";

import Header from "../layout/Header";

import { useEffect, useState } from "react";
import styles from "./IntroducePage.module.scss";
import Image from "next/image";

const menus = [
  { id: "service", label: "서비스 소개" },
  { id: "qna", label: "Q&A" },
  { id: "support", label: "고객센터" },
  { id: "ai", label: "AI 소개" },
  { id: "news", label: "모음 소식" },
];

const serviceCards = [
  {
    icon: "/images/introduce/target.png",
    title: "목표 설정",
    description: "나만의 목표 금액을 정하고 저축을 시작해보세요.",
  },
  {
    icon: "/images/introduce/graph.png",
    title: "소비 분석",
    description: "AI가 소비 패턴을 분석하고 인사이트를 제공해요.",
  },
  {
    icon: "/images/introduce/friend.png",
    title: "함께 챌린지",
    description: "친구와 함께 도전하며 즐겁게 저축해요.",
  },
  {
    icon: "/images/introduce/award.png",
    title: "보상과 성장",
    description: "챌린지를 완료하고 나의 변화를 확인해보세요.",
  },
];

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

const news = [
  {
    category: "이벤트",
    date: "2026.08.01",
    title: "친구 초대 이벤트",
    description: "친구와 함께 모음을 시작하고 특별한 혜택을 받아보세요.",
  },
  {
    category: "공지",
    date: "2026.07.28",
    title: "서비스 업데이트 안내",
    description: "더 편리해진 모음의 새로운 기능을 확인해보세요.",
  },
  {
    category: "소식",
    date: "2026.07.20",
    title: "모음 챌린지 후기",
    description: "모으미들의 실제 저축 챌린지 이야기를 만나보세요.",
  },
];

export default function IntroducePage() {
  const [activeSection, setActiveSection] = useState("service");
  const [openQuestion, setOpenQuestion] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const sections = menus.map((menu) => document.getElementById(menu.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const moveToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className={styles.page}>
      <main>
        <section id="service" className={`${styles.section} ${styles.serviceSection}`}>
          <div className={styles.inner}>
            <div className={styles.sectionTitle}>
              <span className={`body-xm`}>01</span>

              <div>
                <p className={`body-m-plus`}>MOUM SERVICE</p>
                <h1 className={`heading-s`}>서비스 소개</h1>
              </div>
            </div>

            <div className={styles.hero}>
              <div className={styles.heroText}>
                <p className={styles.eyebrow}>돈을 모으는 가장 즐거운 방법</p>

                <h2>
                  작은 목표부터
                  <br />
                  즐거운 저축 습관까지
                </h2>

                <p className={styles.description}>
                  모음은 목표를 세우고 소비를 관리하며,
                  <br />
                  친구들과 함께 저축하는 금융 챌린지 서비스입니다.
                </p>

                <button type="button" className={styles.primaryButton}>
                  모음 알아보기
                </button>
              </div>

              <div className={styles.heroVisual}>
                <div className={styles.mockPhone}>
                  <Image
                    src="/images/introduce/intro_service.png"
                    alt="모음 서비스 목업"
                    width={400}
                    height={502}
                    className={styles.mockImage}
                    priority
                  />
                </div>
              </div>
            </div>

            <div className={styles.serviceGrid}>
              {serviceCards.map((card) => (
                <article key={card.title} className={styles.serviceCard}>
                  <Image src={card.icon} alt={card.title} width={50} height={50} className={styles.cardIcon} />

                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

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

        <section id="support" className={`${styles.section} ${styles.supportSection}`}>
          <div className={styles.inner}>
            <div className={styles.sectionTitle}>
              <span className={`body-xm`}>03</span>

              <div>
                <p className={`body-m-plus`}>CUSTOMER CENTER</p>
                <h2 className={`heading-s`}>고객센터</h2>
              </div>
            </div>

            <div className={styles.supportLayout}>
              <div className={styles.supportCards}>
                <article>
                  <span>🎧</span>
                  <h3>1:1 문의하기</h3>
                  <p>궁금한 내용을 남겨주세요.</p>
                </article>

                <article>
                  <span>💬</span>
                  <h3>채팅 상담</h3>
                  <p>빠르게 상담을 받아보세요.</p>
                </article>

                <article>
                  <span>📞</span>
                  <h3>전화 상담</h3>
                  <p>평일 09:00 - 18:00</p>
                </article>

                <article>
                  <span>✉️</span>
                  <h3>이메일 문의</h3>
                  <p>24시간 접수할 수 있어요.</p>
                </article>
              </div>

              <div className={styles.helpBox}>
                <span>HELP CENTER</span>

                <h3 className="body-l">
                  빠른 도움이
                  <br />
                  필요하신가요?
                </h3>

                <p className="body-m">궁금한 내용을 검색해보세요.</p>

                <div className={styles.searchBox}>
                  <input
                    className="body-m"
                    type="text"
                    placeholder="검색어를 입력해주세요."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setSearched(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchText.trim()) {
                        setSearched(true);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (searchText.trim()) {
                        setSearched(true);
                      }
                    }}
                  >
                    ⌕
                  </button>
                </div>

                {searched && <p className={styles.searchResult}>“{searchText}”에 대한 도움말을 찾았어요.</p>}

                <div className={styles.tags}>
                  <button type="button" onClick={() => setSearchText("계정")}>
                    #계정
                  </button>

                  <button type="button" onClick={() => setSearchText("챌린지")}>
                    #챌린지
                  </button>

                  <button type="button" onClick={() => setSearchText("AI 분석")}>
                    #AI 분석
                  </button>

                  <button type="button" onClick={() => setSearchText("친구초대")}>
                    #친구초대
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ai" className={`${styles.section} ${styles.aiSection}`}>
          <div className={styles.inner}>
            <div className={styles.sectionTitle}>
              <span className={`body-xm`}>04</span>

              <div>
                <p className={`body-m-plus`}>MOA AI</p>
                <h2 className={`heading-s`}>모아 AI 소개</h2>
              </div>
            </div>

            <div className={styles.aiLayout}>
              <div className={styles.aiMenu}>
                <article>
                  <span>01</span>

                  <div>
                    <h3 className={`body-m`}>소비 패턴 분석</h3>
                    <p className={`body-m`}>소비 기록을 분석해 나의 패턴을 찾아드려요.</p>
                  </div>
                </article>

                <article>
                  <span>02</span>

                  <div>
                    <h3 className={`body-m`}>맞춤형 절약 팁</h3>
                    <p className={`body-m`}>모아가 나에게 맞는 절약 방법을 추천해 드려요.</p>
                  </div>
                </article>

                <article>
                  <span>03</span>

                  <div>
                    <h3 className={`body-m`}>예산 관리</h3>
                    <p className={`body-m`}>목표 달성을 위한 예산 계획을 함께 세워 드려요.</p>
                  </div>
                </article>
              </div>

              <div className={styles.aiReport}>
                <div className={styles.reportHeader}>
                  <span>MOA REPORT</span>
                  <strong className={`body-l`}>이번 달 소비 인사이트</strong>
                </div>

                <div className={styles.reportContent}>
                  <div className={styles.chart}>
                    <div className={styles.chartCenter}>
                      <span>총 지출</span>
                      <strong>850,000원</strong>
                    </div>
                  </div>

                  <div className={styles.reportSide}>
                    <div className={styles.reportText}>
                      <span>MOA 추천 TIP</span>

                      <h3 className={`body-l`}>
                        이번 달 카페 소비가
                        <br />
                        지난달보다 늘었어요.
                      </h3>

                      <p className={`body-m`}>
                        최근 카페 소비가 조금 늘어난 것으로 보여요. 주 2회만 줄여도 한 달에 약 24,000원을 절약할 수
                        있어요.
                      </p>
                    </div>

                    <div className={styles.moaCharacter}>
                      <Image
                        src="/images/introduce/intro_moa.png"
                        alt="AI 소비 분석을 안내하는 모아"
                        width={150}
                        height={178}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="news" className={`${styles.section} ${styles.newsSection}`}>
          <div className={styles.inner}>
            <div className={styles.sectionTitle}>
              <span className={`body-xm`}>05</span>

              <div>
                <p className={`body-m-plus`}>MOUM NEWS</p>
                <h2 className={`heading-s`}>모음 소식</h2>
              </div>
            </div>

            <div className={styles.newsHeader}>
              <div>
                <h3 className={`heading-m`}>모음의 새로운 이야기를 만나보세요.</h3>
                <p className={`body-m`}>새로운 기능과 이벤트 소식을 전해드려요.</p>
              </div>

              <button type="button">전체보기 →</button>
            </div>

            <div className={styles.newsGrid}>
              {news.map((item) => (
                <article key={item.title} className={styles.newsCard}>
                  <div className={styles.newsMeta}>
                    <span>{item.category}</span>
                    <time>{item.date}</time>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <button type="button">자세히 보기 →</button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <strong>모음</strong>
          <p>© 2026 MOUM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
