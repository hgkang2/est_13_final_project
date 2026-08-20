import { useState } from "react";

const createMultipleTransactionRow = id => ({
  id,
  date: "",
  time: "",
  type: "",
  category: "",
  content: "",
  amount: "",
  paymentMethod: "",
  withdrawAccount: "",
  depositAccount: "",
  savingGoal: "",
  memo: "",
});

// 다건 거래 입력 초기 행 생성
const createInitialMultipleRows = () => [
  createMultipleTransactionRow(1),
  createMultipleTransactionRow(2),
  createMultipleTransactionRow(3),
];

// 다건 거래 입력 행 상태와 변경 처리
export const useMultipleTransactionForm = () => {
  const [multipleRows, setMultipleRows] = useState(createInitialMultipleRows);

  const isValidMultipleRow = row =>
    row.date &&
    row.type &&
    row.category &&
    row.amount &&
    (row.type === "transfer"
      ? row.withdrawAccount && (row.depositAccount || row.savingGoal)
      : row.paymentMethod);

  const multipleRowStatus = multipleRows.reduce(
    (status, row) => {
      const hasRequiredFields = isValidMultipleRow(row);

      const hasAnyValue = Object.entries(row).some(
        ([key, value]) => key !== "id" && value,
      );

      if (hasRequiredFields) {
        status.available += 1;
      } else if (hasAnyValue) {
        status.error += 1;
      }

      return status;
    },
    {
      available: 0,
      error: 0,
    },
  );

  const onMultipleRowChange = (id, event) => {
    const { name, value } = event.target;

    setMultipleRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) {
          return row;
        }

        // 이체 경로 선택
        if (name === "transferRoute") {
          if (!value) {
            return {
              ...row,
              withdrawAccount: "",
              depositAccount: "",
              savingGoal: "",
            };
          }

          const [withdrawAccount, destination] = value.split("|");

          if (destination.startsWith("goal:")) {
            return {
              ...row,
              withdrawAccount,
              depositAccount: "",
              savingGoal: destination.replace("goal:", ""),
            };
          }

          return {
            ...row,
            withdrawAccount,
            depositAccount: destination.replace("account:", ""),
            savingGoal: "",
          };
        }

        // 거래구분 변경
        if (name === "type") {
          return {
            ...row,
            type: value,
            category: "",
            paymentMethod: "",
            withdrawAccount: "",
            depositAccount: "",
            savingGoal: "",
          };
        }

        return {
          ...row,
          [name]: value,
        };
      }),
    );
  };

  const onAddMultipleRow = () => {
    setMultipleRows(prevRows => {
      const nextId =
        prevRows.length === 0
          ? 1
          : Math.max(...prevRows.map(row => row.id)) + 1;

      return [...prevRows, createMultipleTransactionRow(nextId)];
    });
  };

  const onRemoveMultipleRow = id => {
    setMultipleRows(prevRows => prevRows.filter(row => row.id !== id));
  };

  const removeMultipleRows = ids => {
    const removeIds = new Set(ids);

    setMultipleRows(prevRows => prevRows.filter(row => !removeIds.has(row.id)));
  };

  const resetMultipleRows = () => {
    setMultipleRows(createInitialMultipleRows());
  };

  return {
    multipleRows,
    resetMultipleRows,
    removeMultipleRows,
    isValidMultipleRow,
    multipleRowStatus,
    onMultipleRowChange,
    onAddMultipleRow,
    onRemoveMultipleRow,
  };
};
