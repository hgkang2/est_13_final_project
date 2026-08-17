"use client";

import { useEffect, useMemo, useState } from "react";
import GoalCard from "./GoalCard";
import styles from "../GoalSetting.module.scss";

function getGoalTargetTime(targetDate) {
  if (!targetDate) {
    return Number.POSITIVE_INFINITY;
  }

  const normalizedDate = String(targetDate).replace(/\./g, "-");

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return parsedDate.getTime();
}

export default function GoalList({ goals, focusGoals = [], onEdit, onDelete }) {
  const [goalListIsMobile, setGoalListIsMobile] = useState(false);

  const [goalListVisibleCount, setGoalListVisibleCount] = useState(6);

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 390px)");

    const handleMediaChange = (event) => {
      const isMobile = event.matches;

      setGoalListIsMobile(isMobile);
      setGoalListVisibleCount(isMobile ? 4 : 6);
    };

    handleMediaChange(mobileMediaQuery);

    mobileMediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mobileMediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const goalListSortedGoals = useMemo(
    () =>
      [...goals].sort((firstGoal, secondGoal) => {
        const firstGoalIsFinished =
          firstGoal.status === "중단" || firstGoal.status === "달성 완료";

        const secondGoalIsFinished =
          secondGoal.status === "중단" || secondGoal.status === "달성 완료";

        if (firstGoalIsFinished !== secondGoalIsFinished) {
          return firstGoalIsFinished ? 1 : -1;
        }

        return (
          getGoalTargetTime(firstGoal.targetDate) -
          getGoalTargetTime(secondGoal.targetDate)
        );
      }),
    [goals],
  );

  const goalListPageSize = goalListIsMobile ? 4 : 6;

  const goalListVisibleGoals = goalListSortedGoals.slice(
    0,
    goalListVisibleCount,
  );

  const goalListHasMore = goalListVisibleCount < goalListSortedGoals.length;

  const handleGoalListMore = () => {
    setGoalListVisibleCount((previousCount) =>
      Math.min(previousCount + goalListPageSize, goalListSortedGoals.length),
    );
  };

  return (
    <section
      className={styles.goalSettingGoalListSection}
      aria-label="목표 목록"
    >
      <div className={styles.goalSettingGoalList}>
        {goalListVisibleGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            focusRank={
              focusGoals.findIndex((focusGoal) => focusGoal.id === goal.id) + 1
            }
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {goalListHasMore && (
        <button
          type="button"
          className={styles.goalSettingMoreButton}
          onClick={handleGoalListMore}
        >
          <span>더보기</span>

          <span className="material-icons" aria-hidden="true">
            keyboard_arrow_down
          </span>
        </button>
      )}
    </section>
  );
}
