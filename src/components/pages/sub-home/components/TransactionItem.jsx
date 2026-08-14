import Image from "next/image";
import styles from "../SubHome.module.scss";

export default function TransactionItem({
  imageSrc,
  title,
  category,
  categoryType,
  amount,
  date,
  isIncome = false,
}) {
  return (
    <li className={styles.transactionItem}>
      <Image src={imageSrc} alt="" width={40} height={40} aria-hidden="true" />

      <div className={styles.transactionInfo}>
        <strong>{title}</strong>
        <span className={styles[categoryType]}>{category}</span>
      </div>

      <div className={styles.transactionAmount}>
        <strong className={isIncome ? styles.incomeAmount : ""}>
          {amount}
        </strong>
        <span>{date}</span>
      </div>
    </li>
  );
}
