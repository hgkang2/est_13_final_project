import styles from "./EntryPanel.module.scss";
import ManualEntryForm from "./ManualEntryForm";
import MultipleEntryForm from "./MultipleEntryForm";
import AiEntryForm from "./AiEntryForm";

export default function EntryPanel({
  entryState,
  manualEntry,
  multipleEntry,
  aiEntry,
  panelActions,
}) {
  const { entryTab, entryMode } = entryState;

  const {
    transactionForm,
    transactionErrors,

    categories,
    paymentMethods,
    transferAccounts,

    onTransactionFormChange,
    onToggleRecurring,
    onTransactionSubmit,
    onContinueEntry,
    onResetTransactionForm,
  } = manualEntry;

  const {
    multipleRows,
    multipleRowStatus,
    onMultipleRowChange,
    onAddMultipleRow,
    onRemoveMultipleRow,
    onCancelMultipleEntry,
    onMultipleSubmit,
  } = multipleEntry;

  const {
    aiStatus,
    aiTransactionForm,
    aiTransactionErrors,
    aiPreview,
    onAiFormChange,
    onAiReceiptChange,
    onAiDragOver,
    onAiDrop,
    onAiTransactionSubmit,
  } = aiEntry;

  const { onClose, onOpenRecent, onEntryTabChange, onEntryModeChange } =
    panelActions;

  const isTransfer = transactionForm.type === "transfer";

  return (
    <aside
      className={`${styles.entryPanel} ${
        entryMode === "multiple" ? styles.multipleEntryPanel : ""
      }`}
      aria-label="소비 기록 입력"
    >
      <div className={styles.entryPanelHeader}>
        {entryMode === "multiple" ? (
          <button
            type="button"
            className={styles.multipleBackButton}
            onClick={() => onEntryModeChange("single")}
          >
            <span className="material-icons" aria-hidden="true">
              arrow_back
            </span>

            <span>소비 기록으로 돌아가기</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              className={styles.entryHeaderButton}
              onClick={() => onClose()}
              aria-label="소비 기록 입력창 닫기"
            >
              <span className="material-icons" aria-hidden="true">
                close
              </span>
            </button>

            <h2 className={styles.entryPanelTitle}>소비 기록 입력</h2>
          </>
        )}

        <button
          type="button"
          className={styles.entryHeaderButton}
          onClick={() => onOpenRecent()}
          aria-label="최근 입력 기록 보기"
        >
          <span className="material-icons" aria-hidden="true">
            history
          </span>
        </button>
      </div>

      <div
        className={`${styles.entryTabs} ${
          entryMode === "multiple" ? styles.multipleEntryTabs : ""
        }`}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={entryTab === "manual"}
          className={`${styles.entryTab} ${
            entryTab === "manual" ? styles.activeEntryTab : ""
          }`}
          onClick={() => onEntryTabChange("manual")}
        >
          직접입력
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={entryTab === "ai"}
          className={`${styles.entryTab} ${
            entryTab === "ai" ? styles.activeEntryTab : ""
          }`}
          onClick={() => onEntryTabChange("ai")}
        >
          AI 자동 인식
        </button>
      </div>

      {entryTab === "manual" ? (
        <form className={styles.entryForm} onSubmit={onTransactionSubmit}>
          <section
            className={`${styles.entryModeSection} ${
              entryMode === "multiple" ? styles.multipleEntryModeSection : ""
            }`}
          >
            <div className={styles.entryModeContent}>
              <h3 className={styles.formSectionTitle}>입력 방식 선택</h3>

              <div className={styles.entryModeOptions}>
                <button
                  type="button"
                  className={`${styles.entryModeButton} ${
                    entryMode === "single" ? styles.activeEntryMode : ""
                  }`}
                  onClick={() => onEntryModeChange("single")}
                >
                  <strong>단건 입력</strong>
                  <span>거래를 하나씩 입력</span>
                </button>

                <button
                  type="button"
                  className={`${styles.entryModeButton} ${
                    entryMode === "multiple" ? styles.activeEntryMode : ""
                  }`}
                  onClick={() => onEntryModeChange("multiple")}
                >
                  <strong>다건 입력</strong>
                  <span>여러 거래를 한 번에 입력</span>
                </button>
              </div>
            </div>

            {entryMode === "multiple" && (
              <section
                className={styles.multipleStatus}
                aria-label="다건 입력 작성 상태"
              >
                <div className={styles.multipleStatusItem}>
                  <span>작성 중</span>
                  <strong className={styles.writingCount}>
                    {multipleRows.length}건
                  </strong>
                </div>

                <div className={styles.statusDivider} />

                <div className={styles.multipleStatusItem}>
                  <span>오류</span>
                  <strong className={styles.errorCount}>
                    {multipleRowStatus.error}건
                  </strong>
                </div>

                <div className={styles.statusDivider} />

                <div className={styles.multipleStatusItem}>
                  <span>저장 가능</span>
                  <strong className={styles.availableCount}>
                    {multipleRowStatus.available}건
                  </strong>
                </div>
              </section>
            )}
          </section>
          {entryMode === "single" ? (
            <ManualEntryForm
              transactionForm={transactionForm}
              transactionErrors={transactionErrors}
              categories={categories}
              paymentMethods={paymentMethods}
              transferAccounts={transferAccounts}
              isTransfer={isTransfer}
              onTransactionFormChange={onTransactionFormChange}
              onToggleRecurring={onToggleRecurring}
              onResetTransactionForm={onResetTransactionForm}
            />
          ) : (
            <MultipleEntryForm
              multipleRows={multipleRows}
              multipleRowStatus={multipleRowStatus}
              categories={categories}
              paymentMethods={paymentMethods}
              transferAccounts={transferAccounts}
              onMultipleRowChange={onMultipleRowChange}
              onAddMultipleRow={onAddMultipleRow}
              onRemoveMultipleRow={onRemoveMultipleRow}
              onCancelMultipleEntry={onCancelMultipleEntry}
              onMultipleSubmit={onMultipleSubmit}
            />
          )}
          {entryMode === "single" && (
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>
                저장하기
              </button>

              <button
                type="button"
                className={styles.continueButton}
                onClick={onContinueEntry}
              >
                계속 입력
              </button>
            </div>
          )}
        </form>
      ) : (
        <AiEntryForm
          aiStatus={aiStatus}
          aiTransactionForm={aiTransactionForm}
          aiTransactionErrors={aiTransactionErrors}
          aiPreview={aiPreview}
          categories={categories}
          paymentMethods={paymentMethods}
          onAiFormChange={onAiFormChange}
          onAiReceiptChange={onAiReceiptChange}
          onAiDragOver={onAiDragOver}
          onAiDrop={onAiDrop}
          onAiTransactionSubmit={onAiTransactionSubmit}
        />
      )}
    </aside>
  );
}
