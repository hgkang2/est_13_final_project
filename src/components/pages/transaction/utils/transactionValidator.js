// 거래 입력값 검증
export const validateTransactionForm = (
  form,
  { validateTransferAccounts = true } = {},
) => {
  const errors = {};

  if (!form.amount) {
    errors.amount = "금액을 입력해주세요.";
  } else if (
    !Number.isFinite(Number(form.amount)) ||
    Number(form.amount) <= 0
  ) {
    errors.amount = "금액은 0보다 큰 숫자로 입력해주세요.";
  }

  if (!form.category) {
    errors.category = "카테고리를 선택해주세요.";
  }

  if (!form.date) {
    errors.date = "날짜를 선택해주세요.";
  }

  if (!form.paymentMethod && form.type !== "transfer") {
    errors.paymentMethod = "결제수단을 선택해주세요.";
  }

  if (form.type === "transfer" && validateTransferAccounts) {
    if (!form.withdrawAccount) {
      errors.withdrawAccount = "출금 계좌를 선택해주세요.";
    }

    if (!form.depositAccount) {
      errors.depositAccount = "입금 계좌를 선택해주세요.";
    }
  }

  return errors;
};
