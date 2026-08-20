"use client";

import styles from "./Modal.module.scss";

export default function Modal({
  isOpen,
  type = "success",
  icon,
  title,
  description,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  if (!isOpen) return null;

  const isDanger = type === "danger";
  const isConfirm = type === "confirm";

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="common-modal-title"
        onClick={event => event.stopPropagation()}
      >
        {icon && (
          <span
            className={`material-icons ${
              isDanger
                ? styles.dangerIcon
                : isConfirm
                  ? styles.confirmIcon
                  : styles.successIcon
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <div className={styles.textArea}>
          <strong id="common-modal-title" className={styles.title}>
            {title}
          </strong>

          {description && <p className={styles.description}>{description}</p>}
        </div>

        <div className={styles.actions}>
          {cancelText && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className={
              isDanger
                ? styles.dangerButton
                : isConfirm
                  ? styles.confirmButton
                  : styles.successButton
            }
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
