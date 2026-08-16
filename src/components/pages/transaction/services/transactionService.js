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
) => {
  const { startAt, endAt } = createTransactionDateRange(startDate, endDate);

  let query = supabase
    .from("transactions")
    .select(TRANSACTION_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .gte("transaction_at", startAt)
    .lt("transaction_at", endAt)
    .order("transaction_at", { ascending: false });

  if (transactionType !== "all") {
    query = query.eq("transaction_type", transactionType);
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

// 다건 거래 저장
export const createMultipleTransactions = async (supabase, transactionData) => {
  return await supabase
    .from("transactions")
    .insert(transactionData)
    .select(TRANSACTION_SELECT);
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

// 거래 삭제
export const deleteTransaction = async (supabase, transactionId, userId) => {
  return await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);
};

// 거래 입력에 필요한 옵션 조회
export const fetchTransactionOptions = async supabase => {
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
  ]);
};
