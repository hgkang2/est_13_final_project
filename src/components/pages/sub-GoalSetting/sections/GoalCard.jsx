"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../GoalSetting.module.scss";

const DEFAULT_GOAL_IMAGE = "/images/goalsetting/cheering-character.png";

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

function parseGoalDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const normalizedDate = String(dateValue).replace(/\./g, "-");

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function getGoalDaysLeft(targetDate) {
  const parsedTargetDate = parseGoalDate(targetDate);

  if (!parsedTargetDate) {
    return null;
  }

  return Math.ceil(
    (parsedTargetDate.getTime() - getToday().getTime()) / DAY_IN_MILLISECONDS,
  );
}

function getGoalDday(targetDate, fallbackDday) {
  const daysLeft = getGoalDaysLeft(targetDate);

  if (daysLeft === null) {
    return fallbackDday || "D-day";
  }

  if (daysLeft === 0) {
    return "D-day";
  }

  if (daysLeft > 0) {
    return `D-${daysLeft}`;
  }

  return `D+${Math.abs(daysLeft)}`;
}

function getGoalProgress(currentAmount, targetAmount) {
  if (!targetAmount || targetAmount <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
}

function getGoalPace(goal) {
  const currentAmount = Number(goal.currentAmount) || 0;

  const targetAmount = Number(goal.targetAmount) || 0;

  const today = getToday();

  const startDate = parseGoalDate(goal.startDate) ?? today;

  const targetDate = parseGoalDate(goal.targetDate);

  if (!targetDate || targetAmount <= 0) {
    return {
      isDifficult: false,
      lateDays: 0,
      requiredAmount: 0,
    };
  }

  const totalDays = Math.max(
    1,
    Math.ceil(
      (targetDate.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS,
    ),
  );

  const elapsedDays = Math.min(
    totalDays,
    Math.max(
      0,
      Math.floor((today.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS),
    ),
  );

  const targetAmountPerDay = targetAmount / totalDays;

  const expectedAmount = targetAmountPerDay * elapsedDays;

  const requiredAmount = Math.max(0, expectedAmount - currentAmount);

  const isDifficult = requiredAmount > 0;

  const lateDays = isDifficult
    ? Math.max(1, Math.ceil(requiredAmount / targetAmountPerDay))
    : 0;

  return {
    isDifficult,
    lateDays,
    requiredAmount,
  };
}

function formatGoalAmount(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString("ko-KR")}원`;
}

function formatGoalDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return String(dateValue).replace(/-/g, ".");
}

export default function GoalCard({ goal, focusRank, onEdit, onDelete }) {
  const goalCardPointerStartX = useRef(0);
  const goalCardRef = useRef(null);

  const [goalCardIsExpanded, setGoalCardIsExpanded] = useState(false);

  const [goalCardIsSwiped, setGoalCardIsSwiped] = useState(false);

  useEffect(() => {
    const handleOutsidePointerDown = (event) => {
      if (
        goalCardIsSwiped &&
        goalCardRef.current &&
        !goalCardRef.current.contains(event.target)
      ) {
        setGoalCardIsSwiped(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [goalCardIsSwiped]);

  const goalCardProgress = getGoalProgress(
    goal.currentAmount,
    goal.targetAmount,
  );

  const goalCardDaysLeft = getGoalDaysLeft(goal.targetDate);

  const goalCardDday = getGoalDday(goal.targetDate, goal.dday);

  const goalCardPace = getGoalPace(goal);

  const goalCardIsFinished =
    goal.status === "중단" || goal.status === "달성 완료";

  const goalCardIsUrgent =
    !goalCardIsFinished && goalCardDaysLeft !== null && goalCardDaysLeft <= 7;

  const handleGoalCardPointerDown = (event) => {
    goalCardPointerStartX.current = event.clientX;
  };

  const handleGoalCardPointerUp = (event) => {
    if (!window.matchMedia("(max-width: 600px)").matches) {
      return;
    }

    const movedDistance = event.clientX - goalCardPointerStartX.current;

    if (movedDistance <= -40) {
      setGoalCardIsExpanded(false);
      setGoalCardIsSwiped(true);
      return;
    }

    if (movedDistance >= 40) {
      setGoalCardIsSwiped(false);
      return;
    }

    if (goalCardIsSwiped) {
      setGoalCardIsSwiped(false);
      return;
    }

    setGoalCardIsExpanded((previousValue) => !previousValue);
  };

  const handleGoalCardDelete = () => {
    if (window.confirm(`"${goal.title}" 목표를 삭제할까요?`)) {
      onDelete?.(goal.id);
    }
  };

  return (
    <article
      ref={goalCardRef}
      className={`${styles.goalSettingGoalCard} ${
        goalCardIsExpanded ? styles.goalSettingGoalCardExpanded : ""
      } ${goalCardIsSwiped ? styles.goalSettingGoalCardSwiped : ""} ${
        focusRank === 1
          ? styles.goalSettingFirstFocusCard
          : focusRank === 2
            ? styles.goalSettingSecondFocusCard
            : ""
      }`}
      onPointerDown={handleGoalCardPointerDown}
      onPointerUp={handleGoalCardPointerUp}
    >
      <div
        className={`${styles.goalSettingGoalDday} ${
          goalCardIsFinished
            ? styles.goalSettingGoalDdayFinished
            : goalCardIsUrgent
              ? styles.goalSettingGoalDdayUrgent
              : styles.goalSettingGoalDdayNormal
        }`}
      >
        {goalCardDday}
      </div>

      <img
        className={styles.goalSettingGoalImage}
        src={goal.imageUrl || goal.image || DEFAULT_GOAL_IMAGE}
        alt=""
        onError={(event) => {
          if (event.currentTarget.src.endsWith(DEFAULT_GOAL_IMAGE)) {
            return;
          }

          event.currentTarget.src = DEFAULT_GOAL_IMAGE;
        }}
      />

      <div className={styles.goalSettingGoalContent}>
        <div className={styles.goalSettingGoalTitleRow}>
          <h2>{goal.title}</h2>

          <span
            className={`${styles.goalSettingGoalStatus} ${
              goalCardIsFinished ? styles.goalSettingGoalStatusFinished : ""
            }`}
          >
            {goal.status}
          </span>
        </div>

        <p className={styles.goalSettingGoalAmounts}>
          <span>{formatGoalAmount(goal.currentAmount)}</span>

          <span aria-hidden="true">/</span>

          <span>{formatGoalAmount(goal.targetAmount)}</span>
        </p>

        <div className={styles.goalSettingGoalProgressRow}>
          <div
            className={styles.goalSettingGoalProgress}
            role="progressbar"
            aria-label={`${goal.title} 진행률`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(goalCardProgress)}
          >
            <div
              className={styles.goalSettingGoalProgressFill}
              style={{
                width: `${goalCardProgress}%`,
              }}
            />
          </div>

          <span>{Number(goalCardProgress.toFixed(1))}%</span>
        </div>

        <div className={styles.goalSettingGoalDetails}>
          <p className={styles.goalSettingGoalPace}>
            <span>현재 속도 기준</span>
            <span aria-hidden="true">·</span>

            {goalCardPace.isDifficult && goalCardPace.lateDays > 0 && (
              <>
                <span>{goalCardPace.lateDays}일 늦을 예정</span>
                <span aria-hidden="true">·</span>
              </>
            )}

            <span>달성</span>

            <strong
              className={
                goalCardPace.isDifficult
                  ? styles.goalSettingGoalDifficult
                  : styles.goalSettingGoalPossible
              }
            >
              {goalCardPace.isDifficult ? "어려움" : "가능"}
            </strong>

            {goalCardPace.isDifficult && goalCardPace.requiredAmount > 0 && (
              <>
                <span aria-hidden="true">·</span>

                <span>
                  {formatGoalAmount(goalCardPace.requiredAmount)} 더 필요
                </span>
              </>
            )}
          </p>

          <p className={styles.goalSettingGoalMemo}>
            {goal.memo || "작성된 메모가 없어요."}
          </p>
        </div>
      </div>

      <div className={styles.goalSettingGoalTarget}>
        <span>목표일</span>
        <time dateTime={goal.targetDate}>
          {formatGoalDate(goal.targetDate)}
        </time>
      </div>

      <div className={styles.goalSettingGoalDesktopActions}>
        <button type="button" onClick={() => onEdit?.(goal)}>
          수정
        </button>

        <button type="button" onClick={handleGoalCardDelete}>
          삭제
        </button>
      </div>

      <div className={styles.goalSettingGoalMobileActions}>
        <button
          type="button"
          aria-label={`${goal.title} 수정`}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={() => onEdit?.(goal)}
        >
          <span className="material-icons" aria-hidden="true">
            edit
          </span>
        </button>

        <button
          type="button"
          aria-label={`${goal.title} 삭제`}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={handleGoalCardDelete}
        >
          <span className="material-icons" aria-hidden="true">
            delete
          </span>
        </button>
      </div>
    </article>
  );
}
