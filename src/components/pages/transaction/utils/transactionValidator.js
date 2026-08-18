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

    if (!form.depositAccount && !form.savingGoal) {
      errors.depositAccount = "입금 대상을 선택해주세요.";
    }
  }

  return errors;
};

// 영수증 이미지 파일 형식과 크기 검증
export const validateReceiptFile = file => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return "JPG, PNG, WEBP 이미지만 등록할 수 있어요.";
  }

  if (file.size > maxSize) {
    return "영수증 이미지는 5MB 이하만 등록할 수 있어요.";
  }

  return null;
};
