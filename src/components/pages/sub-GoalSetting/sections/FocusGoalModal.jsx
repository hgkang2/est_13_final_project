import { useState } from "react";
import styles from "../GoalSetting.module.scss";

const PAGE_SIZE = 4;

export default function FocusGoalModal({
  goals,
  initialSelectedGoals,
  onClose,
  onComplete,
}) {
  const [selectedGoals, setSelectedGoals] = useState(
    initialSelectedGoals ?? [],
  );
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(goals.length / PAGE_SIZE);
  const visibleGoals = goals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleGoal = (goal) => {
    setSelectedGoals((current) => {
      const isSelected = current.some((item) => item.id === goal.id);

      if (isSelected) {
        return current.filter((item) => item.id !== goal.id);
      }

      if (current.length === 2) {
        return current;
      }

      return [...current, goal];
    });
  };

  const swapRanks = () => {
    if (selectedGoals.length !== 2) return;
    setSelectedGoals(([first, second]) => [second, first]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <h2 className={styles.title}>집중 목표 설정</h2>
        <p className={styles.description}>
          집중할 목표를 <strong>최대 2개</strong> 선택해주세요.
        </p>
        <p className={styles.guide}>
          먼저 선택한 목표가 1순위로 지정되며, 선택 후 순서를 바꿀 수 있어요.
        </p>
      </header>

      <section className={styles.selectedSection}>
        <h3 className={styles.sectionTitle}>선택한 집중 목표</h3>

        <div className={styles.rankArea}>
          <RankCard rank={1} goal={selectedGoals[0]} />

          <button
            type="button"
            className={styles.swapButton}
            onClick={swapRanks}
          >
            순위 변경
          </button>

          <RankCard rank={2} goal={selectedGoals[1]} />
        </div>
      </section>

      <section className={styles.goalSection}>
        <div className={styles.goalHeading}>
          <h3 className={styles.sectionTitle}>목표 선택</h3>
          <span className={styles.selectedCount}>
            {selectedGoals.length}/2 선택
          </span>
        </div>

        <div className={styles.goalList}>
          {visibleGoals.map((goal) => {
            const selectedIndex = selectedGoals.findIndex(
              (item) => item.id === goal.id,
            );
            const isSelected = selectedIndex !== -1;

            return (
              <label className={styles.goalCard} key={goal.id}>
                <span className={styles.checkboxField}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleGoal(goal)}
                  />
                  <span
                    className={`${styles.checkboxIcon} material-icons`}
                    aria-hidden="true"
                  >
                    check_small
                  </span>
                </span>
                <span>{goal.title}</span>
              </label>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="목표 목록 페이지">
            <button
              type="button"
              className={styles.pageArrow}
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              aria-label="이전 페이지"
            >
              <span className="material-icons" aria-hidden="true">
                chevron_left
              </span>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`${styles.pageDot} ${
                    page === pageNumber ? styles.activePage : ""
                  }`}
                  onClick={() => setPage(pageNumber)}
                  aria-label={`${pageNumber}페이지`}
                  aria-current={page === pageNumber ? "page" : undefined}
                />
              ),
            )}

            <button
              type="button"
              className={styles.pageArrow}
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              aria-label="다음 페이지"
            >
              <span className="material-icons" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </nav>
        )}
      </section>

      <footer className={styles.buttonSection}>
        <button
          type="button"
          className={styles.completeButton}
          onClick={() => onComplete(selectedGoals)}
        >
          설정 완료
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          취소
        </button>
      </footer>
    </div>
  );
}

function RankCard({ rank, goal }) {
  return (
    <div
      className={`${styles.rankCard} ${
        rank === 1 ? styles.firstRank : styles.secondRank
      }`}
    >
      <span className={styles.rankBadge}>{rank}순위</span>
      <span className={`${styles.rankGoal} ${goal ? styles.selectedGoal : ""}`}>
        {goal?.title ?? "목표를 골라주세요."}
      </span>
    </div>
  );
}
