import styles from "./MultipleEntryForm.module.scss";

export default function MultipleEntryForm({
  multipleRows,
  multipleRowStatus,
  categories,
  paymentMethods,
  onMultipleRowChange,
  onAddMultipleRow,
  onRemoveMultipleRow,
  onCancelMultipleEntry,
  onMultipleSubmit,
}) {
  return (
    <div className={styles.multipleEntryContent}>
      <section className={styles.multipleTable}>
        <div className={styles.multipleTableHeader}>
          <div className={styles.multipleNumberHeader} />
          <div>날짜</div>
          <div>구분</div>
          <div>카테고리</div>
          <div>내용</div>
          <div>금액</div>
          <div>결제수단</div>
          <div>메모</div>

          <div className={styles.multipleHelp}>
            <span className="material-icons" aria-hidden="true">
              help_outline
            </span>
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

              <span className={styles.multipleSelect}>
                <select
                  name="paymentMethod"
                  value={row.paymentMethod}
                  onChange={event => onMultipleRowChange(row.id, event)}
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
          >
            {multipleRowStatus.available}건 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
