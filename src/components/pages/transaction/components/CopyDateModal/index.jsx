import styles from "./CopyDateModal.module.scss";

export default function CopyDateModal({ copyTarget, onClose, onSelectDate }) {
  return (
    <div className={styles.copyModalBackdrop} onClick={onClose}>
      <div
        className={styles.copyModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-modal-title"
        onClick={event => event.stopPropagation()}
      >
        <div className={styles.copyModalHeader}>
          <strong id="copy-modal-title">날짜 선택</strong>

          <button
            type="button"
            className={styles.copyModalClose}
            onClick={onClose}
            aria-label="닫기"
          >
            <span className="material-icons" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <p className={styles.copyModalDescription}>
          거래를 어떤 날짜로 복사할까요?
        </p>

        <div className={styles.copyModalOptions}>
          <button
            type="button"
            className={styles.copyDateOption}
            onClick={() => onSelectDate("today")}
          >
            <span className={styles.copyDateOptionText}>
              <strong>오늘 날짜로 복사</strong>
              <span>오늘의 거래로 새롭게 기록해요.</span>
            </span>

            <span className="material-icons" aria-hidden="true">
              chevron_right
            </span>
          </button>

          <button
            type="button"
            className={styles.copyDateOption}
            onClick={() => onSelectDate("original")}
          >
            <span className={styles.copyDateOptionText}>
              <strong>기존 작성일로 복사</strong>
              <span>{copyTarget?.date} 날짜를 그대로 사용해요.</span>
            </span>

            <span className="material-icons" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
