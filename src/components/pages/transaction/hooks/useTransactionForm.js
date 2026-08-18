import { useState } from "react";
import { getToday } from "../utils/transactionDate";

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
  savingGoal: "",
  isRecurring: false,
  recurringDay: "29",
};

export const initialAiTransactionForm = {
  type: "",
  amount: "",
  category: "",
  date: "",
  time: "",
  paymentMethod: "",
  content: "",
  memo: "",
  receipt: null,
  withdrawAccount: "",
  depositAccount: "",
  savingGoal: "",
  isRecurring: false,
  recurringDay: "29",
};

export const initialAiTypeValues = {
  income: {
    category: "",
    paymentMethod: "",
  },
  expense: {
    category: "",
    paymentMethod: "",
  },
  transfer: {
    category: "",
    withdrawAccount: "",
    depositAccount: "",
    savingGoal: "",
    isRecurring: false,
    recurringDay: "29",
  },
};

// 단건 거래 입력 폼 상태와 변경 처리
export const useTransactionForm = () => {
  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm,
  );
  const [transactionErrors, setTransactionErrors] = useState({});
  const [aiTransactionForm, setAiTransactionForm] = useState(
    initialAiTransactionForm,
  );
  const [aiTransactionErrors, setAiTransactionErrors] = useState({});

  const [aiTypeValues, setAiTypeValues] = useState(initialAiTypeValues);
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
      ...(name === "transferDestination"
        ? {
            depositAccount: "",
            savingGoal: "",
          }
        : {}),
    }));
    setTransactionForm(prevForm => {
      const nextForm = {
        ...prevForm,
        [name]: files ? (files[0] ?? null) : value,
      };

      // 이체 입금 대상 선택
      if (name === "transferDestination") {
        if (!value) {
          return {
            ...nextForm,
            depositAccount: "",
            savingGoal: "",
          };
        }

        if (value.startsWith("goal:")) {
          return {
            ...nextForm,
            depositAccount: "",
            savingGoal: value.replace("goal:", ""),
            isRecurring: false,
          };
        }

        return {
          ...nextForm,
          depositAccount: value.replace("account:", ""),
          savingGoal: "",
        };
      }

      if (name === "type" && value !== "transfer") {
        return {
          ...nextForm,
          withdrawAccount: "",
          depositAccount: "",
          savingGoal: "",
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

  const onToggleAiRecurring = () => {
    if (aiTransactionForm.type !== "transfer" || aiTransactionForm.savingGoal) {
      return;
    }

    const nextIsRecurring = !aiTransactionForm.isRecurring;

    setAiTransactionForm(prevForm => ({
      ...prevForm,
      isRecurring: nextIsRecurring,
    }));

    setAiTypeValues(prevValues => ({
      ...prevValues,
      transfer: {
        ...prevValues.transfer,
        isRecurring: nextIsRecurring,
        recurringDay: aiTransactionForm.recurringDay,
      },
    }));
  };

  const onAiFormChange = event => {
    const { name, value } = event.target;

    setAiTransactionErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));

    // 거래구분 변경
    if (name === "type") {
      const currentType = aiTransactionForm.type;

      // 현재 타입의 값 저장
      if (currentType) {
        setAiTypeValues(prevValues => ({
          ...prevValues,
          [currentType]:
            currentType === "transfer"
              ? {
                  category: aiTransactionForm.category,
                  withdrawAccount: aiTransactionForm.withdrawAccount,
                  depositAccount: aiTransactionForm.depositAccount,
                  savingGoal: aiTransactionForm.savingGoal,
                  isRecurring: aiTransactionForm.isRecurring,
                  recurringDay: aiTransactionForm.recurringDay,
                }
              : {
                  category: aiTransactionForm.category,
                  paymentMethod: aiTransactionForm.paymentMethod,
                },
        }));
      }

      const savedValues = aiTypeValues[value];

      setAiTransactionForm(prevForm => {
        if (value === "transfer") {
          return {
            ...prevForm,
            type: value,
            category: savedValues?.category ?? "",
            paymentMethod: "",
            withdrawAccount: savedValues?.withdrawAccount ?? "",
            depositAccount: savedValues?.depositAccount ?? "",
            savingGoal: savedValues?.savingGoal ?? "",
            isRecurring: savedValues?.savingGoal
              ? false
              : Boolean(savedValues?.isRecurring),
            recurringDay: savedValues?.recurringDay ?? "29",
          };
        }

        return {
          ...prevForm,
          type: value,
          category: savedValues?.category ?? "",
          paymentMethod: savedValues?.paymentMethod ?? "",
          withdrawAccount: "",
          depositAccount: "",
          savingGoal: "",
          isRecurring: false,
        };
      });

      return;
    }

    // 이체 입금 대상 선택
    if (name === "transferDestination") {
      setAiTransactionErrors(prevErrors => ({
        ...prevErrors,
        depositAccount: "",
        savingGoal: "",
        transferDestination: "",
      }));

      if (!value) {
        setAiTransactionForm(prevForm => ({
          ...prevForm,
          depositAccount: "",
          savingGoal: "",
        }));

        setAiTypeValues(prevValues => ({
          ...prevValues,
          transfer: {
            ...prevValues.transfer,
            depositAccount: "",
            savingGoal: "",
          },
        }));

        return;
      }

      if (value.startsWith("goal:")) {
        const savingGoal = value.replace("goal:", "");
        setAiTransactionForm(prevForm => ({
          ...prevForm,
          depositAccount: "",
          savingGoal,
          isRecurring: false,
        }));

        setAiTypeValues(prevValues => ({
          ...prevValues,
          transfer: {
            ...prevValues.transfer,
            depositAccount: "",
            savingGoal,
            isRecurring: false,
          },
        }));

        return;
      }

      const depositAccount = value.replace("account:", "");

      setAiTransactionForm(prevForm => ({
        ...prevForm,
        depositAccount,
        savingGoal: "",
      }));

      setAiTypeValues(prevValues => ({
        ...prevValues,
        transfer: {
          ...prevValues.transfer,
          depositAccount,
          savingGoal: "",
        },
      }));

      return;
    }

    // 일반 필드 변경
    setAiTransactionForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));

    // 타입별 필드 변경값도 같이 기억
    if (
      name === "category" ||
      name === "paymentMethod" ||
      name === "withdrawAccount" ||
      name === "depositAccount" ||
      name === "recurringDay"
    ) {
      setAiTypeValues(prevValues => ({
        ...prevValues,
        [aiTransactionForm.type]: {
          ...prevValues[aiTransactionForm.type],
          [name]: value,
        },
      }));
    }
  };

  return {
    transactionForm,
    setTransactionForm,
    transactionErrors,
    setTransactionErrors,
    handleResetTransactionForm,
    onTransactionFormChange,
    onToggleRecurring,
    onToggleAiRecurring,
    aiTransactionForm,
    setAiTransactionForm,
    aiTransactionErrors,
    setAiTransactionErrors,
    setAiTypeValues,
    onAiFormChange,
  };
};
