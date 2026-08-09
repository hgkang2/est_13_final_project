import styles from "./ManualEntryForm.module.scss";

export default function ManualEntryForm({
  transactionForm,
  transactionErrors,
  isTransfer,
  onTransactionFormChange,
  onToggleRecurring,
}) {
  return (
    <>
      <div className={styles.formFields}>
        <fieldset className={styles.formField}>
          <legend className={styles.formLabel}>거래구분</legend>

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
                    <option value="mainAccount">주거래 계좌</option>
                    <option value="salaryAccount">급여 계좌</option>
                    <option value="savingAccount">저축 계좌</option>
                    <option value="cash">현금</option>
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
                    <option value="mainAccount">주거래 계좌</option>
                    <option value="salaryAccount">급여 계좌</option>
                    <option value="savingAccount">저축 계좌</option>
                    <option value="cash">현금</option>
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
                    <option value="salary">월급</option>
                    <option value="otherIncome">부수입</option>
                    <option value="food">식비</option>
                    <option value="cafeSnack">카페/간식</option>
                    <option value="transportation">교통</option>
                    <option value="shopping">쇼핑</option>
                    <option value="subscription">구독</option>
                    <option value="other">기타</option>
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
                      value={transactionForm.date}
                      onChange={onTransactionFormChange}
                      aria-invalid={Boolean(transactionErrors.date)}
                    />
                  </span>

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
                    <option value="salary">월급</option>
                    <option value="otherIncome">부수입</option>
                    <option value="food">식비</option>
                    <option value="cafeSnack">카페/간식</option>
                    <option value="transportation">교통</option>
                    <option value="shopping">쇼핑</option>
                    <option value="subscription">구독</option>
                    <option value="other">기타</option>
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
                    value={transactionForm.date}
                    onChange={onTransactionFormChange}
                    aria-invalid={Boolean(transactionErrors.date)}
                  />
                </span>

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
                  <option value="creditCard">신용카드</option>
                  <option value="checkCard">체크카드</option>
                  <option value="accountTransfer">계좌이체</option>
                  <option value="cash">현금</option>
                  <option value="kakaoPay">카카오페이</option>
                  <option value="other">기타</option>
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

          <span
            className={`material-icons ${styles.attachmentIcon}`}
            aria-hidden="true"
          >
            add_photo_alternate
          </span>

          <span className={styles.attachmentText}>
            <strong>
              {transactionForm.attachment
                ? transactionForm.attachment.name
                : "이미지 등록"}
            </strong>

            <small>이 영역을 클릭하거나 이미지를 드래그 하세요.</small>
          </span>
        </label>
      </section>
    </>
  );
}
