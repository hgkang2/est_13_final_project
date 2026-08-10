"use client";

import { useRef, useState } from "react";
import styles from "../GoalSetting.module.scss";

const AMOUNT_OPTIONS = [
  { label: "5만", value: 50000 },
  { label: "10만", value: 100000 },
  { label: "50만", value: 500000 },
  { label: "100만", value: 1000000 },
];

export default function GoalForm({ initialGoal = null, onClose, onSave }) {
  const goalFormFileInputRef = useRef(null);

  const [goalFormName, setGoalFormName] = useState(initialGoal?.title ?? "");

  const [goalFormAmount, setGoalFormAmount] = useState(
    initialGoal?.targetAmount ? String(initialGoal.targetAmount) : "",
  );

  const [goalFormStartDate, setGoalFormStartDate] = useState(
    initialGoal?.startDate?.replace(/\./g, "-") ?? "",
  );

  const [goalFormEndDate, setGoalFormEndDate] = useState(
    initialGoal?.targetDate?.replace(/\./g, "-") ?? "",
  );

  const [goalFormImage, setGoalFormImage] = useState(null);

  const [goalFormMemo, setGoalFormMemo] = useState(initialGoal?.memo ?? "");

  const goalFormIsEditMode = Boolean(initialGoal);

  const handleAmountAdd = (amount) => {
    setGoalFormAmount((previousAmount) =>
      String((Number(previousAmount) || 0) + amount),
    );
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setGoalFormImage(selectedFile);
  };

  const resetGoalForm = () => {
    setGoalFormName(initialGoal?.title ?? "");

    setGoalFormAmount(
      initialGoal?.targetAmount ? String(initialGoal.targetAmount) : "",
    );

    setGoalFormStartDate(initialGoal?.startDate?.replace(/\./g, "-") ?? "");

    setGoalFormEndDate(initialGoal?.targetDate?.replace(/\./g, "-") ?? "");

    setGoalFormImage(null);
    setGoalFormMemo(initialGoal?.memo ?? "");

    if (goalFormFileInputRef.current) {
      goalFormFileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const savedGoal = {
      id: initialGoal?.id ?? Date.now(),
      dday: initialGoal?.dday ?? "",
      title: goalFormName,
      status: initialGoal?.status ?? "진행 중",
      currentAmount: initialGoal?.currentAmount ?? 0,
      targetAmount: Number(goalFormAmount),
      progress: initialGoal?.progress ?? 0,
      targetDate: goalFormEndDate,
      startDate: goalFormStartDate,
      memo: goalFormMemo,
      imageName: goalFormImage?.name ?? initialGoal?.imageName ?? "",
      imageUrl: goalFormImage
        ? URL.createObjectURL(goalFormImage)
        : (initialGoal?.imageUrl ?? ""),
      color: initialGoal?.color ?? "green",
    };

    onSave(savedGoal);
  };

  const handleStopGoal = () => {
    if (!initialGoal) {
      return;
    }

    onSave({
      ...initialGoal,
      status: "중단",
    });
  };

  return (
    <aside className={styles.goalSettingFormPanel} aria-label="새 목표 생성">
      <form className={styles.goalSettingForm} onSubmit={handleSubmit}>
        <header className={styles.goalSettingFormHeader}>
          <button
            type="button"
            className={styles.goalSettingFormIconButton}
            aria-label="목표 생성 닫기"
            onClick={onClose}
          >
            <span className="material-icons" aria-hidden="true">
              close
            </span>
          </button>

          <h2>{goalFormIsEditMode ? "목표 수정" : "목표 생성"}</h2>

          <button
            type="button"
            className={styles.goalSettingFormIconButton}
            aria-label="입력 내용 초기화"
            onClick={resetGoalForm}
          >
            <span className="material-icons-outlined" aria-hidden="true">
              history
            </span>
          </button>
        </header>

        <div className={styles.goalSettingFormCard}>
          <h3>목표 설정</h3>

          <label className={styles.goalSettingFormField}>
            <span className={styles.goalSettingFieldLabel}>
              이름
              <span
                className={`material-icons ${
                  goalFormName.trim()
                    ? styles.goalSettingFieldStatusComplete
                    : styles.goalSettingFieldStatus
                }`}
                aria-hidden="true"
              >
                task_alt
              </span>
            </span>

            <input
              type="text"
              value={goalFormName}
              placeholder="예) 여행 자금 모으기"
              required
              onChange={(event) => setGoalFormName(event.target.value)}
            />
          </label>

          <div className={styles.goalSettingFormField}>
            <label
              className={styles.goalSettingFieldLabel}
              htmlFor="goalFormAmount"
            >
              금액
              <span
                className={`material-icons ${
                  Number(goalFormAmount) > 0
                    ? styles.goalSettingFieldStatusComplete
                    : styles.goalSettingFieldStatus
                }`}
                aria-hidden="true"
              >
                task_alt
              </span>
            </label>

            <div className={styles.goalSettingAmountInput}>
              <input
                id="goalFormAmount"
                type="number"
                min="0"
                value={goalFormAmount}
                placeholder="0"
                required
                onChange={(event) => setGoalFormAmount(event.target.value)}
              />

              <span>원</span>
            </div>

            <div className={styles.goalSettingAmountOptions}>
              {AMOUNT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleAmountAdd(option.value)}
                >
                  <span className="material-icons" aria-hidden="true">
                    add
                  </span>

                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <fieldset className={styles.goalSettingDateField}>
            <legend className={styles.goalSettingFieldLabel}>
              기간
              <span
                className={`material-icons ${
                  goalFormStartDate && goalFormEndDate
                    ? styles.goalSettingFieldStatusComplete
                    : styles.goalSettingFieldStatus
                }`}
                aria-hidden="true"
              >
                task_alt
              </span>
            </legend>

            <div>
              <label>
                <span>시작일</span>

                <div className={styles.goalSettingDateInput}>
                  <input
                    type="date"
                    value={goalFormStartDate}
                    required
                    onChange={(event) =>
                      setGoalFormStartDate(event.target.value)
                    }
                  />

                  <span className="material-icons" aria-hidden="true">
                    calendar_month
                  </span>
                </div>
              </label>

              <label>
                <span>종료일</span>

                <div className={styles.goalSettingDateInput}>
                  <input
                    type="date"
                    min={goalFormStartDate}
                    value={goalFormEndDate}
                    required
                    onChange={(event) => setGoalFormEndDate(event.target.value)}
                  />

                  <span className="material-icons" aria-hidden="true">
                    calendar_month
                  </span>
                </div>
              </label>
            </div>
          </fieldset>

          {/* 이미지 */}
          <div className={styles.goalSettingFormField}>
            <span className={styles.goalSettingFieldLabel}>이미지</span>

            <input
              ref={goalFormFileInputRef}
              id="goalFormImage"
              className={styles.goalSettingImageInput}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
            />

            <label
              htmlFor="goalFormImage"
              className={styles.goalSettingImageButton}
            >
              <span>
                {goalFormImage?.name ||
                  initialGoal?.imageName ||
                  "JPG, PNG (최대 2MB) (선택)"}
              </span>

              <span className="material-icons" aria-hidden="true">
                photo_camera
              </span>
            </label>
          </div>

          <label className={styles.goalSettingFormField}>
            <span className={styles.goalSettingFieldLabel}>메모</span>

            <input
              type="text"
              value={goalFormMemo}
              maxLength={50}
              placeholder="메모를 입력하세요 (선택)"
              onChange={(event) => setGoalFormMemo(event.target.value)}
            />

            <span className={styles.goalSettingMemoCount} aria-live="polite">
              {goalFormMemo.length}/50
            </span>
          </label>
        </div>

        <footer
          className={`${styles.goalSettingFormActions} ${
            goalFormIsEditMode ? styles.goalSettingFormActionsEdit : ""
          }`}
        >
          <button type="submit" value="save">
            {goalFormIsEditMode ? "수정하기" : "저장하기"}
          </button>

          {goalFormIsEditMode && (
            <button type="button" value="stop" onClick={handleStopGoal}>
              중단
            </button>
          )}
        </footer>
      </form>
    </aside>
  );
}
