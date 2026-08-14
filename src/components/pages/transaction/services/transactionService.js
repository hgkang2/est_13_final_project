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
export const fetchTransactions = async (supabase, userId) => {
  return await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("user_id", userId)
    .order("transaction_at", { ascending: false });
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
export const createMultipleTransactions = async (
  supabase,
  transactionData,
) => {
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