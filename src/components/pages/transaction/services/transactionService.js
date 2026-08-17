import { createTransactionDateRange } from "../utils/transactionDate";

// 거래 조회 시 공통으로 사용하는 필드
export const TRANSACTION_SELECT = `
  id,
  transaction_type,
  amount,
  content,
  memo,
  transaction_at,
  created_at,
  updated_at,
  is_recurring,
  recurring_day,

  category:categories (
    id,
    code,
    name
  ),

  payment_method:payment_methods (
    id,
    code,
    name
  ),

  withdraw_account:transfer_accounts!transactions_withdraw_account_id_fkey (
    id,
    code,
    name
  ),

deposit_account:transfer_accounts!transactions_deposit_account_id_fkey (
  id,
  code,
  name
),

saving_goal:saving_goals!transactions_saving_goal_owner_fkey (
  id,
  title,
  focus_order,
  status
)
`;
// 사용자 거래 목록 조회
export const fetchTransactions = async (
  supabase,
  userId,
  startDate,
  endDate,
  transactionType,
  from,
  to,
  detailFilters = {},
) => {
  const { startAt, endAt } = createTransactionDateRange(startDate, endDate);

  const {
    category = "",
    paymentMethod = "",
    hasReceipt = false,
    keyword = "",
  } = detailFilters;

  const selectFields = hasReceipt
    ? `${TRANSACTION_SELECT},
    receipt_attachment:transaction_attachments!inner (
      id
    )
  `
    : TRANSACTION_SELECT;

  let query = supabase
    .from("transactions")
    .select(selectFields, { count: "exact" })
    .eq("user_id", userId)
    .gte("transaction_at", startAt)
    .lt("transaction_at", endAt)
    .order("transaction_at", { ascending: false });

  if (transactionType !== "all") {
    query = query.eq("transaction_type", transactionType);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  if (paymentMethod) {
    query = query.eq("payment_method_id", paymentMethod);
  }

  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword) {
    query = query.or(
      `content.ilike.%${trimmedKeyword}%,memo.ilike.%${trimmedKeyword}%`,
    );
  }

  return await query.range(from, to);
};

// 최근 입력 거래 조회
export const fetchRecentTransactions = async (supabase, userId) => {
  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);
};

// 이번 달 거래 요약 조회
export const fetchTransactionMonthlySummary = async supabase => {
  return await supabase.rpc("get_transaction_monthly_summary");
};

// 새 지출 7건 누적 시 이번 달 소비 분석 갱신
export const refreshSpendingAnalysisIfNeeded = async (supabase, userId) => {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const periodStart = `${today.slice(0, 7)}-01`;
  const periodEnd = today;

  // 이번 달 가장 최근 완료 분석 조회
  const { data: latestReport, error: reportError } = await supabase
    .from("analysis_reports")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("analysis_type", "monthly")
    .eq("period_start", periodStart)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reportError) {
    console.error("최근 소비 분석 조회 실패:", reportError);
    return;
  }

  const { startAt, endAt } = createTransactionDateRange(periodStart, periodEnd);

  let expenseCountQuery = supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("transaction_type", "expense")
    .gte("transaction_at", startAt)
    .lt("transaction_at", endAt);

  // 기존 분석이 있으면 그 분석 이후 새로 저장된 지출만 계산
  if (latestReport?.created_at) {
    expenseCountQuery = expenseCountQuery.gt(
      "created_at",
      latestReport.created_at,
    );
  }

  const { count, error: countError } = await expenseCountQuery;

  if (countError) {
    console.error("소비 분석 갱신 건수 확인 실패:", countError);
    return;
  }

  if ((count ?? 0) < 7) {
    return;
  }

  const { data, error } = await supabase.functions.invoke("analyze-spending", {
    body: {
      analysisType: "monthly",
      periodStart,
      periodEnd,
    },
  });

  if (error) {
    console.error("소비 분석 갱신 실패:", error);
    return;
  }

  if (!data?.success) {
    console.error("소비 분석 갱신 결과 확인 실패:", data);
    return;
  }

  console.log("소비 분석 갱신 완료:", data);
};

// 단건 거래 저장
export const createTransaction = async (supabase, transactionData) => {
  return await supabase
    .from("transactions")
    .insert(transactionData)
    .select(TRANSACTION_SELECT)
    .single();
};

// 집중목표 적립 거래 저장
export const createFocusGoalDeposit = async (
  supabase,
  {
    userId,
    requestId,
    goalId,
    amount,
    withdrawAccountId,
    transactionAt,
    content,
    memo,
  },
) => {
  const { data: depositResult, error: depositError } = await supabase.rpc(
    "deposit_to_focus_goal",
    {
      p_request_id: requestId,
      p_goal_id: goalId,
      p_amount: amount,
      p_withdraw_account_id: withdrawAccountId,
      p_transaction_at: transactionAt,
      p_content: content,
      p_memo: memo,
    },
  );

  if (depositError) {
    return {
      data: null,
      error: depositError,
    };
  }

  if (!depositResult?.transactionId) {
    return {
      data: null,
      error: new Error("집중목표 거래 ID를 확인할 수 없습니다."),
    };
  }

  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("id", depositResult.transactionId)
    .eq("user_id", userId)
    .single();
};

// 집중목표 연결 거래 수정
export const updateFocusGoalTransaction = async (
  supabase,
  {
    transactionId,
    transactionType,
    amount,
    categoryId,
    paymentMethodId,
    withdrawAccountId,
    depositAccountId,
    savingGoalId,
    transactionAt,
    content,
    memo,
    isRecurring,
    recurringDay,
  },
) => {
  const { data: updateResult, error: updateError } = await supabase.rpc(
    "update_focus_goal_transaction",
    {
      p_transaction_id: transactionId,
      p_transaction_type: transactionType,
      p_amount: amount,
      p_category_id: categoryId || null,
      p_payment_method_id: paymentMethodId || null,
      p_withdraw_account_id: withdrawAccountId || null,
      p_deposit_account_id: depositAccountId || null,
      p_saving_goal_id: savingGoalId || null,
      p_transaction_at: transactionAt,
      p_content: content || null,
      p_memo: memo || null,
      p_is_recurring: Boolean(isRecurring),
      p_recurring_day: recurringDay ? Number(recurringDay) : null,
    },
  );

  if (updateError) {
    return {
      data: null,
      error: updateError,
    };
  }

  if (!updateResult?.transactionId) {
    return {
      data: null,
      error: new Error("수정된 집중목표 거래 ID를 확인할 수 없습니다."),
    };
  }

  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("id", updateResult.transactionId)
    .single();
};

// 집중목표 연결 거래 삭제
export const deleteFocusGoalTransaction = async (supabase, transactionId) => {
  return await supabase.rpc("delete_focus_goal_transaction", {
    p_transaction_id: transactionId,
  });
};

// 다건 거래 저장
export const createMultipleTransactions = async (supabase, transactionData) => {
  return await supabase
    .from("transactions")
    .insert(transactionData)
    .select(TRANSACTION_SELECT);
};

// 거래 수정 실패 시 원복에 사용할 기존 DB 값 조회
export const fetchTransactionRollbackSnapshot = async (
  supabase,
  transactionId,
  userId,
) => {
  return await supabase
    .from("transactions")
    .select(
      `
      transaction_type,
      amount,
      category_id,
      payment_method_id,
      withdraw_account_id,
      deposit_account_id,
      saving_goal_id,
      content,
      memo,
      transaction_at,
      is_recurring,
      recurring_day,
      updated_at
    `,
    )
    .eq("id", transactionId)
    .eq("user_id", userId)
    .single();
};

// 거래 수정
export const updateTransaction = async (
  supabase,
  transactionId,
  userId,
  updateData,
) => {
  return await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select(TRANSACTION_SELECT)
    .single();
};

// 거래의 집중목표 연결 여부 조회
export const fetchTransactionGoalLink = async (
  supabase,
  transactionId,
  userId,
) => {
  return await supabase
    .from("transactions")
    .select("saving_goal_id")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .single();
};

// 거래 삭제
export const deleteTransaction = async (supabase, transactionId, userId) => {
  return await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);
};

// 거래 입력에 필요한 옵션 조회
export const fetchTransactionOptions = async (supabase, userId) => {
  return await Promise.all([
    supabase
      .from("categories")
      .select("id, code, name, transaction_type, sort_order")
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("payment_methods")
      .select("id, code, name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("transfer_accounts")
      .select("id, code, name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),

    supabase
      .from("saving_goals")
      .select("id, title, current_amount, target_amount, focus_order")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .in("focus_order", [1, 2])
      .order("focus_order"),
  ]);
};
