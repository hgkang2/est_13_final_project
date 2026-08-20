import Link from "next/link";
import styles from "../SubHome.module.scss";

export default function MoreButton({ children, onClick, href }) {
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
      <Link href={href} prefetch={false} className={styles.moreButton}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.moreButton} onClick={onClick}>
      {content}
    </button>
  );
}
