// 최근 거래 내역 조회
export async function getRecentTransactions(supabase, userId) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      transaction_type,
      amount,
      content,
      transaction_at,
      category:categories (
        code,
        name
      )
    `,
    )
    .eq("user_id", userId)
    .order("transaction_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("최근 소비 내역 조회 실패:", error);
    return [];
  }

  return data ?? [];
}

// 서브홈 집중목표 조회
export async function getSubHomeGoals(supabase, userId) {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const goalSelect =
    "id, title, status, current_amount, target_amount, start_date, end_date, completed_at, focus_order";

  const [
    { data: focusGoals, error: focusGoalError },
    { data: completedGoals, error: completedGoalError },
  ] = await Promise.all([
    supabase
      .from("saving_goals")
      .select(goalSelect)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .in("focus_order", [1, 2])
      .gte("end_date", today)
      .order("focus_order"),

    supabase
      .from("saving_goals")
      .select(goalSelect)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(2),
  ]);

  if (focusGoalError || completedGoalError) {
    console.error(
      "서브홈 집중목표 조회 실패:",
      focusGoalError ?? completedGoalError,
    );

    return {
      goal: null,
      savingGoal: null,
    };
  }

  const firstFocusGoal =
    focusGoals?.find(goal => goal.focus_order === 1) ?? null;

  const secondFocusGoal =
    focusGoals?.find(goal => goal.focus_order === 2) ?? null;

  const completedGoalQueue = [...(completedGoals ?? [])];

  const goal = firstFocusGoal ?? completedGoalQueue.shift() ?? null;

  const savingGoal = secondFocusGoal ?? completedGoalQueue.shift() ?? null;

  return {
    goal,
    savingGoal,
  };
}

// 서브홈 챌린지 현황 조회
export async function getSubHomeChallenge(supabase, userId) {
  const todayString = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const [year, month, day] = todayString.split("-").map(Number);

  const todayDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = todayDate.getUTCDay();

  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(todayDate);
  monday.setUTCDate(todayDate.getUTCDate() + distanceToMonday);

  const formatDate = date =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getUTCDate()).padStart(2, "0")}`;

  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);

    return formatDate(date);
  });

  const mondayString = weekDates[0];
  const sundayString = weekDates[6];

  const [
    { data: activeMission, error: missionError },
    { data: records, error: recordError },
  ] = await Promise.all([
    supabase
      .from("user_missions")
      .select(
        `
        id,
        title,
        status,
        start_date,
        end_date,
        completed_count,
        mission_template_id,
        mission_template:mission_templates (
          id,
          code,
          category_code,
          title
        )
      `,
      )
      .eq("user_id", userId)
      .eq("start_date", todayString)
      .in("status", ["in_progress", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("mission_records")
      .select("record_date")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .gte("record_date", mondayString)
      .lte("record_date", sundayString),
  ]);

  if (missionError) {
    console.error("서브홈 오늘 챌린지 조회 실패:", missionError);
  }

  if (recordError) {
    console.error("서브홈 주간 챌린지 조회 실패:", recordError);
  }

  const weekStates = weekDates.map(date =>
    (records ?? []).some(record => record.record_date === date),
  );

  const weeklyCompletedCount = weekStates.filter(Boolean).length;

  const isTodayCompleted =
    weekStates[todayIndex] || activeMission?.status === "completed";

  return {
    activeMission: activeMission ?? null,
    weekStates,
    todayIndex,
    weeklyCompletedCount,
    isTodayCompleted,
  };
}

// 진행 중인 두 번째 저축 목표 조회
export async function getSavingGoal(supabase, userId) {
  const { data, error } = await supabase
    .from("saving_goals")
    .select("id, title, current_amount, target_amount, start_date, end_date")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .eq("focus_order", 2)
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("서브홈 저축 목표 조회 실패:", error);
    return null;
  }

  return data ?? null;
}

// 이번 달 소비 합계 조회
export async function getMonthlySpending(supabase) {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  ).toISOString();

  const { data, error } = await supabase.rpc("get_monthly_expense_total", {
    p_start_at: monthStart,
    p_end_at: nextMonthStart,
  });

  if (error) {
    console.error("이번 달 소비 합계 조회 실패:", error);
    return 0;
  }

  return Number(data) || 0;
}

// 이번 달 일별 누적 소비 조회
export async function getMonthlySpendingDaily(supabase) {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  ).toISOString();

  const { data, error } = await supabase.rpc("get_monthly_expense_daily", {
    p_start_at: monthStart,
    p_end_at: nextMonthStart,
  });

  if (error) {
    console.error("이번 달 일별 소비 조회 실패:", error);
    return [];
  }

  return data ?? [];
}

// 지난달 동일 기간 일별 누적 소비 조회
export async function getPreviousMonthlySpendingDaily(supabase) {
  const now = new Date();

  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const previousMonthLastDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
  ).getDate();

  const previousEquivalentDay = Math.min(now.getDate(), previousMonthLastDay);

  const previousMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    previousEquivalentDay + 1,
  );

  const { data, error } = await supabase.rpc("get_monthly_expense_daily", {
    p_start_at: previousMonthStart.toISOString(),
    p_end_at: previousMonthEnd.toISOString(),
  });

  if (error) {
    console.error("지난달 일별 소비 조회 실패:", error);
    return [];
  }

  return data ?? [];
}

// 이번 달과 지난달 동일 기간 소비 비교 조회
export async function getSpendingComparison(supabase) {
  const now = new Date();

  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const previousMonthLastDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
  ).getDate();

  const previousEquivalentDay = Math.min(now.getDate(), previousMonthLastDay);

  const previousEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    previousEquivalentDay + 1,
  );

  const { data, error } = await supabase.rpc("get_monthly_expense_comparison", {
    p_current_start: currentStart.toISOString(),
    p_current_end: now.toISOString(),
    p_previous_start: previousStart.toISOString(),
    p_previous_end: previousEnd.toISOString(),
  });

  if (error) {
    console.error("지난달 소비 비교 조회 실패:", error);
    return null;
  }

  return data?.[0] ?? null;
}

// 이번 달 최신 AI 소비 분석 및 추천 미션 조회
export async function getAiAnalysis(supabase, userId) {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const periodStart = `${today.slice(0, 7)}-01`;

  const { data, error } = await supabase
    .from("analysis_reports")
    .select(
      `
      home_summary,
      summary,
      detail,
      insight,
      prediction,
      action_suggestion,
      feedback,
      mission_message,
      calculated_data,

      recommended_mission:mission_templates (
        id,
        code,
        title,
        description,
        category_code,
        target_type,
        target_value,
        unit
      )
    `,
    )
    .eq("user_id", userId)
    .eq("analysis_type", "monthly")
    .eq("period_start", periodStart)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("AI 소비 분석 조회 실패:", error);

    return {
      analysis: null,
      recommendedMission: null,
    };
  }

  if (!data) {
    return {
      analysis: null,
      recommendedMission: null,
    };
  }

  return {
    analysis: {
      homeSummary: data.home_summary ?? "",
      summary: data.summary ?? "",
      detail: data.detail ?? "",
      insight: data.insight ?? "",
      prediction: data.prediction ?? "",
      actionSuggestion: data.action_suggestion ?? "",
      feedback: data.feedback ?? "",
      calculatedData: data.calculated_data ?? null,
      mission: data.recommended_mission
        ? {
            templateCode: data.recommended_mission.code,
            message:
              data.mission_message ??
              data.recommended_mission.description ??
              data.recommended_mission.title,
          }
        : null,
    },

    recommendedMission: data.recommended_mission ?? null,
  };
}

// 사용자 프로필 조회
export async function getUserProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("프로필 조회 실패:", error);
    return null;
  }

  return data ?? null;
}

// 이번 주 소비 데이터를 기반으로 그림일기 UI 데이터 생성
export async function getWeeklyJournals(supabase, userId) {
  const now = new Date();

  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;

  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // 이번 주 실제 지출 조회
  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      content,
      transaction_at,
      category:categories (
        code,
        name
      )
    `,
    )
    .eq("user_id", userId)
    .eq("transaction_type", "expense")
    .gte("transaction_at", weekStart.toISOString())
    .lt("transaction_at", weekEnd.toISOString())
    .order("transaction_at", { ascending: true });

  if (transactionError) {
    console.error("주간 소비 조회 실패:", transactionError);
    return [];
  }

  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 월~일 7칸 생성
  const journals = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dateKey = date.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });

    // 해당 날짜의 실제 소비
    const dailyTransactions = (transactions ?? []).filter(transaction => {
      const transactionDate = new Date(
        transaction.transaction_at,
      ).toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      });

      return transactionDate === dateKey;
    });

    // 소비가 있는 날짜
    if (dailyTransactions.length > 0) {
      const totalAmount = dailyTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0,
      );

      // 그날 가장 큰 소비를 대표 소비로 사용
      const representative = [...dailyTransactions].sort(
        (a, b) => Number(b.amount) - Number(a.amount),
      )[0];

      const categoryCode = representative.category?.code;

      // 카테고리 코드가 없는 경우 기본 이미지 사용
      const imagePath = categoryCode
        ? `journal/${categoryCode}.png`
        : "journal/journal_empty.png";

      const { data: imageData } = supabase.storage
        .from("public-assets")
        .getPublicUrl(imagePath);

      return {
        id: dateKey,
        date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
        dateTime: dateKey,
        amount: `-${totalAmount.toLocaleString()}원`,
        image: imageData.publicUrl,
        content:
          representative.content ||
          representative.category?.name ||
          "오늘의 소비 기록",
        pending: false,
      };
    }

    // 소비가 없는 날짜
    const { data: emptyImageData } = supabase.storage
      .from("public-assets")
      .getPublicUrl("journal/journal_empty.png");

    return {
      id: dateKey,
      date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
      dateTime: dateKey,
      amount: "--원",
      image: emptyImageData.publicUrl,
      content: date > now ? "오늘도 실천이 기대돼요!" : "소비 기록이 없어요.",
      pending: true,
    };
  });

  return journals;
}
