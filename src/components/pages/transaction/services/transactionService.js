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
) => {
  const { startAt, endAt } = createTransactionDateRange(startDate, endDate);

  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("user_id", userId)
    .gte("transaction_at", startAt)
    .lt("transaction_at", endAt)
    .order("transaction_at", { ascending: false });
};

// 최근 거래 목록 조회
export const fetchRecentTransactions = async (supabase, userId) => {
  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("user_id", userId)
    .order("transaction_at", { ascending: false })
    .limit(6);
};

// 이번 달 거래 요약 조회
export const fetchTransactionMonthlySummary = async supabase => {
  return await supabase.rpc("get_transaction_monthly_summary");
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
