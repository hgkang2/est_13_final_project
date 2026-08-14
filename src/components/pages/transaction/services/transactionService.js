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