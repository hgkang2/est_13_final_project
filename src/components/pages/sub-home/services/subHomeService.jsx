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

// 진행 중인 첫 번째 목표 조회
export async function getGoal(supabase, userId) {
  const { data, error } = await supabase
    .from("saving_goals")
    .select("id, title, current_amount, target_amount, start_date, end_date")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .order("end_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("서브홈 목표 조회 실패:", error);
    return null;
  }

  return data ?? null;
}

// 진행 중인 두 번째 저축 목표 조회
export async function getSavingGoal(supabase, userId) {
  const { data, error } = await supabase
    .from("saving_goals")
    .select("id, title, current_amount, target_amount, start_date, end_date")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .order("end_date", { ascending: true })
    .range(1, 1)
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

  const previousMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate() + 1,
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

  const previousEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate() + 1,
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

// 이번 달 AI 소비 분석 및 추천 미션 조회
export async function getAiAnalysis(supabase) {
  const now = new Date();

  const periodStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const periodEnd = now.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const { data, error } = await supabase.functions.invoke("analyze-spending", {
    body: {
      analysisType: "monthly",
      periodStart,
      periodEnd,
    },
  });

  if (error) {
    console.error("AI 소비 분석 조회 실패:", error);

    return {
      analysis: null,
      recommendedMission: null,
    };
  }

  if (!data?.success) {
    console.log("AI 소비 분석 미생성:", data);

    return {
      analysis: null,
      recommendedMission: null,
    };
  }

  return {
    analysis: data.analysis ?? null,
    recommendedMission: data.recommendedMission ?? null,
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

// 이번 주 소비 데이터를 기반으로 그림일기 생성 및 조회
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
    .select(`
      id,
      amount,
      content,
      transaction_at,
      category:categories (
        code,
        name
      )
    `)
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

  // 실제 소비가 있는 날짜만 journals 저장용 데이터 생성
  const journalRows = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dateKey = date.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });

    const dailyTransactions = (transactions ?? []).filter(transaction => {
      const transactionDate = new Date(
        transaction.transaction_at,
      ).toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      });

      return transactionDate === dateKey;
    });

    if (dailyTransactions.length === 0) continue;

    const totalAmount = dailyTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );

    // 그날 가장 큰 소비를 대표 소비로 사용
    const representative = [...dailyTransactions].sort(
      (a, b) => Number(b.amount) - Number(a.amount),
    )[0];

    const categoryCode = representative.category?.code;

    if (!categoryCode) continue;

    journalRows.push({
      user_id: userId,
      journal_date: dateKey,
      amount: totalAmount,
      image_path: `journal/${categoryCode}.png`,
      content:
        representative.content ||
        representative.category?.name ||
        "오늘의 소비 기록",
    });
  }

  // 소비가 있었던 날짜의 그림일기 저장/갱신
  if (journalRows.length > 0) {
    const { error: journalError } = await supabase
      .from("journals")
      .upsert(journalRows, {
        onConflict: "user_id,journal_date",
      });

    if (journalError) {
      console.error("그림일기 저장 실패:", journalError);
      return [];
    }
  }

  // 이번 주 저장된 그림일기 조회
  const { data: savedJournals, error: savedJournalError } = await supabase
    .from("journals")
    .select("id, journal_date, amount, image_path, content")
    .eq("user_id", userId)
    .gte(
      "journal_date",
      weekStart.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      }),
    )
    .lt(
      "journal_date",
      weekEnd.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      }),
    )
    .order("journal_date", { ascending: true });

  if (savedJournalError) {
    console.error("그림일기 조회 실패:", savedJournalError);
    return [];
  }

  // 월~일 7칸 생성
  const journals = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dateKey = date.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });

    const savedJournal = (savedJournals ?? []).find(
      journal => journal.journal_date === dateKey,
    );

    if (savedJournal) {
      const { data: imageData } = supabase.storage
        .from("public-assets")
        .getPublicUrl(savedJournal.image_path);

      return {
        id: savedJournal.id,
        date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
        amount: `-${Number(savedJournal.amount).toLocaleString()}원`,
        image: imageData.publicUrl,
        content: savedJournal.content,
        pending: false,
      };
    }

    const { data: emptyImageData } = supabase.storage
      .from("public-assets")
      .getPublicUrl("journal/journal_empty.png");

    return {
      id: dateKey,
      date: `${date.getMonth() + 1}/${date.getDate()} (${weekdayNames[date.getDay()]})`,
      amount: "--원",
      image: emptyImageData.publicUrl,
      content:
        date > now ? "오늘도 실천이 기대돼요!" : "소비 기록이 없어요.",
      pending: true,
    };
  });

  return journals;
}