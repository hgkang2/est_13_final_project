import styles from "../SubHome.module.scss";

export default function MoreButton({ children, onClick }) {
  return (
    <button type="button" className={styles.moreButton} onClick={onClick}>
      <span>{children}</span>

      <span className="material-icons" aria-hidden="true">
        arrow_forward
      </span>
    </button>
  );
}
