import styles from "./AiEntryForm.module.scss";

export default function AiEntryForm({
  aiStatus,
  aiTransactionForm,
  aiTransactionErrors,
  aiPreview,
  onAiFormChange,
  onAiReceiptChange,
  onAiDragOver,
  onAiDrop,
  onAiTransactionSubmit,
}) {
  return (
    <form className={styles.aiEntryForm} onSubmit={onAiTransactionSubmit}>
      <section className={styles.aiRecognitionSection}>
        <div className={styles.aiRecognitionHeading}>
          <h3>AI 스마트 인식</h3>

          <p>
            이미지를 먼저 업로드해주세요.
            <br />
            AI가 거래 정보를 자동으로 입력합니다.
          </p>
        </div>

        {aiStatus === "idle" && (
          <label
            className={styles.aiUploadBox}
            onDragOver={onAiDragOver}
            onDrop={onAiDrop}
          >
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={onAiReceiptChange}
            />

            <span
              className={`material-icons ${styles.aiUploadIcon}`}
              aria-hidden="true"
            >
              add_photo_alternate
            </span>

            <div className={styles.aiUploadText}>
              <strong>영수증 이미지를 드래그하거나 클릭하여 업로드</strong>

              <span>JPG, PNG · 최대 2MB</span>
            </div>
          </label>
        )}

        {aiStatus === "analyzing" && (
          <div
            className={styles.aiRecognitionBox}
            role="status"
            aria-live="polite"
          >
            <div className={styles.aiSpinner} aria-hidden="true" />

            <div className={styles.aiRecognitionMessage}>
              <strong>
                거래 정보를 분석하고 있습니다
                <span className={styles.loadingDots} />
              </strong>
              <span>잠시만 기다려 주세요</span>
            </div>
          </div>
        )}

        {aiStatus === "success" && (
          <div className={styles.aiRecognitionBox}>
            <span
              className={`material-icons ${styles.aiSuccessIcon}`}
              aria-hidden="true"
            >
              check_circle
            </span>

            <div className={styles.aiRecognitionMessage}>
              <strong>AI가 거래 정보를 입력했습니다.</strong>
              <span>내용을 확인 후 저장해주세요</span>
            </div>

            {aiPreview && (
              <img
                src={aiPreview}
                alt="업로드한 영수증 미리보기"
                className={styles.aiReceiptPreview}
              />
            )}
          </div>
        )}
      </section>

      <div className={styles.aiFormFields}>
        <fieldset className={styles.formField}>
          <legend className={styles.aiFormLabel}>거래구분</legend>

          <div className={styles.transactionTypeOptions}>
            <label
              className={`${styles.transactionTypeButton} ${
                aiStatus === "success"
                  ? styles.incomeTypeButton
                  : styles.aiDisabledTypeButton
              } ${
                aiTransactionForm.type === "income"
                  ? styles.activeTypeButton
                  : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="income"
                checked={aiTransactionForm.type === "income"}
                onChange={onAiFormChange}
                disabled={aiStatus !== "success"}
              />

              <span className="material-icons" aria-hidden="true">
                arrow_upward
              </span>

              <span>수입</span>
            </label>

            <label
              className={`${styles.transactionTypeButton} ${
                aiStatus === "success"
                  ? styles.expenseTypeButton
                  : styles.aiDisabledTypeButton
              } ${
                aiTransactionForm.type === "expense"
                  ? styles.activeTypeButton
                  : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="expense"
                checked={aiTransactionForm.type === "expense"}
                onChange={onAiFormChange}
                disabled={aiStatus !== "success"}
              />

              <span className="material-icons" aria-hidden="true">
                arrow_downward
              </span>

              <span>지출</span>
            </label>

            <label
              className={`${styles.transactionTypeButton} ${
                aiStatus === "success"
                  ? styles.transferTypeButton
                  : styles.aiDisabledTypeButton
              } ${
                aiTransactionForm.type === "transfer"
                  ? styles.activeTypeButton
                  : ""
              }`}
            >
              <input
                type="radio"
                name="type"
                value="transfer"
                checked={aiTransactionForm.type === "transfer"}
                onChange={onAiFormChange}
                disabled={aiStatus !== "success"}
              />

              <span className="material-icons" aria-hidden="true">
                sync_alt
              </span>

              <span>이체</span>
            </label>
          </div>
        </fieldset>

        <label className={styles.formField}>
          <span className={styles.aiFormLabel}>
            금액
            {aiStatus === "success" && (
              <span className={styles.requiredMark}> *</span>
            )}
          </span>

          <span
            className={`${styles.amountInputBox} ${
              aiTransactionErrors.amount ? styles.errorField : ""
            }`}
          >
            <input
              type="number"
              name="amount"
              value={aiTransactionForm.amount}
              onChange={onAiFormChange}
              disabled={aiStatus !== "success"}
              placeholder={aiStatus === "idle" ? "금액을 입력하세요" : ""}
              aria-invalid={Boolean(aiTransactionErrors.amount)}
            />

            {aiStatus === "analyzing" && (
              <span className={styles.analyzingText}>
                분석 중입니다
                <span className={styles.loadingDots} />
              </span>
            )}

            <strong>원</strong>
          </span>

          {aiTransactionErrors.amount && (
            <span className={styles.errorMessage}>
              {aiTransactionErrors.amount}
            </span>
          )}
        </label>

        <div className={styles.formFieldRow}>
          <label className={styles.formField}>
            <span className={styles.aiFormLabel}>
              카테고리
              {aiStatus === "success" && (
                <span className={styles.requiredMark}> *</span>
              )}
            </span>

            <span
              className={`${styles.selectBox} ${
                aiTransactionErrors.category ? styles.errorField : ""
              }`}
            >
              <select
                name="category"
                value={aiTransactionForm.category}
                onChange={onAiFormChange}
                disabled={aiStatus !== "success"}
                aria-invalid={Boolean(aiTransactionErrors.category)}
              >
                <option value="">
                  {aiStatus === "analyzing"
                    ? "분석 중입니다..."
                    : "카테고리 선택"}
                </option>

                <option value="salary">월급</option>
                <option value="otherIncome">부수입</option>
                <option value="food">식비</option>
                <option value="cafeSnack">카페/간식</option>
                <option value="transportation">교통</option>
                <option value="shopping">쇼핑</option>
                <option value="subscription">구독</option>
                <option value="savings">저축</option>
                <option value="other">기타</option>
              </select>

              <span className="material-icons" aria-hidden="true">
                keyboard_arrow_down
              </span>
            </span>

            {aiTransactionErrors.category && (
              <span className={styles.errorMessage}>
                {aiTransactionErrors.category}
              </span>
            )}
          </label>

          <label className={styles.formField}>
            <span className={styles.aiFormLabel}>
              날짜
              {aiStatus === "success" && (
                <span className={styles.requiredMark}> *</span>
              )}
            </span>
            <span className={styles.dateInputBox}>
              {aiStatus === "analyzing" ? (
                <>
                  <span className={styles.aiAnalyzingText}>
                    분석 중입니다...
                  </span>

                  <span className="material-icons" aria-hidden="true">
                    calendar_month
                  </span>
                </>
              ) : (
                <input
                  type="date"
                  name="date"
                  value={aiTransactionForm.date}
                  onChange={onAiFormChange}
                  disabled={aiStatus !== "success"}
                />
              )}
            </span>
          </label>
        </div>

        <label className={styles.formField}>
          <span className={styles.aiFormLabel}>
            결제수단
            {aiStatus === "success" && (
              <span className={styles.requiredMark}> *</span>
            )}
          </span>

          <span
            className={`${styles.selectBox} ${styles.aiPaymentSelectBox} ${
              aiTransactionErrors.paymentMethod ? styles.errorField : ""
            }`}
          >
            <select
              name="paymentMethod"
              value={aiTransactionForm.paymentMethod}
              onChange={onAiFormChange}
              disabled={aiStatus !== "success"}
              aria-invalid={Boolean(aiTransactionErrors.paymentMethod)}
            >
              <option value="">
                {aiStatus === "analyzing"
                  ? "분석 중입니다..."
                  : "결제수단 선택"}
              </option>

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

          {aiTransactionErrors.paymentMethod && (
            <span className={styles.errorMessage}>
              {aiTransactionErrors.paymentMethod}
            </span>
          )}
        </label>

        <label className={styles.formField}>
          <span className={styles.aiFormLabel}>내용</span>

          <input
            type="text"
            name="content"
            value={aiTransactionForm.content}
            onChange={onAiFormChange}
            disabled={aiStatus !== "success"}
            className={styles.textInput}
            placeholder={
              aiStatus === "analyzing"
                ? "분석 중입니다..."
                : "내용을 입력하세요 (선택)"
            }
            maxLength={50}
          />

          <span className={styles.characterCount}>
            {aiTransactionForm.content.length}/50
          </span>
        </label>

        <label className={styles.formField}>
          <span className={styles.aiFormLabel}>메모</span>

          <input
            type="text"
            name="memo"
            value={aiTransactionForm.memo}
            onChange={onAiFormChange}
            disabled={aiStatus !== "success"}
            className={styles.textInput}
            placeholder={
              aiStatus === "analyzing"
                ? "분석 중입니다..."
                : "메모를 입력하세요 (선택)"
            }
            maxLength={50}
          />

          <span className={styles.characterCount}>
            {aiTransactionForm.memo.length}/50
          </span>
        </label>
      </div>

      <button
        type="submit"
        className={`${styles.aiSaveButton} ${
          aiStatus === "success" ? styles.aiSaveButtonActive : ""
        }`}
        disabled={aiStatus !== "success"}
      >
        저장하기
      </button>
    </form>
  );
}
