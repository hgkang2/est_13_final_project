import Image from "next/image";
import styles from "./ServiceSection.module.scss";

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

export default function ServiceSection() {
  return (
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
  );
}
