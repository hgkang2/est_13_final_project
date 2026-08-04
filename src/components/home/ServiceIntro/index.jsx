import styles from "./ServiceIntro.module.scss";

export default function ServiceIntro() {
  return (
    <section className={styles.serviceIntro}>
      <div className={styles.inner}>
        <h2 className={`heading-l-plus ${styles.title}`}>
          <span className={styles.highlightYellow}>돈을 모으는 방법</span>
          은 생각보다 간단합니다.
          <br />
          기록부터 목표 달성까지, <span className={styles.highlightGreen}>한 번에.</span>
        </h2>

        <p className={`heading-l-plus ${styles.slogan}`}>
          <span>모으는 즐거움,</span> 이루는 기쁨.
        </p>

        <div className={styles.scrollArrow} aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
