import styles from "../SubHome.module.scss";

export default function OutlineButton({ children, onClick }) {
  return (
    <button type="button" className={styles.outlineButton} onClick={onClick}>
      <span>{children}</span>

      <span className="material-icons" aria-hidden="true">
        arrow_forward
      </span>
    </button>
  );
}
