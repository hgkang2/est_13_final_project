import styles from "../Transaction.module.scss";

const emptyContents = {
  empty: {
    icon: "playlist_add",
    title: "소비 기록이 없어요.",
    description: "입력 또는 AI 자동 인식으로 소비 기록을 추가해보세요.",
  },
  filter: {
    icon: "filter_alt_off",
    title: "조건에 맞는 소비 기록이 없어요.",
    description: "다른 조건을 선택해서 거래 내역을 확인해보세요.",
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
