"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import GoalEmpty from "./sections/GoalEmpty";
import GoalList from "./sections/GoalList";
import GoalForm from "./sections/GoalForm";
import styles from "./GoalSetting.module.scss";

const GOAL_SETTING_FILTERS = ["전체", "진행 중", "달성 완료", "중단"];

const GOAL_SETTING_MOCK_GOALS = [
  {
    id: 1,
    dday: "D-7",
    title: "여행 가즈아!",
    status: "진행 중",
    currentAmount: 900000,
    targetAmount: 2000000,
    progress: 45,
    startDate: "2026-07-01",
    targetDate: "2026-08-21",
    memo: "여행을 위해 열심히 모아보자!",
    imageUrl: "",
    color: "red",
  },
  {
    id: 2,
    dday: "D-35",
    title: "비상금 300만 원 모으기",
    status: "진행 중",
    currentAmount: 1950000,
    targetAmount: 3000000,
    progress: 65,
    startDate: "2026-05-01",
    targetDate: "2026-08-20",
    memo: "예상치 못한 상황을 대비한 비상금",
    imageUrl: "",
    color: "yellow",
  },
  {
    id: 3,
    dday: "D-39",
    title: "병원비",
    status: "중단",
    currentAmount: 100000,
    targetAmount: 500000,
    progress: 20,
    startDate: "2026-06-01",
    targetDate: "2026-08-24",
    memo: "필요한 병원비 마련하기",
    imageUrl: "",
    color: "gray",
  },
];

export default function GoalSetting() {
  const [goalSettingActiveFilter, setGoalSettingActiveFilter] =
    useState("전체");

  // 실제 초기 화면
  const [goalSettingGoals, setGoalSettingGoals] = useState([]);

  // 카드 디자인 확인용으로 사용할 때 위 코드를 주석 처리
  // const [goalSettingGoals, setGoalSettingGoals] = useState(
  //   GOAL_SETTING_MOCK_GOALS,
  // );

  const [goalSettingView, setGoalSettingView] = useState("list");

  const [goalSettingEditingGoal, setGoalSettingEditingGoal] = useState(null);

  const goalSettingHasGoals = goalSettingGoals.length > 0;

  const goalSettingFilteredGoals = goalSettingGoals.filter(
    (goalSettingGoal) =>
      goalSettingActiveFilter === "전체" ||
      goalSettingGoal.status === goalSettingActiveFilter,
  );

  const handleGoalSettingOpenForm = () => {
    setGoalSettingEditingGoal(null);
    setGoalSettingView("create");
  };

  const handleGoalSettingCloseForm = () => {
    setGoalSettingEditingGoal(null);
    setGoalSettingView("list");
  };

  const handleGoalSettingEdit = (goal) => {
    setGoalSettingEditingGoal(goal);
    setGoalSettingView("edit");
  };

  const handleGoalSettingDelete = (goalId) => {
    setGoalSettingGoals((previousGoals) =>
      previousGoals.filter((goal) => goal.id !== goalId),
    );
  };

  const handleGoalSettingSave = (goalSettingSavedGoal) => {
    setGoalSettingGoals((previousGoals) => {
      const goalAlreadyExists = previousGoals.some(
        (goal) => goal.id === goalSettingSavedGoal.id,
      );

      if (goalAlreadyExists) {
        return previousGoals.map((goal) =>
          goal.id === goalSettingSavedGoal.id ? goalSettingSavedGoal : goal,
        );
      }

      return [...previousGoals, goalSettingSavedGoal];
    });

    setGoalSettingEditingGoal(null);
    setGoalSettingActiveFilter("전체");
    setGoalSettingView("list");
  };

  const goalSettingFormIsOpen =
    goalSettingView === "create" || goalSettingView === "edit";

  return (
    <>
      <div className={styles.goalSettingPage}>
        <div
          className={`${styles.goalSettingPageLayout} ${
            goalSettingFormIsOpen ? styles.goalSettingFormIsOpen : ""
          }`}
        >
          <Sidebar />

          <main className={`container ${styles.goalSettingContainer}`}>
            <section className={styles.goalSettingSection}>
              <header className={styles.goalSettingPageHeader}>
                <div className={styles.goalSettingTitleGroup}>
                  <h1>나의 목표</h1>

                  <p>이루고 싶은 목표를 만들고 진행 상황을 관리해보세요.</p>
                </div>

                {goalSettingHasGoals && (
                  <button
                    type="button"
                    className={styles.goalSettingCreateButton}
                    onClick={handleGoalSettingOpenForm}
                  >
                    <span
                      className={`material-icons ${styles.goalSettingCreateIcon}`}
                      aria-hidden="true"
                    >
                      add
                    </span>

                    <span>새 목표</span>
                  </button>
                )}
              </header>

              <nav
                className={styles.goalSettingFilters}
                aria-label="목표 상태 필터"
              >
                {GOAL_SETTING_FILTERS.map((goalSettingFilter) => {
                  const goalSettingIsActive =
                    goalSettingActiveFilter === goalSettingFilter;

                  return (
                    <button
                      type="button"
                      key={goalSettingFilter}
                      className={`${styles.goalSettingFilterButton} ${
                        goalSettingIsActive
                          ? styles.goalSettingActiveFilter
                          : ""
                      }`}
                      disabled={!goalSettingHasGoals}
                      aria-pressed={goalSettingIsActive}
                      onClick={() =>
                        setGoalSettingActiveFilter(goalSettingFilter)
                      }
                    >
                      {goalSettingFilter}
                    </button>
                  );
                })}
              </nav>

              {!goalSettingHasGoals ? (
                <GoalEmpty onCreate={handleGoalSettingOpenForm} />
              ) : (
                <GoalList
                  goals={goalSettingFilteredGoals}
                  onEdit={handleGoalSettingEdit}
                  onDelete={handleGoalSettingDelete}
                />
              )}
            </section>
          </main>

          {goalSettingFormIsOpen && (
            <GoalForm
              key={goalSettingEditingGoal?.id ?? "create"}
              initialGoal={goalSettingEditingGoal}
              onClose={handleGoalSettingCloseForm}
              onSave={handleGoalSettingSave}
            />
          )}
        </div>

        <SubFooter />
      </div>

      <BottomTab />
    </>
  );
}
