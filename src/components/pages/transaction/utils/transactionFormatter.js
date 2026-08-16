// Supabase timestamp 값을 화면 표시용 문자열로 변환
export const formatDateTime = value => {
  if (!value) return "-";

  const date = new Date(value);

  const formattedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");

  const formattedTime = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");

  return `${formattedDate} ${formattedTime}`;
};

// Supabase 거래 데이터를 소비기록 화면에서 사용하는 형태로 변환
export const formatTransaction = transaction => {
  const transactionDate = new Date(transaction.transaction_at);

  const date = [
    transactionDate.getFullYear(),
    String(transactionDate.getMonth() + 1).padStart(2, "0"),
    String(transactionDate.getDate()).padStart(2, "0"),
  ].join(".");

  const time = [
    String(transactionDate.getHours()).padStart(2, "0"),
    String(transactionDate.getMinutes()).padStart(2, "0"),
  ].join(":");

  const dateValue = [
    transactionDate.getFullYear(),
    String(transactionDate.getMonth() + 1).padStart(2, "0"),
    String(transactionDate.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    id: transaction.id,
    date,
    time,
    dateValue,

    type: transaction.transaction_type,

    typeLabel:
      transaction.transaction_type === "income"
        ? "수입"
        : transaction.transaction_type === "expense"
          ? "지출"
          : "이체",

    category: transaction.category?.name ?? "-",
    categoryType: transaction.category?.code ?? "",
    categoryId: transaction.category?.id ?? "",

    content: transaction.content ?? "-",

    amount:
      transaction.transaction_type === "income"
        ? transaction.amount
        : -transaction.amount,

    paymentMethod:
      transaction.transaction_type === "transfer"
        ? "계좌이체"
        : (transaction.payment_method?.name ?? "-"),

    paymentMethodId: transaction.payment_method?.id ?? "",

    memo: transaction.memo ?? "",

    withdrawAccount: transaction.withdraw_account?.name ?? null,
    withdrawAccountId: transaction.withdraw_account?.id ?? "",

    depositAccount: transaction.deposit_account?.name ?? null,
    depositAccountId: transaction.deposit_account?.id ?? "",

    isRecurring: transaction.is_recurring,
    recurringDay: transaction.recurring_day,

    createdAt: formatDateTime(transaction.created_at),
    updatedAt: formatDateTime(transaction.updated_at),
  };
};
