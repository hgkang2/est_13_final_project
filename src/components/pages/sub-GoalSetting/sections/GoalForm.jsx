"use client";

import { useRef, useState } from "react";
import styles from "../GoalSetting.module.scss";

const AMOUNT_OPTIONS = [
  { label: "5만", value: 50000 },
  { label: "10만", value: 100000 },
  { label: "50만", value: 500000 },
  { label: "100만", value: 1000000 },
];

const GOAL_IMAGE_MAX_SIZE = 2 * 1024 * 1024;
const GOAL_IMAGE_TYPES = ["image/jpeg", "image/png"];

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

  const [goalFormError, setGoalFormError] = useState("");
  const [goalFormIsSaving, setGoalFormIsSaving] = useState(false);

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

    if (!GOAL_IMAGE_TYPES.includes(selectedFile.type)) {
      setGoalFormError("JPG 또는 PNG 이미지 파일만 선택해주세요.");
      event.target.value = "";
      setGoalFormImage(null);
      return;
    }

    if (selectedFile.size > GOAL_IMAGE_MAX_SIZE) {
      setGoalFormError("이미지는 최대 2MB까지 업로드할 수 있습니다.");
      event.target.value = "";
      setGoalFormImage(null);
      return;
    }

    setGoalFormError("");
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
    setGoalFormError("");

    if (goalFormFileInputRef.current) {
      goalFormFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = goalFormName.trim();
    const targetAmount = Number(goalFormAmount);

    if (!trimmedName) {
      setGoalFormError("목표 이름을 입력해주세요.");
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setGoalFormError("목표 금액을 0원보다 크게 입력해주세요.");
      return;
    }

    if (!goalFormStartDate || !goalFormEndDate) {
      setGoalFormError("시작일과 종료일을 입력해주세요.");
      return;
    }

    if (goalFormEndDate < goalFormStartDate) {
      setGoalFormError("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    setGoalFormError("");
    setGoalFormIsSaving(true);

    const savedGoal = {
      id: initialGoal?.id ?? null,
      dday: initialGoal?.dday ?? "",
      title: trimmedName,
      status: initialGoal?.status ?? "진행 중",
      currentAmount: initialGoal?.currentAmount ?? 0,
      targetAmount,
      progress: initialGoal?.progress ?? 0,
      targetDate: goalFormEndDate,
      startDate: goalFormStartDate,
      memo: goalFormMemo,
      imageFile: goalFormImage,
      imagePath: initialGoal?.imagePath ?? null,
      imageName: goalFormImage?.name ?? initialGoal?.imageName ?? "",
      imageUrl: goalFormImage
        ? URL.createObjectURL(goalFormImage)
        : (initialGoal?.imageUrl ?? ""),
      color: initialGoal?.color ?? "green",
    };

    try {
      const didSave = await onSave(savedGoal);

      if (didSave === false) {
        setGoalFormError("목표를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setGoalFormIsSaving(false);
    }
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

        {goalFormError && (
          <p className={styles.goalSettingFormError} role="alert">
            {goalFormError}
          </p>
        )}

        <footer
          className={`${styles.goalSettingFormActions} ${
            goalFormIsEditMode ? styles.goalSettingFormActionsEdit : ""
          }`}
        >
          <button type="submit" value="save" disabled={goalFormIsSaving}>
            {goalFormIsSaving
              ? "저장 중..."
              : goalFormIsEditMode
                ? "수정하기"
                : "저장하기"}
          </button>

          {goalFormIsEditMode && (
            <button
              type="button"
              value="stop"
              disabled={goalFormIsSaving}
              onClick={handleStopGoal}
            >
              중단
            </button>
          )}
        </footer>
      </form>
    </aside>
  );
}
