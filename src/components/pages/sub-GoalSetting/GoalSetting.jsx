"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import { createClient } from "@/utils/supabase/client";
import GoalEmpty from "./sections/GoalEmpty";
import GoalList from "./sections/GoalList";
import GoalForm from "./sections/GoalForm";
import FocusGoalModal from "./sections/FocusGoalModal";
import styles from "./GoalSetting.module.scss";

const GOAL_SETTING_FILTERS = ["전체", "진행 중", "달성 완료", "중단"];

const GOAL_STATUS_TO_DB = {
  "진행 중": "in_progress",
  "달성 완료": "completed",
  중단: "stopped",
};

const GOAL_STATUS_TO_UI = {
  in_progress: "진행 중",
  completed: "달성 완료",
  stopped: "중단",
};

const supabase = createClient();
const GOAL_IMAGE_BUCKET = "user-images";
const GOAL_IMAGE_SIGNED_URL_TTL = 60 * 60;
const GOAL_IMAGE_MAX_SIZE = 2 * 1024 * 1024;
const GOAL_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

function mapGoalFromDatabase(goal) {
  const imagePath = normalizeGoalImagePath(goal.image_path);

  return {
    id: goal.id,
    title: goal.title,
    status: GOAL_STATUS_TO_UI[goal.status] ?? "진행 중",
    currentAmount: Number(goal.current_amount),
    targetAmount: Number(goal.target_amount),
    startDate: goal.start_date,
    targetDate: goal.end_date,
    memo: goal.memo ?? "",
    imagePath,
    imageUrl: goal.image_url ?? "",
    imageName: imagePath?.split("/").pop() ?? "",
    focusOrder: goal.focus_order,
    color: goal.status === "stopped" ? "gray" : "green",
  };
}

function normalizeGoalImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return null;
  }

  const normalizedPath = imagePath
    .trim()
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${GOAL_IMAGE_BUCKET}/`), "");

  if (
    !normalizedPath ||
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://") ||
    normalizedPath.startsWith("data:")
  ) {
    return null;
  }

  return normalizedPath;
}

async function addGoalImageUrls(goals, userId) {
  return Promise.all(
    goals.map(async (goal) => {
      const imagePath = normalizeGoalImagePath(goal.image_path);
      const userGoalFolder = `${userId}/goals/`;

      if (!imagePath || !imagePath.startsWith(userGoalFolder)) {
        if (goal.image_path) {
          console.error("목표 이미지 경로가 사용자 폴더와 일치하지 않습니다:", {
            imagePath: goal.image_path,
            expectedFolder: userGoalFolder,
          });
        }

        return goal;
      }

      const { data, error } = await supabase.storage
        .from(GOAL_IMAGE_BUCKET)
        .createSignedUrl(imagePath, GOAL_IMAGE_SIGNED_URL_TTL);

      if (error) {
        console.error("목표 이미지 URL 생성 실패:", error);
        return goal;
      }

      return { ...goal, image_path: imagePath, image_url: data.signedUrl };
    }),
  );
}

function getGoalImagePath(userId, file) {
  const extension = GOAL_IMAGE_TYPES[file.type];
  return `${userId}/goals/${crypto.randomUUID()}.${extension}`;
}

export default function GoalSetting() {
  const [goalSettingActiveFilter, setGoalSettingActiveFilter] =
    useState("전체");

  // 실제 초기 화면
  const [goalSettingGoals, setGoalSettingGoals] = useState([]);

  const [goalSettingIsLoading, setGoalSettingIsLoading] = useState(true);

  const [goalSettingView, setGoalSettingView] = useState("list");

  const [goalSettingFocusModalIsOpen, setGoalSettingFocusModalIsOpen] =
    useState(false);

  const [goalSettingEditingGoal, setGoalSettingEditingGoal] = useState(null);

  useEffect(() => {
    let goalSettingIsMounted = true;

    const fetchGoalSettingGoals = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("로그인 사용자 확인 실패:", userError);
      }

      if (!user || userError) {
        if (goalSettingIsMounted) {
          setGoalSettingGoals([]);
          setGoalSettingIsLoading(false);
        }

        return;
      }

      const { data, error } = await supabase
        .from("saving_goals")
        .select(
          "id, title, status, current_amount, target_amount, start_date, end_date, memo, image_path, focus_order",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("목표 목록 조회 실패:", error);
      }

      const goalsWithImageUrls = error
        ? []
        : await addGoalImageUrls(data ?? [], user.id);

      if (goalSettingIsMounted) {
        setGoalSettingGoals(goalsWithImageUrls.map(mapGoalFromDatabase));
        setGoalSettingIsLoading(false);
      }
    };

    fetchGoalSettingGoals();

    return () => {
      goalSettingIsMounted = false;
    };
  }, []);

  const goalSettingHasGoals = goalSettingGoals.length > 0;

  const goalSettingFocusGoals = goalSettingGoals
    .filter((goal) => goal.focusOrder)
    .sort((firstGoal, secondGoal) => firstGoal.focusOrder - secondGoal.focusOrder);

  const goalSettingInProgressGoals = goalSettingGoals.filter(
    (goal) => goal.status === "진행 중",
  );

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

  const handleGoalSettingFocusSave = async (selectedGoals) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.alert("로그인 정보를 확인할 수 없습니다.");
      return;
    }

    const { error: clearError } = await supabase
      .from("saving_goals")
      .update({ focus_order: null })
      .eq("user_id", user.id)
      .not("focus_order", "is", null);

    const results = clearError
      ? []
      : await Promise.all(
          selectedGoals.map((goal, index) =>
            supabase
              .from("saving_goals")
              .update({ focus_order: index + 1 })
              .eq("id", goal.id)
              .eq("user_id", user.id)
              .eq("status", "in_progress"),
          ),
        );

    const saveError =
      clearError ?? results.find((result) => result.error)?.error;
    const { data: focusOrders, error: readError } = await supabase
      .from("saving_goals")
      .select("id, focus_order")
      .eq("user_id", user.id);

    if (!readError) {
      const focusOrderById = new Map(
        focusOrders.map((goal) => [goal.id, goal.focus_order]),
      );

      setGoalSettingGoals((previousGoals) =>
        previousGoals.map((goal) => ({
          ...goal,
          focusOrder: focusOrderById.get(goal.id) ?? null,
        })),
      );
    }

    const error = saveError ?? readError;

    if (error) {
      console.error("집중 목표 저장 실패:", error);
      window.alert("집중 목표를 저장하지 못했습니다. 다시 시도해주세요.");
      return;
    }

    setGoalSettingFocusModalIsOpen(false);
  };

  const handleGoalSettingEdit = (goal) => {
    setGoalSettingEditingGoal(goal);
    setGoalSettingView("edit");
  };

  const handleGoalSettingDelete = async (goalId) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      window.alert("로그인 정보를 확인할 수 없습니다.");
      return;
    }

    const goalToDelete = goalSettingGoals.find((goal) => goal.id === goalId);

    const { error } = await supabase
      .from("saving_goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (error) {
      console.error("목표 삭제 실패:", error);
      window.alert("목표를 삭제하지 못했습니다. 다시 시도해주세요.");
      return;
    }

    setGoalSettingGoals((previousGoals) =>
      previousGoals.filter((goal) => goal.id !== goalId),
    );

    if (goalToDelete?.imagePath) {
      const { error: imageDeleteError } = await supabase.storage
        .from(GOAL_IMAGE_BUCKET)
        .remove([goalToDelete.imagePath]);

      if (imageDeleteError) {
        console.error("삭제된 목표의 이미지 정리 실패:", imageDeleteError);
      }
    }

    window.alert("목표가 삭제되었습니다.");
  };

  const handleGoalSettingSave = async (goalSettingSavedGoal) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error("로그인 사용자 확인 실패:", userError);
      window.alert("로그인 정보를 확인할 수 없습니다.");
      return false;
    }

    const imageFile = goalSettingSavedGoal.imageFile;
    let uploadedImagePath = null;

    if (imageFile) {
      if (!GOAL_IMAGE_TYPES[imageFile.type]) {
        window.alert("JPG 또는 PNG 이미지 파일만 업로드할 수 있습니다.");
        return false;
      }

      if (imageFile.size > GOAL_IMAGE_MAX_SIZE) {
        window.alert("이미지는 최대 2MB까지 업로드할 수 있습니다.");
        return false;
      }

      uploadedImagePath = getGoalImagePath(user.id, imageFile);

      const { error: imageUploadError } = await supabase.storage
        .from(GOAL_IMAGE_BUCKET)
        .upload(uploadedImagePath, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false,
        });

      if (imageUploadError) {
        console.error("목표 이미지 업로드 실패:", imageUploadError);
        window.alert("이미지를 업로드하지 못했습니다. 파일을 확인한 후 다시 시도해주세요.");
        return false;
      }
    }

    const goalSettingDatabaseValues = {
      user_id: user.id,
      title: goalSettingSavedGoal.title.trim(),
      target_amount: goalSettingSavedGoal.targetAmount,
      start_date: goalSettingSavedGoal.startDate,
      end_date: goalSettingSavedGoal.targetDate,
      status: GOAL_STATUS_TO_DB[goalSettingSavedGoal.status] ?? "in_progress",
      focus_order:
        goalSettingSavedGoal.status === "진행 중"
          ? (goalSettingEditingGoal?.focusOrder ?? null)
          : null,
      memo: goalSettingSavedGoal.memo.trim() || null,
      image_path: goalSettingSavedGoal.imageRemoved
        ? null
        : (uploadedImagePath ?? goalSettingSavedGoal.imagePath ?? null),
      updated_at: new Date().toISOString(),
    };

    let goalSettingSaveQuery;

    if (goalSettingSavedGoal.id) {
      goalSettingSaveQuery = supabase
        .from("saving_goals")
        .update(goalSettingDatabaseValues)
        .eq("id", goalSettingSavedGoal.id)
        .eq("user_id", user.id);
    } else {
      goalSettingSaveQuery = supabase.from("saving_goals").insert({
        ...goalSettingDatabaseValues,
        current_amount: 0,
      });
    }

    const { data, error } = await goalSettingSaveQuery
      .select(
        "id, title, status, current_amount, target_amount, start_date, end_date, memo, image_path, focus_order",
      )
      .single();

    if (error) {
      console.error("목표 저장 실패:", error);

      if (uploadedImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from(GOAL_IMAGE_BUCKET)
          .remove([uploadedImagePath]);

        if (cleanupError) {
          console.error("DB 저장 실패 후 이미지 정리 실패:", cleanupError);
        }
      }

      window.alert("목표를 저장하지 못했습니다. 다시 시도해주세요.");
      return false;
    }

    const [savedGoalWithImageUrl] = await addGoalImageUrls([data], user.id);
    const goalSettingSavedDatabaseGoal = mapGoalFromDatabase(
      savedGoalWithImageUrl,
    );

    if (
      (uploadedImagePath || goalSettingSavedGoal.imageRemoved) &&
      goalSettingSavedGoal.imagePath &&
      uploadedImagePath !== goalSettingSavedGoal.imagePath
    ) {
      const { error: oldImageDeleteError } = await supabase.storage
        .from(GOAL_IMAGE_BUCKET)
        .remove([goalSettingSavedGoal.imagePath]);

      if (oldImageDeleteError) {
        console.error("기존 목표 이미지 정리 실패:", oldImageDeleteError);
      }
    }

    setGoalSettingGoals((previousGoals) => {
      const goalAlreadyExists = previousGoals.some(
        (goal) => goal.id === goalSettingSavedDatabaseGoal.id,
      );

      if (goalAlreadyExists) {
        return previousGoals.map((goal) =>
          goal.id === goalSettingSavedDatabaseGoal.id
            ? goalSettingSavedDatabaseGoal
            : goal,
        );
      }

      return [goalSettingSavedDatabaseGoal, ...previousGoals];
    });

    const goalSettingWasJustStopped =
      goalSettingSavedGoal.status === "중단" &&
      goalSettingEditingGoal?.status !== "중단";

    setGoalSettingEditingGoal(null);
    setGoalSettingActiveFilter("전체");
    setGoalSettingView("list");

    if (goalSettingWasJustStopped) {
      window.alert("목표가 중단되었습니다.");
    }

    return true;
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
                <div className={styles.goalSettingFilterGroup}>
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
                </div>

                <button
                  type="button"
                  className={`${styles.goalSettingFilterButton} ${styles.goalSettingFocusButton} ${
                    goalSettingFocusModalIsOpen
                      ? styles.goalSettingFocusButtonActive
                      : ""
                  }`}
                  disabled={goalSettingInProgressGoals.length === 0}
                  aria-haspopup="dialog"
                  aria-expanded={goalSettingFocusModalIsOpen}
                  onClick={() => setGoalSettingFocusModalIsOpen(true)}
                >
                  <span className={styles.goalSettingFocusDesktopLabel}>
                    집중목표설정
                  </span>
                  <span className={styles.goalSettingFocusMobileLabel}>
                    집중목표
                  </span>
                </button>
              </nav>

              {!goalSettingIsLoading && !goalSettingHasGoals ? (
                <GoalEmpty onCreate={handleGoalSettingOpenForm} />
              ) : !goalSettingIsLoading ? (
                <GoalList
                  goals={goalSettingFilteredGoals}
                  focusGoals={goalSettingFocusGoals}
                  onEdit={handleGoalSettingEdit}
                  onDelete={handleGoalSettingDelete}
                />
              ) : null}
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

        {goalSettingFocusModalIsOpen && (
          <div
            className={styles.focusGoalModalBackdrop}
            onClick={() => setGoalSettingFocusModalIsOpen(false)}
          >
            <div
              className={styles.focusGoalModalDialog}
              role="dialog"
              aria-modal="true"
              aria-label="집중 목표 설정"
              onClick={(event) => event.stopPropagation()}
            >
              <FocusGoalModal
                goals={goalSettingInProgressGoals}
                initialSelectedGoals={goalSettingFocusGoals}
                onClose={() => setGoalSettingFocusModalIsOpen(false)}
                onComplete={handleGoalSettingFocusSave}
              />
            </div>
          </div>
        )}

        <SubFooter />
      </div>

      <div className={styles.goalSettingBottomTab}>
        <BottomTab />
      </div>
    </>
  );
}
