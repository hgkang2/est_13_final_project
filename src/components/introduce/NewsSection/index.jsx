import styles from "./NewsSection.module.scss";

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

export default function NewsSection() {
  return (
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
  );
}
