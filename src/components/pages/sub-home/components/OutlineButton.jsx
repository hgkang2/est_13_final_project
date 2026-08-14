import Link from "next/link";
import styles from "../SubHome.module.scss";

export default function OutlineButton({ children, onClick, href }) {
  const content = (
    <>
      <span>{children}</span>

      <span className="material-icons" aria-hidden="true">
        arrow_forward
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.outlineButton}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.outlineButton} onClick={onClick}>
      {content}
    </button>
  );
}
