import styles from "./TransactionDetailEdit.module.scss";

export default function TransactionDetail({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!transaction) return null;

  return (
    <aside className={styles.detailPanel} aria-label="소비 기록 상세">
      <div className={styles.detailHeader}>
        <button
          type="button"
          className={styles.detailHeaderButton}
          onClick={onClose}
          aria-label="상세 보기 닫기"
        >
          <span className="material-icons" aria-hidden="true">
            close
          </span>
        </button>

        <h2 className={styles.detailTitle}>소비 기록 상세</h2>

        <div className={styles.detailHistoryIcon}>
          <span className="material-icons" aria-hidden="true">
            history
          </span>
        </div>
      </div>

      {transaction.receiptImage && (
        <>
          <div className={styles.detailReceiptNotice}>
            <span
              className={`material-icons ${styles.detailReceiptNoticeIcon}`}
              aria-hidden="true"
            >
              check_circle
            </span>

            <div className={styles.detailReceiptNoticeText}>
              <strong>영수증으로 등록된 내역이에요</strong>
              <span>원본 영수증을 함께 확인할 수 있습니다.</span>
            </div>
          </div>

          <section className={styles.detailReceiptSection}>
            <h3>영수증 / 거래내역 첨부</h3>

            <div className={styles.detailReceiptImageBox}>
              <img src={transaction.receiptImage} alt="등록된 영수증" />
            </div>
          </section>
        </>
      )}

      <div className={styles.detailFields}>
        <section className={styles.detailField}>
          <h3>거래구분</h3>

          <div className={styles.detailTypeOptions}>
            <div
              className={`${styles.detailTypeButton} ${
                transaction.type === "income"
                  ? styles.detailTypeActiveIncome
                  : ""
              }`}
            >
              <span className="material-icons" aria-hidden="true">
                arrow_upward
              </span>
              <strong>수입</strong>
            </div>

            <div
              className={`${styles.detailTypeButton} ${
                transaction.type === "expense"
                  ? styles.detailTypeActiveExpense
                  : ""
              }`}
            >
              <span className="material-icons" aria-hidden="true">
                arrow_downward
              </span>
              <strong>지출</strong>
            </div>

            <div
              className={`${styles.detailTypeButton} ${
                transaction.type === "transfer"
                  ? styles.detailTypeActiveTransfer
                  : ""
              }`}
            >
              <span className="material-icons" aria-hidden="true">
                sync_alt
              </span>
              <strong>이체</strong>
            </div>
          </div>
        </section>

        <section className={styles.detailField}>
          <h3>금액</h3>

          <div className={styles.detailValueBox}>
            <strong>{transaction.amount.toLocaleString("ko-KR")}</strong>
            <span>원</span>
          </div>
        </section>

        <div className={styles.detailFieldRow}>
          <section className={styles.detailField}>
            <h3>카테고리</h3>

            <div className={styles.detailValueBox}>
              <strong
                className={
                  styles[transaction.categoryType]
                    ? styles[transaction.categoryType]
                    : ""
                }
              >
                {transaction.category}
              </strong>
            </div>
          </section>

          <section className={styles.detailField}>
            <h3>날짜</h3>

            <div className={styles.detailValueBox}>
              <strong>
                {transaction.date}
                {transaction.time ? ` ${transaction.time}` : ""}
              </strong>
            </div>
          </section>
        </div>

        <section className={styles.detailField}>
          <h3>결제수단</h3>

          <div
            className={`${styles.detailValueBox} ${styles.detailPaymentBox}`}
          >
            <span>{transaction.paymentMethod}</span>
          </div>
        </section>

        <section className={styles.detailField}>
          <h3>내용</h3>

          <div className={styles.detailValueBox}>
            <span>{transaction.content}</span>
          </div>

          <span className={styles.detailCharacterCount}>
            {transaction.content?.length ?? 0}/50
          </span>
        </section>

        <section className={styles.detailField}>
          <h3>메모</h3>

          <div className={styles.detailValueBox}>
            <span>{transaction.memo || "-"}</span>
          </div>

          <span className={styles.detailCharacterCount}>
            {transaction.memo?.length ?? 0}/50
          </span>
        </section>
      </div>

      <div className={styles.detailMeta}>
        <div>
          <strong>등록일</strong>
          <span>{transaction.createdAt}</span>
        </div>

        <div>
          <strong>수정일</strong>
          <span>{transaction.updatedAt}</span>
        </div>
      </div>

      <div className={styles.detailActions}>
        <button
          type="button"
          className={styles.detailDeleteButton}
          onClick={onDelete}
        >
          삭제하기
        </button>

        <button
          type="button"
          className={styles.detailEditButton}
          onClick={onEdit}
        >
          수정하기
        </button>
      </div>
    </aside>
  );
}
