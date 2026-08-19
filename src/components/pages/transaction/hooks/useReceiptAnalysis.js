import { useState } from "react";
import { analyzeReceipt } from "../services/receiptService";
import { validateReceiptFile } from "../utils/transactionValidator";
import {
  initialAiTransactionForm,
  initialAiTypeValues,
} from "./useTransactionForm";

// AI 영수증 분석 상태와 처리
export const useReceiptAnalysis = ({
  supabase,
  categories,
  paymentMethods,
  showToast,
  setAiTransactionForm,
  setAiTypeValues,
  setAiTransactionErrors,
}) => {
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiErrorMessage, setAiErrorMessage] = useState("");
  const [aiPreview, setAiPreview] = useState("");

  const handleAiReceipt = file => {
    if (!file) return;

    const receiptFileError = validateReceiptFile(file);

    if (receiptFileError) {
      showToast(receiptFileError, "error");
      return;
    }

    setAiTransactionForm({
      ...initialAiTransactionForm,
      receipt: file,
    });

    setAiTypeValues(initialAiTypeValues);
    setAiTransactionErrors({});
    setAiErrorMessage("");
    setAiPreview("");
    setAiStatus("analyzing");

    const reader = new FileReader();

    reader.onload = async () => {
      const imageDataUrl = reader.result;

      setAiPreview(imageDataUrl);

      const { data, error } = await analyzeReceipt(supabase, {
        imageDataUrl,
        transactionTypes: [
          { value: "income", label: "수입" },
          { value: "expense", label: "지출" },
          { value: "transfer", label: "이체" },
        ],
        categories: categories.map(category => ({
          name: category.name,
          transactionType: category.transaction_type,
        })),
        paymentMethods: paymentMethods.map(method => method.name),
      });

      if (error) {
        setAiErrorMessage(
          "AI 분석 요청 중 문제가 발생했습니다. 이미지를 다시 업로드해주세요.",
        );
        setAiStatus("error");
        return;
      }

      if (!data?.success || !data?.data) {
        let message = "거래 정보를 인식하지 못했어요.";

        if (data?.reason === "not_transaction_evidence") {
          message = "영수증 또는 거래내역 이미지를 확인할 수 없어요.";
        }

        if (data?.reason === "unreadable") {
          message = "이미지의 거래 정보를 정확히 읽기 어려워요.";
        }

        if (data?.reason === "missing_critical_data") {
          message = "최종 거래 금액을 확인할 수 없어요.";
        }

        if (data?.reason === "unsupported_currency") {
          message = "현재는 원화(KRW) 거래 내역만 자동 인식할 수 있어요.";
        }

        setAiErrorMessage(message);
        setAiStatus("error");
        return;
      }

      const aiResult = data.data;

      const matchedCategory = categories.find(
        category =>
          category.name === aiResult.category &&
          category.transaction_type === aiResult.type,
      );

      const matchedPaymentMethod = paymentMethods.find(
        method => method.name === aiResult.paymentMethod,
      );

      if (aiResult.type === "transfer") {
        setAiTypeValues(prev => ({
          ...prev,
          transfer: {
            ...prev.transfer,
            category: matchedCategory?.id ?? "",
          },
        }));
      } else {
        setAiTypeValues(prev => ({
          ...prev,
          [aiResult.type]: {
            category: matchedCategory?.id ?? "",
            paymentMethod: matchedPaymentMethod?.id ?? "",
          },
        }));
      }

      setAiTransactionForm(prevForm => ({
        ...prevForm,
        type: aiResult.type ?? "",
        amount:
          aiResult.amount !== null && aiResult.amount !== undefined
            ? String(aiResult.amount)
            : "",
        category: matchedCategory?.id ?? "",
        date: aiResult.date ?? "",
        time: aiResult.time ?? "",
        paymentMethod:
          aiResult.type === "transfer" ? "" : (matchedPaymentMethod?.id ?? ""),
        content: aiResult.content ?? "",
        memo: aiResult.memo ?? "",
        receipt: prevForm.receipt,
      }));

      setAiTransactionErrors({});
      setAiStatus("success");
    };

    reader.readAsDataURL(file);
  };

  const onAiReceiptChange = event => {
    handleAiReceipt(event.target.files?.[0]);
  };

  const onAiDragOver = event => {
    event.preventDefault();
  };

  const onAiDrop = event => {
    event.preventDefault();
    handleAiReceipt(event.dataTransfer.files?.[0]);
  };

  return {
    aiStatus,
    aiErrorMessage,
    aiPreview,
    setAiStatus,
    setAiErrorMessage,
    setAiPreview,
    onAiReceiptChange,
    onAiDragOver,
    onAiDrop,
  };
};
