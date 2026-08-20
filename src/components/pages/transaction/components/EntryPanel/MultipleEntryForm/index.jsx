import styles from "./MultipleEntryForm.module.scss";

export default function MultipleEntryForm({
  multipleRows,
  multipleRowStatus,
  categories,
  paymentMethods,
  transferAccounts,
  focusGoals,
  onMultipleRowChange,
  onAddMultipleRow,
  onRemoveMultipleRow,
  onCancelMultipleEntry,
  onMultipleSubmit,
  isMutating = false,
}) {
  return (
    <div className={styles.multipleEntryContent}>
      <section className={styles.multipleTable}>
        <h3 className="sr-only">다건 거래 입력 목록</h3>

        <div className={styles.multipleTableHeader}>
          <div>날짜</div>
          <div>구분</div>
          <div>카테고리</div>
          <div>내용</div>
          <div>금액</div>
          <div>결제수단</div>
          <div>메모</div>

          <div className={styles.multipleHelp}>
            <button
              type="button"
              className={styles.multipleHelpButton}
              aria-label="다건 입력 이용 안내"
              aria-describedby="multiple-entry-help"
            >
              <span className="material-icons" aria-hidden="true">
                help_outline
              </span>
            </button>

            <div
              id="multiple-entry-help"
              className={styles.multipleHelpTooltip}
              role="tooltip"
            >
              <span>• 시간을 설정하지 않으면 현재 시간으로 저장돼요.</span>
              <span>• 다건 입력은 PC 환경에서 사용할 수 있어요.</span>
              <span>• 입력이 완료된 행만 저장돼요.</span>
            </div>
          </div>
        </div>

        <ol className={styles.multipleRowList}>
          {multipleRows.map((row, index) => (
            <li className={styles.multipleRow} key={row.id}>
              <strong className={styles.multipleRowNumber}>{index + 1}</strong>

              <div className={styles.multipleDateCell}>
                <input
                  type="date"
                  name="date"
                  value={row.date}
                  onChange={event => onMultipleRowChange(row.id, event)}
                  className={styles.multipleDateInput}
                  aria-label={`${index + 1}번 거래 날짜`}
                />

                <div className={styles.multipleTimePicker}>
                  <input
                    id={`time-${row.id}`}
                    type="time"
                    name="time"
                    value={row.time ?? ""}
                    onChange={event => onMultipleRowChange(row.id, event)}
                    className={styles.hiddenTimeInput}
                    aria-label={`${index + 1}번 거래 시간`}
                  />

                  <button
                    type="button"
                    className={styles.multipleTimeButton}
                    onClick={() => {
                      document.getElementById(`time-${row.id}`)?.showPicker();
                    }}
                  >
                    <span>{row.time || "시간 설정"}</span>

                    <span className="material-icons" aria-hidden="true">
                      schedule
                    </span>
                  </button>
                </div>
              </div>

              <span className={styles.multipleSelect}>
                <select
                  name="type"
                  value={row.type}
                  onChange={event => onMultipleRowChange(row.id, event)}
                  aria-label={`${index + 1}번 거래 구분`}
                >
                  <option value="">선택</option>
                  <option value="income">수입</option>
                  <option value="expense">지출</option>
                  <option value="transfer">이체</option>
                </select>

                <span className="material-icons" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </span>

              <span className={styles.multipleSelect}>
                <select
                  name="category"
                  value={row.category}
                  onChange={event => onMultipleRowChange(row.id, event)}
                >
                  <option value="">카테고리 선택</option>

                  {categories
                    .filter(category => category.transaction_type === row.type)
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

              <input
                type="text"
                name="content"
                value={row.content}
                onChange={event => onMultipleRowChange(row.id, event)}
                className={styles.multipleTextInput}
                placeholder="내용을 입력하세요 (선택)"
                maxLength={50}
                aria-label={`${index + 1}번 거래 내용`}
              />

              <span className={styles.multipleAmountInput}>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  inputMode="numeric"
                  value={row.amount}
                  onChange={event => onMultipleRowChange(row.id, event)}
                  placeholder="금액 입력"
                  aria-label={`${index + 1}번 거래 금액`}
                />

                <strong>원</strong>
              </span>

              {row.type === "transfer" ? (
                <span className={styles.multipleSelect}>
                  <select
                    name="transferRoute"
                    value={
                      row.withdrawAccount && row.savingGoal
                        ? `${row.withdrawAccount}|goal:${row.savingGoal}`
                        : row.withdrawAccount && row.depositAccount
                          ? `${row.withdrawAccount}|account:${row.depositAccount}`
                          : ""
                    }
                    onChange={event => onMultipleRowChange(row.id, event)}
                    aria-label={`${index + 1}번 거래 계좌 이동`}
                  >
                    <option value="">이체 경로 선택</option>

                    <optgroup label="계좌 이체">
                      {transferAccounts.flatMap(withdrawAccount =>
                        transferAccounts
                          .filter(
                            depositAccount =>
                              depositAccount.id !== withdrawAccount.id,
                          )
                          .map(depositAccount => (
                            <option
                              key={`${withdrawAccount.id}-${depositAccount.id}`}
                              value={`${withdrawAccount.id}|account:${depositAccount.id}`}
                            >
                              {withdrawAccount.name} → {depositAccount.name}
                            </option>
                          )),
                      )}
                    </optgroup>

                    {focusGoals.length > 0 && (
                      <optgroup label="집중목표 적립">
                        {transferAccounts.flatMap(withdrawAccount =>
                          focusGoals.map(goal => (
                            <option
                              key={`${withdrawAccount.id}-goal-${goal.id}`}
                              value={`${withdrawAccount.id}|goal:${goal.id}`}
                            >
                              {withdrawAccount.name} → 집중목표{" "}
                              {goal.focus_order} ·{" "}
                              {goal.title.length > 10
                                ? `${goal.title.slice(0, 10)}…`
                                : goal.title}
                            </option>
                          )),
                        )}
                      </optgroup>
                    )}
                  </select>

                  <span className="material-icons" aria-hidden="true">
                    keyboard_arrow_down
                  </span>
                </span>
              ) : (
                <span className={styles.multipleSelect}>
                  <select
                    name="paymentMethod"
                    value={row.paymentMethod}
                    onChange={event => onMultipleRowChange(row.id, event)}
                    aria-label={`${index + 1}번 거래 결제수단`}
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
                </span>
              )}

              <input
                type="text"
                name="memo"
                value={row.memo}
                onChange={event => onMultipleRowChange(row.id, event)}
                className={styles.multipleTextInput}
                placeholder="메모를 입력하세요 (선택)"
                maxLength={50}
                aria-label={`${index + 1}번 거래 메모`}
              />

              <button
                type="button"
                className={styles.removeMultipleRowButton}
                onClick={() => onRemoveMultipleRow(row.id)}
                aria-label={`${index + 1}번 거래 행 삭제`}
              >
                <span className="material-icons" aria-hidden="true">
                  clear
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.multipleActions}>
        <div className={styles.multipleLeftActions}>
          <button
            type="button"
            className={styles.addMultipleRowButton}
            onClick={onAddMultipleRow}
          >
            <span className="material-icons" aria-hidden="true">
              add
            </span>

            <span>행 추가</span>
          </button>

          <button type="button" className={styles.excelDownloadButton}>
            <span className="material-icons" aria-hidden="true">
              file_download
            </span>

            <span>엑셀 파일로 다운로드</span>
          </button>
        </div>

        <div className={styles.multipleRightActions}>
          <button
            type="button"
            className={styles.cancelMultipleButton}
            onClick={onCancelMultipleEntry}
          >
            취소
          </button>

          <button
            type="button"
            className={styles.saveMultipleButton}
            onClick={onMultipleSubmit}
            disabled={isMutating}
          >
            {multipleRowStatus.available}건 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
