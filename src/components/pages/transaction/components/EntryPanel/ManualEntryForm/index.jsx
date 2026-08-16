import { useEffect, useRef, useState } from "react";
import styles from "./ManualEntryForm.module.scss";

export default function ManualEntryForm({
  transactionForm,
  transactionErrors,
  categories,
  paymentMethods,
  transferAccounts,
  isTransfer,
  onTransactionFormChange,
  onToggleRecurring,
  onResetTransactionForm,
}) {
  const timeInputRef = useRef(null);
  const receiptPreviewDialogRef = useRef(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");

  const filteredCategories = categories.filter(
    category => category.transaction_type === transactionForm.type,
  );

  useEffect(() => {
    if (!transactionForm.attachment) {
      setAttachmentPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(transactionForm.attachment);

    setAttachmentPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [transactionForm.attachment]);

  return (
    <>
      <div className={styles.formFields}>
        <fieldset className={styles.formField}>
          <div className={styles.formLabelRow}>
            <legend className={styles.formLabel}>거래구분</legend>

            <button
              type="button"
              className={styles.resetButton}
              onClick={onResetTransactionForm}
            >
              <span className="material-icons" aria-hidden="true">
                restart_alt
              </span>
              <span>초기화</span>
            </button>
          </div>
          <div className={styles.transactionTypeOptions}>
            <label
              className={`${styles.transactionTypeButton} ${
                styles.incomeTypeButton
              } ${
                transactionForm.type === "income" ? styles.activeTypeButton : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="income"
                checked={transactionForm.type === "income"}
                onChange={onTransactionFormChange}
              />

              <span className="material-icons" aria-hidden="true">
                arrow_upward
              </span>

              <span>수입</span>
            </label>

            <label
              className={`${styles.transactionTypeButton} ${
                styles.expenseTypeButton
              } ${
                transactionForm.type === "expense"
                  ? styles.activeTypeButton
                  : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="expense"
                checked={transactionForm.type === "expense"}
                onChange={onTransactionFormChange}
              />

              <span className="material-icons" aria-hidden="true">
                arrow_downward
              </span>

              <span>지출</span>
            </label>

            <label
              className={`${styles.transactionTypeButton} ${
                styles.transferTypeButton
              } ${
                transactionForm.type === "transfer"
                  ? styles.activeTypeButton
                  : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="transfer"
                checked={transactionForm.type === "transfer"}
                onChange={onTransactionFormChange}
              />

              <span className="material-icons" aria-hidden="true">
                sync_alt
              </span>

              <span>이체</span>
            </label>
          </div>
        </fieldset>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            금액 <span className={styles.requiredMark}>*</span>
          </span>

          <span
            className={`${styles.amountInputBox} ${
              transactionErrors.amount ? styles.errorField : ""
            }`}
          >
            <input
              type="number"
              name="amount"
              min="0"
              inputMode="numeric"
              value={transactionForm.amount}
              onChange={onTransactionFormChange}
              placeholder="금액을 입력하세요"
              aria-invalid={Boolean(transactionErrors.amount)}
            />

            <strong>원</strong>
          </span>

          {transactionErrors.amount && (
            <span className={styles.errorMessage}>
              {transactionErrors.amount}
            </span>
          )}
        </label>

        {isTransfer ? (
          <>
            <div className={styles.formFieldRow}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>
                  출금 <span className={styles.requiredMark}>*</span>
                </span>

                <span
                  className={`${styles.selectBox} ${
                    transactionErrors.withdrawAccount ? styles.errorField : ""
                  }`}
                >
                  <select
                    name="withdrawAccount"
                    value={transactionForm.withdrawAccount}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.withdrawAccount)}
                  >
                    <option value="">출금 계좌 선택</option>

                    {transferAccounts.map(account => (
                      <option value={account.id} key={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    keyboard_arrow_down
                  </span>
                </span>

                {transactionErrors.withdrawAccount && (
                  <span className={styles.errorMessage}>
                    {transactionErrors.withdrawAccount}
                  </span>
                )}
              </label>

              <label className={styles.formField}>
                <span className={styles.formLabel}>
                  입금 <span className={styles.requiredMark}>*</span>
                </span>

                <span
                  className={`${styles.selectBox} ${
                    transactionErrors.depositAccount ? styles.errorField : ""
                  }`}
                >
                  <select
                    name="depositAccount"
                    value={transactionForm.depositAccount}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.depositAccount)}
                  >
                    <option value="">입금 계좌 선택</option>

                    {transferAccounts.map(account => (
                      <option value={account.id} key={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    keyboard_arrow_down
                  </span>
                </span>

                {transactionErrors.depositAccount && (
                  <span className={styles.errorMessage}>
                    {transactionErrors.depositAccount}
                  </span>
                )}
              </label>
            </div>

            <div className={styles.formFieldRow}>
              <label className={styles.formField}>
                <div className={styles.formLabelRow}>
                  <span className={styles.formLabel}>
                    카테고리 <span className={styles.requiredMark}>*</span>
                  </span>

                  {isTransfer && (
                    <div className={styles.recurringControl}>
                      <span>반복</span>

                      <button
                        type="button"
                        className={`${styles.recurringSwitch} ${
                          transactionForm.isRecurring
                            ? styles.recurringSwitchActive
                            : ""
                        }`}
                        onClick={onToggleRecurring}
                        role="switch"
                        aria-checked={transactionForm.isRecurring}
                        aria-label="반복 이체 설정"
                      >
                        <span className={styles.recurringSwitchHandle} />
                      </button>
                    </div>
                  )}
                </div>

                <span
                  className={`${styles.selectBox} ${
                    transactionErrors.category ? styles.errorField : ""
                  }`}
                >
                  <select
                    name="category"
                    value={transactionForm.category}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.category)}
                  >
                    <option value="">카테고리 선택</option>

                    {filteredCategories.map(category => (
                      <option value={category.id} key={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    keyboard_arrow_down
                  </span>
                </span>

                {transactionErrors.category && (
                  <span className={styles.errorMessage}>
                    {transactionErrors.category}
                  </span>
                )}
              </label>
              {transactionForm.isRecurring ? (
                <label className={styles.formField}>
                  <span className={styles.formLabel}>반복일</span>

                  <span className={styles.recurringDateBox}>
                    <select
                      name="recurringDay"
                      value={transactionForm.recurringDay}
                      onChange={onTransactionFormChange}
                    >
                      {Array.from({ length: 31 }, (_, index) => {
                        const day = String(index + 1);

                        return (
                          <option value={day} key={day}>
                            매월 {day}일
                          </option>
                        );
                      })}
                    </select>

                    <span className="material-icons" aria-hidden="true">
                      calendar_month
                    </span>
                  </span>
                  <div className={styles.timePicker}>
                    <input
                      ref={timeInputRef}
                      type="time"
                      name="time"
                      value={transactionForm.time}
                      onChange={onTransactionFormChange}
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

                      <span>{transactionForm.time || "시간 설정"}</span>

                      {transactionForm.time && (
                        <span className={styles.timeAction}>변경</span>
                      )}
                    </button>
                  </div>
                </label>
              ) : (
                <label className={styles.formField}>
                  <span className={styles.formLabel}>
                    날짜 <span className={styles.requiredMark}>*</span>
                  </span>

                  <span
                    className={`${styles.dateInputBox} ${
                      transactionErrors.date ? styles.errorField : ""
                    }`}
                  >
                    <input
                      type="date"
                      name="date"
                      value={transactionForm.date ?? ""}
                      onChange={onTransactionFormChange}
                      aria-invalid={Boolean(transactionErrors.date)}
                    />
                  </span>

                  <div className={styles.timePicker}>
                    <input
                      ref={timeInputRef}
                      type="time"
                      name="time"
                      value={transactionForm.time}
                      onChange={onTransactionFormChange}
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

                      <span>{transactionForm.time || "시간 설정"}</span>

                      {transactionForm.time && (
                        <span className={styles.timeAction}>변경</span>
                      )}
                    </button>
                  </div>

                  {transactionErrors.date && (
                    <span className={styles.errorMessage}>
                      {transactionErrors.date}
                    </span>
                  )}
                </label>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.formFieldRow}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>
                  카테고리 <span className={styles.requiredMark}>*</span>
                </span>

                <span
                  className={`${styles.selectBox} ${
                    transactionErrors.category ? styles.errorField : ""
                  }`}
                >
                  <select
                    name="category"
                    value={transactionForm.category}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.category)}
                  >
                    <option value="">카테고리 선택</option>

                    {filteredCategories.map(category => (
                      <option value={category.id} key={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    keyboard_arrow_down
                  </span>
                </span>

                {transactionErrors.category && (
                  <span className={styles.errorMessage}>
                    {transactionErrors.category}
                  </span>
                )}
              </label>

              <label className={styles.formField}>
                <span className={styles.formLabel}>
                  날짜 <span className={styles.requiredMark}>*</span>
                </span>
                <span
                  className={`${styles.dateInputBox} ${
                    transactionErrors.date ? styles.errorField : ""
                  }`}
                >
                  <input
                    type="date"
                    name="date"
                    value={transactionForm.date ?? ""}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.date)}
                  />
                </span>

                <div className={styles.timePicker}>
                  <input
                    ref={timeInputRef}
                    type="time"
                    name="time"
                    value={transactionForm.time}
                    onChange={onTransactionFormChange}
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

                    <span>{transactionForm.time || "시간 설정"}</span>

                    {transactionForm.time && (
                      <span className={styles.timeAction}>변경</span>
                    )}
                  </button>
                </div>

                {transactionErrors.date && (
                  <span className={styles.errorMessage}>
                    {transactionErrors.date}
                  </span>
                )}
              </label>
            </div>

            <label className={styles.formField}>
              <span className={styles.formLabel}>
                결제수단 <span className={styles.requiredMark}>*</span>
              </span>

              <span
                className={`${styles.selectBox} ${styles.paymentSelectBox} ${
                  transactionErrors.paymentMethod ? styles.errorField : ""
                }`}
              >
                <select
                  name="paymentMethod"
                  value={transactionForm.paymentMethod}
                  onChange={onTransactionFormChange}
                  aria-invalid={Boolean(transactionErrors.paymentMethod)}
                >
                  <option value="">결제수단 선택</option>

                  {paymentMethods.map(method => (
                    <option value={method.id} key={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>

                <span className="material-icons" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </span>

              {transactionErrors.paymentMethod && (
                <span className={styles.errorMessage}>
                  {transactionErrors.paymentMethod}
                </span>
              )}
            </label>
          </>
        )}

        <label className={styles.formField}>
          <span className={styles.formLabel}>내용</span>

          <input
            type="text"
            name="content"
            value={transactionForm.content}
            onChange={onTransactionFormChange}
            className={styles.textInput}
            placeholder="내용을 입력하세요 (선택)"
            maxLength={50}
          />

          <span className={styles.characterCount}>
            {transactionForm.content.length}/50
          </span>
        </label>

        <label className={styles.formField}>
          <span className={styles.formLabel}>메모</span>

          <input
            type="text"
            name="memo"
            value={transactionForm.memo}
            onChange={onTransactionFormChange}
            className={styles.textInput}
            placeholder="메모를 입력하세요 (선택)"
            maxLength={50}
          />

          <span className={styles.characterCount}>
            {transactionForm.memo.length}/50
          </span>
        </label>
      </div>

      <section className={styles.attachmentSection}>
        <div className={styles.attachmentDescription}>
          <h3>거래 자료 첨부</h3>

          <p>영수증, 거래내역 등을 거래 기록과 함께 보관하세요.</p>
        </div>

        <label className={styles.attachmentBox}>
          <input
            type="file"
            name="attachment"
            accept="image/*"
            onChange={onTransactionFormChange}
          />

          {attachmentPreview ? (
            <button
              type="button"
              className={styles.attachmentPreviewButton}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                receiptPreviewDialogRef.current?.showModal();
              }}
              aria-label="선택한 영수증 크게 보기"
            >
              <img
                src={attachmentPreview}
                alt="선택한 영수증 미리보기"
                className={styles.attachmentPreviewImage}
              />
            </button>
          ) : (
            <span
              className={`material-icons ${styles.attachmentIcon}`}
              aria-hidden="true"
            >
              add_photo_alternate
            </span>
          )}

          <span className={styles.attachmentText}>
            <strong>
              {transactionForm.attachment
                ? transactionForm.attachment.name
                : "이미지 등록"}
            </strong>

            <small>
              {transactionForm.attachment
                ? "이미지를 클릭하면 크게 볼 수 있어요."
                : "이 영역을 클릭하거나 이미지를 드래그 하세요."}
            </small>
          </span>
        </label>
      </section>
      {attachmentPreview && (
        <dialog
          ref={receiptPreviewDialogRef}
          className={styles.receiptPreviewDialog}
          aria-label="선택한 영수증 확대 보기"
        >
          <div
            className={styles.receiptPreviewContent}
            onClick={event => {
              if (event.target === event.currentTarget) {
                receiptPreviewDialogRef.current?.close();
              }
            }}
          >
            <button
              type="button"
              className={styles.receiptPreviewClose}
              onClick={() => receiptPreviewDialogRef.current?.close()}
              aria-label="영수증 확대 보기 닫기"
            >
              <span className="material-icons" aria-hidden="true">
                close
              </span>
            </button>

            <img
              src={attachmentPreview}
              alt="선택한 영수증 확대 이미지"
              className={styles.receiptPreviewLargeImage}
            />
          </div>
        </dialog>
      )}
    </>
  );
}
