"use client";

import { useEffect, useState } from "react";
import styles from "../Transaction.module.scss";

export default function TransactionEdit({
  transaction,
  onClose,
  onCancel,
  onSave,
}) {
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (!transaction) return;

    setEditForm({
      type: transaction.type,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.categoryType,
      date: transaction.date.replaceAll(".", "-"),
      paymentMethod: transaction.paymentMethod,
      content: transaction.content ?? "",
      memo: transaction.memo ?? "",
    });
  }, [transaction]);

  if (!transaction || !editForm) return null;

  const handleChange = event => {
    const { name, value } = event.target;

    setEditForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleTypeChange = type => {
    setEditForm(prevForm => ({
      ...prevForm,
      type,
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    onSave(editForm);
  };

  return (
    <aside className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <button
          type="button"
          className={styles.detailHeaderButton}
          onClick={onClose}
          aria-label="수정 닫기"
        >
          <span className="material-icons" aria-hidden="true">
            close
          </span>
        </button>

        <h2 className={styles.detailTitle}>소비 기록 수정</h2>

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
              <span>원본 영수증을 참고하여 내용을 수정할 수 있습니다.</span>
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

      <form className={styles.detailFields} onSubmit={handleSubmit}>
        <section className={styles.detailField}>
          <h3>거래구분</h3>

          <div className={styles.detailTypeOptions}>
            <button
              type="button"
              className={`${styles.detailTypeButton} ${
                editForm.type === "income" ? styles.detailTypeActiveIncome : ""
              }`}
              onClick={() => handleTypeChange("income")}
            >
              <span className="material-icons" aria-hidden="true">
                arrow_upward
              </span>
              <strong>수입</strong>
            </button>

            <button
              type="button"
              className={`${styles.detailTypeButton} ${
                editForm.type === "expense"
                  ? styles.detailTypeActiveExpense
                  : ""
              }`}
              onClick={() => handleTypeChange("expense")}
            >
              <span className="material-icons" aria-hidden="true">
                arrow_downward
              </span>
              <strong>지출</strong>
            </button>

            <button
              type="button"
              className={`${styles.detailTypeButton} ${
                editForm.type === "transfer"
                  ? styles.detailTypeActiveTransfer
                  : ""
              }`}
              onClick={() => handleTypeChange("transfer")}
            >
              <span className="material-icons" aria-hidden="true">
                sync_alt
              </span>
              <strong>이체</strong>
            </button>
          </div>
        </section>

        <section className={styles.detailField}>
          <label htmlFor="editAmount">금액</label>

          <div className={styles.editInputBox}>
            <input
              id="editAmount"
              name="amount"
              type="number"
              value={editForm.amount}
              onChange={handleChange}
            />
            <span>원</span>
          </div>
        </section>

        <div className={styles.detailFieldRow}>
          <section className={styles.detailField}>
            <label htmlFor="editCategory">카테고리</label>

            <select
              id="editCategory"
              name="category"
              value={editForm.category}
              onChange={handleChange}
              className={styles.editSelect}
            >
              <option value="cafeSnack">카페/간식</option>
              <option value="food">식비</option>
              <option value="transportation">교통</option>
              <option value="salary">월급</option>
              <option value="otherIncome">부수입</option>
              <option value="savings">저축</option>
            </select>
          </section>

          <section className={styles.detailField}>
            <label htmlFor="editDate">날짜</label>

            <input
              id="editDate"
              name="date"
              type="date"
              value={editForm.date}
              onChange={handleChange}
              className={styles.editInput}
            />
          </section>
        </div>

        <section className={styles.detailField}>
          <label htmlFor="editPaymentMethod">결제수단</label>

          <select
            id="editPaymentMethod"
            name="paymentMethod"
            value={editForm.paymentMethod}
            onChange={handleChange}
            className={`${styles.editSelect} ${styles.editPaymentSelect}`}
          >
            <option value="신용카드">신용카드</option>
            <option value="체크카드">체크카드</option>
            <option value="계좌이체">계좌이체</option>
            <option value="현금">현금</option>
            <option value="교통카드">교통카드</option>
          </select>
        </section>

        <section className={styles.detailField}>
          <label htmlFor="editContent">내용</label>

          <input
            id="editContent"
            name="content"
            type="text"
            maxLength={50}
            value={editForm.content}
            onChange={handleChange}
            className={styles.editInput}
          />

          <span className={styles.detailCharacterCount}>
            {editForm.content.length}/50
          </span>
        </section>

        <section className={styles.detailField}>
          <label htmlFor="editMemo">메모</label>

          <input
            id="editMemo"
            name="memo"
            type="text"
            maxLength={50}
            value={editForm.memo}
            onChange={handleChange}
            className={styles.editInput}
          />

          <span className={styles.detailCharacterCount}>
            {editForm.memo.length}/50
          </span>
        </section>

        <div className={styles.editActions}>
          <button
            type="button"
            className={styles.editCancelButton}
            onClick={onCancel}
          >
            취소하기
          </button>

          <button type="submit" className={styles.editSaveButton}>
            저장하기
          </button>
        </div>
      </form>
    </aside>
  );
}
