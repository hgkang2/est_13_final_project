import { validateTransactionForm } from "../utils/transactionValidator";
import { formatTransaction } from "../utils/transactionFormatter";
import {
  createTransaction,
  deleteTransaction,
} from "../services/transactionService";
import { saveReceiptAttachment } from "../services/receiptService";
import { initialTransactionForm } from "./useTransactionForm";

// 거래 저장/수정/삭제 처리
export const useTransactionActions = ({
  supabase,
  transactionForm,
  setTransactionForm,
  setTransactionErrors,
  setTransactions,
  setRecentlyAddedId,
  setToastMessage,
  showToast,
}) => {
  const onTransactionSubmit = async event => {
    event.preventDefault();

    // 입력값 검증
    const errors = validateTransactionForm(transactionForm);

    if (Object.keys(errors).length > 0) {
      setTransactionErrors(errors);
      return;
    }

    setTransactionErrors({});

    // 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    const attachment = transactionForm.attachment;

    if (attachment) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(attachment.type)) {
        setToastMessage("영수증은 JPG, PNG, WEBP 이미지만 등록할 수 있어요.");
        return;
      }

      if (attachment.size > maxSize) {
        setToastMessage("영수증 이미지는 5MB 이하만 등록할 수 있어요.");
        return;
      }
    }

    // transaction_at 생성
    const now = new Date();

    const [hour, minute] = transactionForm.time
      ? transactionForm.time.split(":").map(Number)
      : [now.getHours(), now.getMinutes()];

    const transactionDate = new Date(
      Number(transactionForm.date.slice(0, 4)),
      Number(transactionForm.date.slice(5, 7)) - 1,
      Number(transactionForm.date.slice(8, 10)),
      hour,
      minute,
      transactionForm.time ? 0 : now.getSeconds(),
    );

    // DB 저장값 구성
    const transactionData = {
      user_id: user.id,
      transaction_type: transactionForm.type,
      amount: Number(transactionForm.amount),
      category_id: transactionForm.category,

      payment_method_id:
        transactionForm.type === "transfer"
          ? null
          : transactionForm.paymentMethod,

      withdraw_account_id:
        transactionForm.type === "transfer"
          ? transactionForm.withdrawAccount
          : null,

      deposit_account_id:
        transactionForm.type === "transfer"
          ? transactionForm.depositAccount
          : null,

      content: transactionForm.content.trim() || null,
      memo: transactionForm.memo.trim() || null,

      transaction_at: transactionDate.toISOString(),

      input_method: "manual",

      is_recurring:
        transactionForm.type === "transfer"
          ? Boolean(transactionForm.isRecurring)
          : false,

      recurring_day:
        transactionForm.type === "transfer" && transactionForm.isRecurring
          ? Number(transactionForm.recurringDay)
          : null,
    };

    // 거래 저장
    const { data: insertedTransaction, error: insertError } =
      await createTransaction(supabase, transactionData);

    // 저장 실패
    if (insertError) {
      console.error("소비 기록 저장 실패:", insertError);
      setToastMessage("소비 기록을 저장하지 못했어요.");
      return;
    }

    if (!insertedTransaction) {
      console.error("저장 결과가 반환되지 않았습니다.");
      setToastMessage("소비 기록 저장 결과를 확인하지 못했어요.");
      return;
    }

    // 영수증 첨부파일 저장
    if (attachment) {
      const {
        storagePath,
        uploadError,
        attachmentInsertError,
        storageRemoveError,
      } = await saveReceiptAttachment(
        supabase,
        user.id,
        insertedTransaction.id,
        attachment,
      );

      if (uploadError) {
        console.error("영수증 Storage 업로드 실패:", uploadError);

        // 영수증까지 포함해서 하나의 저장 작업으로 취급
        const { error: rollbackTransactionError } = await deleteTransaction(
          supabase,
          insertedTransaction.id,
          user.id,
        );

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        setToastMessage("영수증 업로드에 실패해 거래 저장을 취소했어요.");
        return;
      }

      if (attachmentInsertError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentInsertError);

        if (storageRemoveError) {
          console.error("영수증 Storage 롤백 실패:", storageRemoveError);
        }

        const { error: rollbackTransactionError } = await deleteTransaction(
          supabase,
          insertedTransaction.id,
          user.id,
        );

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        setToastMessage("영수증 정보를 저장하지 못해 거래 저장을 취소했어요.");
        return;
      }

      console.log("영수증 저장 성공:", storagePath);
    }

    // 저장 성공
    console.log("소비 기록 저장 성공:", insertedTransaction);

    const newTransaction = formatTransaction(insertedTransaction);

    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

    setRecentlyAddedId(insertedTransaction.id);

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1800);

    showToast("소비 기록을 저장했어요.");
    setTransactionForm(initialTransactionForm);
  };

  return {
    onTransactionSubmit,
  };
};
