import { useState } from "react";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const initialTransactionForm = {
  type: "income",
  amount: "",
  category: "",
  date: getToday(),
  time: "",
  paymentMethod: "",
  content: "",
  memo: "",
  attachment: null,
  withdrawAccount: "",
  depositAccount: "",
  isRecurring: false,
  recurringDay: "29",
};

// 단건 거래 입력 폼 상태와 변경 처리
export const useTransactionForm = () => {
  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm,
  );
  const [transactionErrors, setTransactionErrors] = useState({});

  const handleResetTransactionForm = () => {
    setTransactionForm(prev => ({
      ...initialTransactionForm,
      type: prev.type,
    }));

    setTransactionErrors({});
  };

  const onTransactionFormChange = event => {
    const { name, value, files } = event.target;

    setTransactionErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));

    setTransactionForm(prevForm => {
      const nextForm = {
        ...prevForm,
        [name]: files ? (files[0] ?? null) : value,
      };

      if (name === "type" && value !== "transfer") {
        return {
          ...nextForm,
          withdrawAccount: "",
          depositAccount: "",
          isRecurring: false,
        };
      }

      if (name === "type" && value === "transfer") {
        return {
          ...nextForm,
          paymentMethod: "",
        };
      }

      return nextForm;
    });
  };

  const onToggleRecurring = () => {
    setTransactionForm(prevForm => ({
      ...prevForm,
      isRecurring: !prevForm.isRecurring,
    }));
  };

  return {
    transactionForm,
    setTransactionForm,
    transactionErrors,
    setTransactionErrors,
    handleResetTransactionForm,
    onTransactionFormChange,
    onToggleRecurring,
  };
};
