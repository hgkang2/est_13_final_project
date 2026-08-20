"use client";

import styles from "./GoToTop.module.scss";

export default function GoToTop() {
  const handleGoTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button type="button" className={styles.goToTop} onClick={handleGoTop} aria-label="페이지 맨 위로 이동">
      <span className="material-symbols-outlined">keyboard_arrow_up</span>
    </button>
  );
}
