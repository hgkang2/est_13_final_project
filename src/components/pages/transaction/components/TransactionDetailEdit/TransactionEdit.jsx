"use client";

import { useEffect, useState } from "react";
import styles from "./TransactionDetailEdit.module.scss";

export default function TransactionEdit({
  transaction,
  onClose,
  onCancel,
  onSave,
}) {
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    if (!transaction) return;
    setEditForm({
      type: transaction.type,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.categoryType,
      date: transaction.date.split(" ")[0].replaceAll(".", "-"),
      paymentMethod: transaction.paymentMethod,
      content: transaction.content ?? "",
      memo: transaction.memo ?? "",

      withdrawAccount: transaction.withdrawAccount ?? "",
      depositAccount: transaction.depositAccount ?? "",
    });
  }, [transaction]);

  if (!transaction || !editForm) return null;

  const handleChange = event => {
    const { name, value } = event.target;

    setEditErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));

    setEditForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleTypeChange = type => {
    setEditErrors({});

    setEditForm(prevForm => ({
      ...prevForm,
      type,
      paymentMethod: type === "transfer" ? "" : prevForm.paymentMethod,
      withdrawAccount: type === "transfer" ? prevForm.withdrawAccount : "",
      depositAccount: type === "transfer" ? prevForm.depositAccount : "",
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    const errors = validateEditForm(editForm);

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditErrors({});
    onSave(editForm);
  };

  const validateEditForm = form => {
    const errors = {};

    if (!form.amount) {
      errors.amount = "금액을 입력해주세요.";
    }

    if (!form.category) {
      errors.category = "카테고리를 선택해주세요.";
    }

    if (!form.date) {
      errors.date = "날짜를 선택해주세요.";
    }

    if (!form.paymentMethod && form.type !== "transfer") {
      errors.paymentMethod = "결제수단을 선택해주세요.";
    }

    if (form.type === "transfer") {
      if (!form.withdrawAccount) {
        errors.withdrawAccount = "출금 계좌를 선택해주세요.";
      }

      if (!form.depositAccount) {
        errors.depositAccount = "입금 계좌를 선택해주세요.";
      }
    }

    return errors;
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
          <label htmlFor="editAmount">
            금액 <span className={styles.requiredMark}>*</span>
          </label>

          <div
            className={`${styles.editInputBox} ${
              editErrors.amount ? styles.errorField : ""
            }`}
          >
            <input
              id="editAmount"
              name="amount"
              type="number"
              value={editForm.amount}
              onChange={handleChange}
              aria-invalid={Boolean(editErrors.amount)}
            />
            <span>원</span>
          </div>

          {editErrors.amount && (
            <span className={styles.errorMessage}>{editErrors.amount}</span>
          )}
        </section>
        <div className={styles.detailFieldRow}>
          <section className={styles.detailField}>
            <label htmlFor="editCategory">
              카테고리 <span className={styles.requiredMark}>*</span>
            </label>

            <select
              id="editCategory"
              name="category"
              value={editForm.category}
              onChange={handleChange}
              className={`${styles.editSelect} ${
                editErrors.category ? styles.errorField : ""
              }`}
              aria-invalid={Boolean(editErrors.category)}
            >
              <option value="">카테고리 선택</option>
              <option value="cafeSnack">카페/간식</option>
              <option value="food">식비</option>
              <option value="transportation">교통</option>
              <option value="salary">월급</option>
              <option value="otherIncome">부수입</option>
              <option value="savings">저축</option>
            </select>

            {editErrors.category && (
              <span className={styles.errorMessage}>{editErrors.category}</span>
            )}
          </section>

          <section className={styles.detailField}>
            <label htmlFor="editDate">
              날짜 <span className={styles.requiredMark}>*</span>
            </label>

            <input
              id="editDate"
              name="date"
              type="date"
              value={editForm.date}
              onChange={handleChange}
              className={`${styles.editInput} ${
                editErrors.date ? styles.errorField : ""
              }`}
              aria-invalid={Boolean(editErrors.date)}
            />

            {editErrors.date && (
              <span className={styles.errorMessage}>{editErrors.date}</span>
            )}
          </section>
        </div>

        {editForm.type === "transfer" ? (
          <div className={styles.detailFieldRow}>
            <section className={styles.detailField}>
              <label htmlFor="editWithdrawAccount">
                출금 계좌 <span className={styles.requiredMark}>*</span>
              </label>

              <select
                id="editWithdrawAccount"
                name="withdrawAccount"
                value={editForm.withdrawAccount}
                onChange={handleChange}
                className={`${styles.editSelect} ${
                  editErrors.withdrawAccount ? styles.errorField : ""
                }`}
                aria-invalid={Boolean(editErrors.withdrawAccount)}
              >
                <option value="">출금 계좌 선택</option>
                <option value="mainAccount">주거래 계좌</option>
                <option value="salaryAccount">급여 계좌</option>
                <option value="savingAccount">저축 계좌</option>
                <option value="cash">현금</option>
              </select>

              {editErrors.withdrawAccount && (
                <span className={styles.errorMessage}>
                  {editErrors.withdrawAccount}
                </span>
              )}
            </section>

            <section className={styles.detailField}>
              <label htmlFor="editDepositAccount">
                입금 계좌 <span className={styles.requiredMark}>*</span>
              </label>

              <select
                id="editDepositAccount"
                name="depositAccount"
                value={editForm.depositAccount}
                onChange={handleChange}
                className={`${styles.editSelect} ${
                  editErrors.depositAccount ? styles.errorField : ""
                }`}
                aria-invalid={Boolean(editErrors.depositAccount)}
              >
                <option value="">입금 계좌 선택</option>
                <option value="mainAccount">주거래 계좌</option>
                <option value="salaryAccount">급여 계좌</option>
                <option value="savingAccount">저축 계좌</option>
                <option value="cash">현금</option>
              </select>

              {editErrors.depositAccount && (
                <span className={styles.errorMessage}>
                  {editErrors.depositAccount}
                </span>
              )}
            </section>
          </div>
        ) : (
          <section className={styles.detailField}>
            <label htmlFor="editPaymentMethod">
              결제수단 <span className={styles.requiredMark}>*</span>
            </label>

            <select
              id="editPaymentMethod"
              name="paymentMethod"
              value={editForm.paymentMethod}
              onChange={handleChange}
              className={`${styles.editSelect} ${styles.editPaymentSelect} ${
                editErrors.paymentMethod ? styles.errorField : ""
              }`}
              aria-invalid={Boolean(editErrors.paymentMethod)}
            >
              <option value="">결제수단 선택</option>
              <option value="신용카드">신용카드</option>
              <option value="체크카드">체크카드</option>
              <option value="계좌이체">계좌이체</option>
              <option value="현금">현금</option>
              <option value="교통카드">교통카드</option>
            </select>

            {editErrors.paymentMethod && (
              <span className={styles.errorMessage}>
                {editErrors.paymentMethod}
              </span>
            )}
          </section>
        )}

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
