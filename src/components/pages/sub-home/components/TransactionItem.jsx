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
  const categoryClassMap = {
    cafe_snack: styles.cafeCategory,
    salary: styles.salaryCategory,
    food: styles.foodCategory,
    saving_transfer: styles.savingsCategory,
  };

  return (
    <li className={styles.transactionItem}>
      <Image src={imageSrc} alt="" width={40} height={40} aria-hidden="true" />

      <div className={styles.transactionInfo}>
        <strong>{title}</strong>
        <span className={categoryClassMap[categoryType]}>{category}</span>
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
