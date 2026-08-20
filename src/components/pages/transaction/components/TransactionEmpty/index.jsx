import styles from "./TransactionEmpty.module.scss";

const emptyContents = {
  empty: {
    icon: "playlist_add",
    title: "소비 기록이 없어요.",
    description: "입력 또는 AI 자동 인식으로 소비 기록을 추가해보세요.",
  },
  filter: {
    icon: "filter_alt_off",
    title: "검색 결과가 없어요.",
    description: "다른 검색어나 필터 조건으로 다시 확인해보세요.",
  },
};

export default function TransactionEmpty({ type = "empty" }) {
  const content = emptyContents[type] ?? emptyContents.empty;

  return (
    <div className={styles.empty}>
      <span className={`material-icons ${styles.emptyIcon}`} aria-hidden="true">
        {content.icon}
      </span>

      <div className={styles.emptyText}>
        <strong className={styles.emptyTitle}>{content.title}</strong>

        <p className={styles.emptyDescription}>{content.description}</p>
      </div>
    </div>
  );
}
