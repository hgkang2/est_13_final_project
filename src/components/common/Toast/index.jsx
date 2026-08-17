"use client";

import { useEffect } from "react";
import styles from "./Toast.module.scss";

export default function Toast({
  isOpen,
  message,
  type = "success",
  duration = 5000,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info",
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`material-icons ${styles.icon}`}
        aria-hidden="true"
      >
        {icons[type] || icons.success}
      </span>

      <span className={styles.message}>{message}</span>
    </div>
  );
}