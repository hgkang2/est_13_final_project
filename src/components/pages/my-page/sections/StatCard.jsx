import styles from "../MyPage.module.scss";

export default function StatCard({ label, value, image, alt }) {
  return (
    <article className={styles.Savings_Card}>
      <div className={styles.Stat_Content}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <img src={image} alt={alt} className={styles.Savings_Image} />
    </article>
  );
}
