import styles from "./TransactionDetailEdit.module.scss";

export default function TransactionReceiptSection({
  transaction,
  editForm,
  editErrors,
  attachmentPreview,
  attachmentInputRef,
  onRemoveAttachment,
  onCancelNewAttachment,
}) {
  return (
    <>
      {transaction.receiptImage && !editForm.removeAttachment && (
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
              <span>기존 영수증을 교체하거나 삭제할 수 있습니다.</span>
            </div>
          </div>

          <section className={styles.detailReceiptSection}>
            <h3>영수증 / 거래내역 첨부</h3>

            <div className={styles.detailReceiptImageBox}>
              <img
                src={attachmentPreview || transaction.receiptImage}
                alt={
                  attachmentPreview
                    ? "새로 선택한 영수증 미리보기"
                    : "등록된 영수증"
                }
              />
            </div>

            <div className={styles.receiptEditActions}>
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
              >
                교체하기
              </button>

              <button type="button" onClick={onRemoveAttachment}>
                첨부 삭제
              </button>
            </div>

            {editForm.attachment && (
              <div className={styles.newAttachmentInfo}>
                <span className="material-icons" aria-hidden="true">
                  image
                </span>

                <span>{editForm.attachment.name}</span>
              </div>
            )}

            {editErrors.attachment && (
              <span className={styles.errorMessage}>
                {editErrors.attachment}
              </span>
            )}
          </section>
        </>
      )}

      {!transaction.receiptImage && !editForm.attachment && (
        <section className={styles.detailReceiptSection}>
          <h3>영수증 / 거래내역 첨부</h3>

          <button
            type="button"
            className={styles.addAttachmentButton}
            onClick={() => attachmentInputRef.current?.click()}
          >
            <span className="material-icons" aria-hidden="true">
              add_photo_alternate
            </span>

            <span>영수증 첨부하기</span>
          </button>

          {editErrors.attachment && (
            <span className={styles.errorMessage}>{editErrors.attachment}</span>
          )}
        </section>
      )}

      {!transaction.receiptImage && editForm.attachment && (
        <section className={styles.detailReceiptSection}>
          <h3>영수증 / 거래내역 첨부</h3>

          {attachmentPreview && (
            <div className={styles.detailReceiptImageBox}>
              <img src={attachmentPreview} alt="새로 선택한 영수증 미리보기" />
            </div>
          )}

          <div className={styles.newAttachmentInfo}>
            <span className="material-icons" aria-hidden="true">
              image
            </span>

            <span>{editForm.attachment.name}</span>
          </div>

          <div className={styles.receiptEditActions}>
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
            >
              변경하기
            </button>

            <button type="button" onClick={onCancelNewAttachment}>
              선택 취소
            </button>
          </div>
        </section>
      )}

      {editForm.removeAttachment && (
        <div className={styles.removedAttachmentInfo}>
          <span className="material-icons" aria-hidden="true">
            delete_outline
          </span>

          <span>기존 영수증이 삭제됩니다.</span>
        </div>
      )}
    </>
  );
}
