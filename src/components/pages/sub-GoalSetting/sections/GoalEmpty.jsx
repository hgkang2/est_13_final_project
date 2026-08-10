import styles from "../GoalSetting.module.scss";

export default function GoalEmpty({ onCreate }) {
  return (
    <section className={styles.goalSettingEmptyState}>
      <span
        className={`material-icons-outlined ${styles.goalSettingEmptyIcon}`}
        aria-hidden="true"
      >
        edit_note
      </span>

      <div className={styles.goalSettingEmptyText}>
        <h2>생성된 목표가 없어요.</h2>
        <p>새 목표 버튼을 누르고 생성해보세요!</p>
      </div>

      <button
        type="button"
        className={styles.goalSettingEmptyCreateButton}
        onClick={onCreate}
      >
        <span
          className={`material-icons ${styles.goalSettingCreateIcon}`}
          aria-hidden="true"
        >
          add
        </span>

        <span>새 목표</span>
      </button>
    </section>
  );
}
