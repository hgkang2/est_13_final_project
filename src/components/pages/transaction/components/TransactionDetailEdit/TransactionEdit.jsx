"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./TransactionDetailEdit.module.scss";
import { validateTransactionForm } from "../../utils/transactionValidator";
import TransactionReceiptSection from "./TransactionReceiptSection";

export default function TransactionEdit({
  transaction,
  categories,
  paymentMethods,
  transferAccounts,
  onClose,
  onCancel,
  onSave,
}) {
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const timeInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  useEffect(() => {
    if (!transaction) return;
    setEditForm({
      type: transaction.type,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.categoryId,
      date: transaction.date.replaceAll(".", "-"),
      time: transaction.time ?? "",
      paymentMethod: transaction.paymentMethodId,
      content: transaction.content === "-" ? "" : transaction.content,
      memo: transaction.memo ?? "",
      withdrawAccount: transaction.withdrawAccountId,
      depositAccount: transaction.depositAccountId,
      isRecurring: transaction.isRecurring ?? false,
      recurringDay: transaction.recurringDay?.toString() ?? "29",
      attachment: null, // 새로 선택한 파일
      removeAttachment: false, // 시존 영수증 삭제 여부
    });
  }, [transaction]);

  if (!transaction || !editForm) return null;

  const handleToggleRecurring = () => {
    setEditForm(prevForm => ({
      ...prevForm,
      isRecurring: !prevForm.isRecurring,
    }));
  };

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

  const handleAttachmentChange = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setEditErrors(prev => ({
        ...prev,
        attachment: "JPG, PNG, WEBP 이미지만 등록할 수 있어요.",
      }));
      return;
    }

    if (file.size > maxSize) {
      setEditErrors(prev => ({
        ...prev,
        attachment: "영수증 이미지는 5MB 이하만 등록할 수 있어요.",
      }));
      return;
    }

    setEditErrors(prev => ({
      ...prev,
      attachment: "",
    }));

    setEditForm(prev => ({
      ...prev,
      attachment: file,
      removeAttachment: false,
    }));

    setAttachmentPreview(prevPreview => {
      if (prevPreview) {
        URL.revokeObjectURL(prevPreview);
      }

      return URL.createObjectURL(file);
    });
  };

  const handleRemoveAttachment = () => {
    setEditForm(prev => ({
      ...prev,
      attachment: null,
      removeAttachment: true,
    }));

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    setAttachmentPreview(prevPreview => {
      if (prevPreview) {
        URL.revokeObjectURL(prevPreview);
      }

      return "";
    });
  };

  const handleCancelNewAttachment = () => {
    setEditForm(prev => ({
      ...prev,
      attachment: null,
    }));

    setAttachmentPreview(prevPreview => {
      if (prevPreview) {
        URL.revokeObjectURL(prevPreview);
      }

      return "";
    });

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleTypeChange = type => {
    setEditErrors({});

    setEditForm(prevForm => ({
      ...prevForm,
      type,
      category: "",
      paymentMethod: type === "transfer" ? "" : prevForm.paymentMethod,
      withdrawAccount: type === "transfer" ? prevForm.withdrawAccount : "",
      depositAccount: type === "transfer" ? prevForm.depositAccount : "",
      isRecurring: type === "transfer" ? prevForm.isRecurring : false,
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    const errors = validateTransactionForm(editForm);

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
    } else if (
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      errors.amount = "금액은 0보다 큰 숫자로 입력해주세요.";
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

      <TransactionReceiptSection
        transaction={transaction}
        editForm={editForm}
        editErrors={editErrors}
        attachmentPreview={attachmentPreview}
        attachmentInputRef={attachmentInputRef}
        onRemoveAttachment={handleRemoveAttachment}
        onCancelNewAttachment={handleCancelNewAttachment}
      />

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
            <div className={styles.formLabelRow}>
              <label htmlFor="editCategory">
                카테고리 <span className={styles.requiredMark}>*</span>
              </label>

              {editForm.type === "transfer" && (
                <div className={styles.recurringControl}>
                  <span>반복</span>

                  <button
                    type="button"
                    className={`${styles.recurringSwitch} ${
                      editForm.isRecurring ? styles.recurringSwitchActive : ""
                    }`}
                    onClick={handleToggleRecurring}
                    aria-pressed={editForm.isRecurring}
                    aria-label="반복 이체 설정"
                  >
                    <span className={styles.recurringSwitchHandle} />
                  </button>
                </div>
              )}
            </div>

            <div
              className={`${styles.selectBox} ${
                editErrors.category ? styles.errorField : ""
              }`}
            >
              <select
                id="editCategory"
                name="category"
                value={editForm.category}
                onChange={handleChange}
                aria-invalid={Boolean(editErrors.category)}
              >
                <option value="">카테고리 선택</option>

                {categories
                  .filter(
                    category => category.transaction_type === editForm.type,
                  )
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <span className="material-icons" aria-hidden="true">
                keyboard_arrow_down
              </span>
            </div>

            {editErrors.category && (
              <span className={styles.errorMessage}>{editErrors.category}</span>
            )}
          </section>

          <section className={styles.detailField}>
            {editForm.type === "transfer" && editForm.isRecurring ? (
              <>
                <label htmlFor="editRecurringDay">반복일</label>

                <div className={styles.recurringDateBox}>
                  <select
                    id="editRecurringDay"
                    name="recurringDay"
                    value={editForm.recurringDay}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 31 }, (_, index) => index + 1).map(
                      day => (
                        <option key={day} value={day}>
                          매월 {day}일
                        </option>
                      ),
                    )}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    calendar_month
                  </span>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="editDate">
                  날짜 <span className={styles.requiredMark}>*</span>
                </label>

                <input
                  id="editDate"
                  name="date"
                  type="date"
                  value={editForm.date ?? ""}
                  onChange={handleChange}
                  className={`${styles.editInput} ${
                    editErrors.date ? styles.errorField : ""
                  }`}
                  aria-invalid={Boolean(editErrors.date)}
                />

                {editErrors.date && (
                  <span className={styles.errorMessage}>{editErrors.date}</span>
                )}
              </>
            )}

            <div className={styles.timePicker}>
              <input
                ref={timeInputRef}
                type="time"
                name="time"
                value={editForm.time ?? ""}
                onChange={handleChange}
                className={styles.hiddenTimeInput}
              />

              <button
                type="button"
                className={styles.timeButton}
                onClick={() => timeInputRef.current?.showPicker()}
              >
                <span className="material-icons" aria-hidden="true">
                  schedule
                </span>

                <span>{editForm.time || "시간 설정"}</span>

                {editForm.time && (
                  <span className={styles.timeAction}>변경</span>
                )}
              </button>
            </div>
          </section>
        </div>

        {editForm.type === "transfer" ? (
          <div className={styles.detailFieldRow}>
            <section className={styles.detailField}>
              <label htmlFor="editWithdrawAccount">
                출금 계좌 <span className={styles.requiredMark}>*</span>
              </label>

              <div
                className={`${styles.selectBox} ${
                  editErrors.withdrawAccount ? styles.errorField : ""
                }`}
              >
                <select
                  id="editWithdrawAccount"
                  name="withdrawAccount"
                  value={editForm.withdrawAccount}
                  onChange={handleChange}
                  aria-invalid={Boolean(editErrors.withdrawAccount)}
                >
                  <option value="">출금 계좌 선택</option>

                  {transferAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>

                <span className="material-icons" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </div>
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
              <div
                className={`${styles.selectBox} ${
                  editErrors.depositAccount ? styles.errorField : ""
                }`}
              >
                <select
                  id="editDepositAccount"
                  name="depositAccount"
                  value={editForm.depositAccount}
                  onChange={handleChange}
                  aria-invalid={Boolean(editErrors.depositAccount)}
                >
                  <option value="">입금 계좌 선택</option>

                  {transferAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>

                <span className="material-icons" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </div>
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

            <div
              className={`${styles.selectBox} ${
                editErrors.paymentMethod ? styles.errorField : ""
              }`}
            >
              <select
                id="editPaymentMethod"
                name="paymentMethod"
                value={editForm.paymentMethod}
                onChange={handleChange}
                aria-invalid={Boolean(editErrors.paymentMethod)}
              >
                <option value="">결제수단 선택</option>

                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>

              <span className="material-icons" aria-hidden="true">
                keyboard_arrow_down
              </span>
            </div>

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
        <input
          ref={attachmentInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAttachmentChange}
          hidden
        />

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
