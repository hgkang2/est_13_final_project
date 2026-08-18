import { useRef } from "react";
import styles from "./AiEntryForm.module.scss";

export default function AiEntryForm({
  aiStatus,
  aiErrorMessage,
  aiTransactionForm,
  aiTransactionErrors,
  aiPreview,
  categories,
  paymentMethods,
  transferAccounts,
  focusGoals = [],
  onAiFormChange,
  onToggleAiRecurring,
  onAiReceiptChange,
  onAiDragOver,
  onAiDrop,
  onAiTransactionSubmit,
}) {
  const timeInputRef = useRef(null);
  const receiptPreviewDialogRef = useRef(null);
  const transferDestinationValue = aiTransactionForm.savingGoal
    ? `goal:${aiTransactionForm.savingGoal}`
    : aiTransactionForm.depositAccount
      ? `account:${aiTransactionForm.depositAccount}`
      : "";

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
              accept="image/jpeg, image/png, image/webp"
              onChange={onAiReceiptChange}
              className={styles.hiddenFileInput}
            />

            <span
              className={`material-icons ${styles.aiUploadIcon}`}
              aria-hidden="true"
            >
              add_photo_alternate
            </span>

            <div className={styles.aiUploadText}>
              <strong>영수증 이미지를 드래그하거나 클릭하여 업로드</strong>

              <span>JPG, PNG, WEBP · 최대 5MB</span>
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

        {aiStatus === "error" && (
          <label
            className={`${styles.aiRecognitionBox} ${styles.aiErrorBox}`}
            onDragOver={onAiDragOver}
            onDrop={onAiDrop}
          >
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={onAiReceiptChange}
              className={styles.hiddenFileInput}
            />

            <span
              className={`material-icons ${styles.aiErrorIcon}`}
              aria-hidden="true"
            >
              error_outline
            </span>

            <div className={styles.aiRecognitionMessage}>
              <strong>이미지를 분석하지 못했습니다.</strong>
              <span>{aiErrorMessage}</span>
              <span>다른 이미지를 다시 업로드해주세요.</span>
            </div>
          </label>
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
              <button
                type="button"
                className={styles.aiReceiptPreviewButton}
                onClick={() => receiptPreviewDialogRef.current?.showModal()}
                aria-label="영수증 이미지 크게 보기"
              >
                <img
                  src={aiPreview}
                  alt="업로드한 영수증 미리보기"
                  className={styles.aiReceiptPreview}
                />
              </button>
            )}
          </div>
        )}
      </section>

      {aiPreview && (
        <dialog
          ref={receiptPreviewDialogRef}
          className={styles.receiptPreviewDialog}
          aria-label="영수증 이미지 확대 보기"
          onClick={event => {
            if (event.target === event.currentTarget) {
              receiptPreviewDialogRef.current?.close();
            }
          }}
        >
          <div className={styles.receiptPreviewContent}>
            <button
              type="button"
              className={styles.receiptPreviewClose}
              onClick={() => receiptPreviewDialogRef.current?.close()}
              aria-label="영수증 이미지 확대 보기 닫기"
            >
              <span className="material-icons" aria-hidden="true">
                close
              </span>
            </button>

            <img
              src={aiPreview}
              alt="업로드한 영수증 확대 이미지"
              className={styles.receiptPreviewImage}
            />
          </div>
        </dialog>
      )}

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
            <div className={styles.formLabelRow}>
              <span className={styles.aiFormLabel}>
                카테고리
                {aiStatus === "success" && (
                  <span className={styles.requiredMark}> *</span>
                )}
              </span>

              {aiStatus === "success" &&
                aiTransactionForm.type === "transfer" &&
                !aiTransactionForm.savingGoal && (
                  <div className={styles.recurringControl}>
                    <span>반복</span>

                    <button
                      type="button"
                      className={`${styles.recurringSwitch} ${
                        aiTransactionForm.isRecurring
                          ? styles.recurringSwitchActive
                          : ""
                      }`}
                      onClick={onToggleAiRecurring}
                      role="switch"
                      aria-checked={aiTransactionForm.isRecurring}
                      aria-label="AI 반복 이체 설정"
                    >
                      <span className={styles.recurringSwitchHandle} />
                    </button>
                  </div>
                )}
            </div>

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

                {categories
                  .filter(
                    category =>
                      category.transaction_type === aiTransactionForm.type,
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
            </span>

            {aiTransactionErrors.category && (
              <span className={styles.errorMessage}>
                {aiTransactionErrors.category}
              </span>
            )}
          </label>
          <label className={styles.formField}>
            <span className={styles.aiFormLabel}>
              {aiTransactionForm.isRecurring ? "반복일" : "날짜"}

              {!aiTransactionForm.isRecurring && aiStatus === "success" && (
                <span className={styles.requiredMark}> *</span>
              )}
            </span>

            {aiTransactionForm.isRecurring ? (
              <span className={styles.recurringDateBox}>
                <select
                  name="recurringDay"
                  value={aiTransactionForm.recurringDay}
                  onChange={onAiFormChange}
                  disabled={aiStatus !== "success"}
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
            ) : (
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
            )}

            <div className={styles.aiTimePicker}>
              <input
                ref={timeInputRef}
                type="time"
                name="time"
                value={aiTransactionForm.time ?? ""}
                onChange={onAiFormChange}
                className={styles.hiddenTimeInput}
                disabled={aiStatus !== "success"}
              />

              <button
                type="button"
                className={`${styles.timeButton} ${
                  aiStatus !== "success" ? styles.timeButtonDisabled : ""
                }`}
                onClick={() => {
                  if (aiStatus !== "success") return;

                  timeInputRef.current?.showPicker();
                }}
                disabled={aiStatus !== "success"}
              >
                <span className="material-icons" aria-hidden="true">
                  schedule
                </span>

                <span>
                  {aiStatus === "analyzing"
                    ? "분석 중..."
                    : aiTransactionForm.time || "시간 설정"}
                </span>

                {aiStatus === "success" && aiTransactionForm.time && (
                  <span className={styles.timeAction}>변경</span>
                )}
              </button>
            </div>
          </label>
        </div>

        {aiTransactionForm.type === "transfer" ? (
          <div className={styles.formFieldRow}>
            <label className={styles.formField}>
              <span className={styles.aiFormLabel}>
                출금 계좌
                {aiStatus === "success" && (
                  <span className={styles.requiredMark}> *</span>
                )}
              </span>

              <span
                className={`${styles.selectBox} ${
                  aiTransactionErrors.withdrawAccount ? styles.errorField : ""
                }`}
              >
                <select
                  name="withdrawAccount"
                  value={aiTransactionForm.withdrawAccount}
                  onChange={onAiFormChange}
                  disabled={aiStatus !== "success"}
                  aria-invalid={Boolean(aiTransactionErrors.withdrawAccount)}
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
              </span>

              {aiTransactionErrors.withdrawAccount && (
                <span className={styles.errorMessage}>
                  {aiTransactionErrors.withdrawAccount}
                </span>
              )}
            </label>

            <label className={styles.formField}>
              <span className={styles.aiFormLabel}>
                입금 대상
                {aiStatus === "success" && (
                  <span className={styles.requiredMark}> *</span>
                )}
              </span>

              <span
                className={`${styles.selectBox} ${
                  aiTransactionErrors.depositAccount ||
                  aiTransactionErrors.savingGoal
                    ? styles.errorField
                    : ""
                }`}
              >
                <select
                  name="transferDestination"
                  value={transferDestinationValue}
                  onChange={onAiFormChange}
                  disabled={aiStatus !== "success"}
                  aria-invalid={Boolean(
                    aiTransactionErrors.depositAccount ||
                    aiTransactionErrors.savingGoal,
                  )}
                >
                  <option value="">입금 대상 선택</option>

                  <optgroup label="계좌 이체">
                    {transferAccounts.map(account => (
                      <option key={account.id} value={`account:${account.id}`}>
                        {account.name}
                      </option>
                    ))}
                  </optgroup>

                  {focusGoals.length > 0 && (
                    <optgroup label="집중목표 적립">
                      {focusGoals.map(goal => (
                        <option key={goal.id} value={`goal:${goal.id}`}>
                          집중목표 {goal.focus_order} ·{" "}
                          {goal.title.length > 10
                            ? `${goal.title.slice(0, 10)}...`
                            : goal.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <span className="material-icons" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </span>

              {(aiTransactionErrors.depositAccount ||
                aiTransactionErrors.savingGoal) && (
                <span className={styles.errorMessage}>
                  {aiTransactionErrors.depositAccount ||
                    aiTransactionErrors.savingGoal}
                </span>
              )}
            </label>
          </div>
        ) : (
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

                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
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
        )}

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

      <div className={styles.aiFormActions}>
        <button
          type="submit"
          className={`${styles.aiSaveButton} ${
            aiStatus === "success" ? styles.aiSaveButtonActive : ""
          }`}
          disabled={aiStatus !== "success"}
        >
          저장하기
        </button>
      </div>
    </form>
  );
}
