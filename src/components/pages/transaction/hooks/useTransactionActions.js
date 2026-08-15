import { validateTransactionForm } from "../utils/transactionValidator";
import { formatTransaction } from "../utils/transactionFormatter";
import { createTransactionDate } from "../utils/transactionDate";
import {
  createMultipleTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/transactionService";
import {
  createReceiptAttachment,
  createReceiptSignedUrl,
  deleteReceiptAttachment,
  fetchReceiptAttachment,
  removeReceiptFile,
  saveReceiptAttachment,
  updateReceiptAttachment,
  uploadReceiptFile,
} from "../services/receiptService";
import {
  initialAiTransactionForm,
  initialTransactionForm,
} from "./useTransactionForm";
import { createMultipleTransactionRow } from "./useMultipleTransactionForm";

// 거래 입력 폼을 DB 공통 저장값으로 변환
const createTransactionBaseData = (form, userId, transactionDate) => {
  return {
    user_id: userId,
    transaction_type: form.type,
    amount: Number(form.amount),
    category_id: form.category,

    payment_method_id: form.type === "transfer" ? null : form.paymentMethod,

    withdraw_account_id: form.type === "transfer" ? form.withdrawAccount : null,

    deposit_account_id: form.type === "transfer" ? form.depositAccount : null,

    content: form.content.trim() || null,
    memo: form.memo.trim() || null,

    transaction_at: transactionDate.toISOString(),
  };
};

// 거래 저장/수정/삭제 처리
export const useTransactionActions = ({
  supabase,
  transactionForm,
  setTransactionForm,
  setTransactionErrors,
  multipleRows,
  isValidMultipleRow,
  setMultipleRows,
  setIsMultipleConfirmOpen,
  aiStatus,
  aiTransactionForm,
  setAiTransactionForm,
  setAiTransactionErrors,
  setAiTypeValues,
  setAiPreview,
  setAiErrorMessage,
  setAiStatus,
  selectedTransaction,
  setSelectedTransaction,
  setPanelView,
  setSelectedIds,
  setIsDeleteConfirmOpen,
  setIsDeleteSuccessOpen,
  setTransactions,
  setRecentlyAddedId,
  setToastMessage,
  showToast,
}) => {
  // 저장 또는 수정한 거래를 잠시 강조
  const highlightTransaction = transactionId => {
    setRecentlyAddedId(transactionId);

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1800);
  };

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
    const transactionDate = createTransactionDate(
      transactionForm.date,
      transactionForm.time,
    );

    // DB 저장값 구성
    const transactionData = {
      ...createTransactionBaseData(transactionForm, user.id, transactionDate),

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

    highlightTransaction(insertedTransaction.id);

    showToast("소비 기록을 저장했어요.");
    setTransactionForm(initialTransactionForm);
  };

  const handleUpdateTransaction = async updatedForm => {
    if (!selectedTransaction) {
      setToastMessage("수정할 거래 정보를 확인할 수 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    const { data: existingAttachment, error: existingAttachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (existingAttachmentError) {
      console.error("기존 영수증 정보 조회 실패:", existingAttachmentError);
      setToastMessage("기존 영수증 정보를 확인하지 못했어요.");
      return;
    }

    const newAttachment = updatedForm.attachment;

    let nextReceiptImage = selectedTransaction.receiptImage ?? null;

    // 2. 수정 날짜/시간 생성
    const [year, month, day] = updatedForm.date.split("-").map(Number);

    const [hour, minute] = (updatedForm.time || "00:00").split(":").map(Number);

    const transactionDate = new Date(year, month - 1, day, hour, minute, 0);

    if (Number.isNaN(transactionDate.getTime())) {
      setToastMessage("거래 날짜를 확인해주세요.");
      return;
    }

    // 3. DB 수정값 구성
    const updateData = {
      transaction_type: updatedForm.type,
      amount: Number(updatedForm.amount),
      category_id: updatedForm.category,

      payment_method_id:
        updatedForm.type === "transfer" ? null : updatedForm.paymentMethod,

      withdraw_account_id:
        updatedForm.type === "transfer" ? updatedForm.withdrawAccount : null,

      deposit_account_id:
        updatedForm.type === "transfer" ? updatedForm.depositAccount : null,

      content: updatedForm.content.trim() || null,
      memo: updatedForm.memo.trim() || null,

      transaction_at: transactionDate.toISOString(),

      // 이체가 아니게 변경되면 반복이체 정보 제거
      is_recurring:
        updatedForm.type === "transfer"
          ? Boolean(updatedForm.isRecurring)
          : false,

      recurring_day:
        updatedForm.type === "transfer" && updatedForm.isRecurring
          ? Number(updatedForm.recurringDay)
          : null,
      updated_at: new Date().toISOString(),
    };

    // 4. 거래 수정
    const { data: updatedTransaction, error: updateError } =
      await updateTransaction(
        supabase,
        selectedTransaction.id,
        user.id,
        updateData,
      );

    // 5. 수정 실패
    if (updateError) {
      console.error("소비 기록 수정 실패:", updateError);
      setToastMessage("소비 기록을 수정하지 못했어요.");
      return;
    }

    if (!updatedTransaction) {
      console.error("수정 결과가 반환되지 않았습니다.");
      setToastMessage("수정된 소비 기록을 확인하지 못했어요.");
      return;
    }

    // 영수증 첨부 수정 처리
    // 새 영수증 선택 → 신규 첨부 또는 기존 첨부 교체
    if (newAttachment) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(newAttachment.type)) {
        setToastMessage("영수증은 JPG, PNG, WEBP 이미지만 등록할 수 있어요.");
        return;
      }

      if (newAttachment.size > maxSize) {
        setToastMessage("영수증 이미지는 5MB 이하만 등록할 수 있어요.");
        return;
      }

      const extension =
        newAttachment.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = `receipt-${Date.now()}.${extension}`;

      const newStoragePath = `${user.id}/${selectedTransaction.id}/${safeFileName}`;

      // 새 파일부터 업로드
      const { error: uploadError } = await uploadReceiptFile(
        supabase,
        newStoragePath,
        newAttachment,
      );

      if (uploadError) {
        console.error("새 영수증 업로드 실패:", uploadError);
        setToastMessage("새 영수증을 업로드하지 못했어요.");
        return;
      }

      let attachmentSaveError = null;

      // 기존 첨부가 있으면 metadata UPDATE
      if (existingAttachment) {
        const { error } = await updateReceiptAttachment(
          supabase,
          existingAttachment.id,
          newStoragePath,
          newAttachment,
        );

        attachmentSaveError = error;
      } else {
        // 기존 첨부가 없으면 INSERT
        const { error } = await createReceiptAttachment(
          supabase,
          selectedTransaction.id,
          newStoragePath,
          newAttachment,
        );

        attachmentSaveError = error;
      }

      // attachment DB 저장 실패 → 방금 올린 Storage 파일 롤백
      if (attachmentSaveError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentSaveError);

        const { error: rollbackStorageError } = await removeReceiptFile(
          supabase,
          newStoragePath,
        );

        if (rollbackStorageError) {
          console.error("새 영수증 Storage 롤백 실패:", rollbackStorageError);
        }

        setToastMessage("영수증 정보를 수정하지 못했어요.");
        return;
      }

      if (
        existingAttachment?.storage_path &&
        existingAttachment.storage_path !== newStoragePath
      ) {
        const { error: oldStorageRemoveError } = await removeReceiptFile(
          supabase,
          existingAttachment.storage_path,
        );

        if (oldStorageRemoveError) {
          console.error(
            "기존 영수증 Storage 정리 실패:",
            oldStorageRemoveError,
          );
        }
      }

      // 새 영수증 상세화면용 signed URL 생성
      const { data: signedUrlData, error: signedUrlError } =
        await createReceiptSignedUrl(supabase, newStoragePath);

      if (signedUrlError) {
        console.error("새 영수증 URL 생성 실패:", signedUrlError);
        nextReceiptImage = null;
      } else {
        nextReceiptImage = signedUrlData.signedUrl;
      }
    }

    // 새 파일은 X "첨부 삭제"를 선택 경우
    else if (updatedForm.removeAttachment) {
      if (existingAttachment) {
        // DB 연결 제거
        const { error: attachmentDeleteError } = await deleteReceiptAttachment(
          supabase,
          existingAttachment.id,
        );

        if (attachmentDeleteError) {
          console.error("영수증 첨부정보 삭제 실패:", attachmentDeleteError);
          setToastMessage("영수증 정보를 삭제하지 못했어요.");
          return;
        }

        // Storage 실제 파일 제거
        if (existingAttachment.storage_path) {
          const { error: storageRemoveError } = await removeReceiptFile(
            supabase,
            existingAttachment.storage_path,
          );

          if (storageRemoveError) {
            // DB 연결은 이미 제거
            // Storage에 파일만 남는 cleanup 문제 -> 사용자 수정은 유지.
            console.error("영수증 Storage 삭제 실패:", storageRemoveError);
          }
        }
      }

      nextReceiptImage = null;
    }

    // 6. DB 데이터 → UI 형식
    const formattedTransaction = formatTransaction(updatedTransaction);

    // 7. 목록 즉시 반영
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === formattedTransaction.id
          ? formattedTransaction
          : transaction,
      ),
    );

    highlightTransaction(formattedTransaction.id);

    // 8. 상세도 즉시 수정
    setSelectedTransaction({
      ...formattedTransaction,
      receiptImage: nextReceiptImage,
    });

    // 9. 상세화면으로 복귀
    setPanelView("detail");
    setToastMessage("소비 기록을 수정했어요.");

    console.log("소비 기록 수정 성공:", updatedTransaction);
  };

  const handleOpenDetail = async transaction => {
    const { data: attachmentData, error: attachmentError } =
      await fetchReceiptAttachment(supabase, transaction.id);

    if (attachmentError) {
      console.error("영수증 첨부정보 조회 실패:", attachmentError);
    }

    let receiptImage = null;

    if (attachmentData?.storage_path) {
      const { data: signedUrlData, error: signedUrlError } =
        await createReceiptSignedUrl(supabase, attachmentData.storage_path);

      if (signedUrlError) {
        console.error("영수증 이미지 URL 생성 실패:", signedUrlError);
      } else {
        receiptImage = signedUrlData.signedUrl;
      }
    }

    setSelectedTransaction({
      ...transaction,
      receiptImage,
    });

    setPanelView("detail");
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) {
      setToastMessage("삭제할 거래 정보를 확인할 수 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    // 2. 첨부파일 정보 조회
    const { data: attachmentData, error: attachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (attachmentError) {
      console.error("첨부파일 정보 조회 실패:", attachmentError);
      setToastMessage("첨부파일 정보를 확인하지 못했어요.");
      return;
    }

    // 3. Storage 파일이 있으면 먼저 삭제
    if (attachmentData?.storage_path) {
      const { error: storageDeleteError } = await removeReceiptFile(
        supabase,
        attachmentData.storage_path,
      );

      if (storageDeleteError) {
        console.error("영수증 Storage 삭제 실패:", storageDeleteError);
        setToastMessage("영수증 파일을 삭제하지 못했어요.");
        return;
      }
    }

    // 4. 거래 삭제
    const { error: deleteError } = await deleteTransaction(
      supabase,
      selectedTransaction.id,
      user.id,
    );

    if (deleteError) {
      console.error("소비 기록 삭제 실패:", deleteError);
      setToastMessage("소비 기록을 삭제하지 못했어요.");
      return;
    }

    // 5. 화면에서 즉시 제거
    setTransactions(prevTransactions =>
      prevTransactions.filter(
        transaction => transaction.id !== selectedTransaction.id,
      ),
    );

    // 체크된 상태였다면 같이 제거
    setSelectedIds(prevSelectedIds =>
      prevSelectedIds.filter(id => id !== selectedTransaction.id),
    );

    setSelectedTransaction(null);
    setPanelView("closed");

    setIsDeleteConfirmOpen(false);
    setIsDeleteSuccessOpen(true);
  };

  // 다건 저장 함수
  const handleConfirmMultipleSubmit = async () => {
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      setIsMultipleConfirmOpen(false);
      setToastMessage("저장할 수 있는 거래가 없어요.");
      return;
    }

    // 1. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      setIsMultipleConfirmOpen(false);
      setToastMessage("로그인 정보를 확인할 수 없어요.");
      return;
    }

    // 2. UI row → DB 저장 데이터 변환
    const transactionData = validRows.map(row => {
      const transactionDate = createTransactionDate(row.date, row.time);
      return {
        ...createTransactionBaseData(row, user.id, transactionDate),

        input_method: "manual",
        is_recurring: false,
        recurring_day: null,
      };
    });

    // 3. 다건 INSERT
    const { data: insertedTransactions, error: insertError } =
      await createMultipleTransactions(supabase, transactionData);

    if (insertError) {
      console.error("다건 소비 기록 저장 실패:", insertError);
      setIsMultipleConfirmOpen(false);
      setToastMessage("소비 기록을 저장하지 못했어요.");
      return;
    }

    // 4. DB 데이터 → 기존 UI 형식
    const newTransactions = (insertedTransactions ?? []).map(formatTransaction);

    // 5. 화면 즉시 반영
    setTransactions(prevTransactions => [
      ...newTransactions,
      ...prevTransactions,
    ]);

    // 6. 입력창 초기화
    setMultipleRows([
      createMultipleTransactionRow(1),
      createMultipleTransactionRow(2),
      createMultipleTransactionRow(3),
    ]);

    setIsMultipleConfirmOpen(false);
    setToastMessage(`${newTransactions.length}건의 소비 기록을 저장했어요.`);
  };

  const onAiTransactionSubmit = async event => {
    event.preventDefault();

    if (aiStatus !== "success") return;

    // 1. 입력값 검증
    const errors = validateTransactionForm(aiTransactionForm);

    if (Object.keys(errors).length > 0) {
      setAiTransactionErrors(errors);
      return;
    }

    setAiTransactionErrors({});

    // 2. 로그인 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      showToast("로그인 정보를 확인할 수 없어요.", "error");
      return;
    }

    const attachment = aiTransactionForm.receipt;

    // 3. transaction_at 생성
    const transactionDate = createTransactionDate(
      aiTransactionForm.date,
      aiTransactionForm.time,
    );

    // 4. DB 저장값 구성
    const transactionData = {
      ...createTransactionBaseData(aiTransactionForm, user.id, transactionDate),

      input_method: "ai",
      is_recurring: false,
      recurring_day: null,
    };

    // 5. 거래 저장
    const { data: insertedTransaction, error: insertError } =
      await createTransaction(supabase, transactionData);

    if (insertError) {
      console.error("AI 소비 기록 저장 실패:", insertError);
      showToast("소비 기록을 저장하지 못했어요.", "error");
      return;
    }

    if (!insertedTransaction) {
      console.error("AI 소비 기록 저장 결과가 반환되지 않았습니다.");
      showToast("소비 기록 저장 결과를 확인하지 못했어요.", "error");
      return;
    }

    // 6. AI 분석에 사용한 영수증 이미지 저장
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
        console.error("AI 영수증 Storage 업로드 실패:", uploadError);

        const { error: rollbackTransactionError } = await deleteTransaction(
          supabase,
          insertedTransaction.id,
          user.id,
        );

        if (rollbackTransactionError) {
          console.error("AI 거래 저장 롤백 실패:", rollbackTransactionError);
        }

        showToast("영수증 업로드에 실패해 거래 저장을 취소했어요.", "error");
        return;
      }

      if (attachmentInsertError) {
        console.error("AI 영수증 첨부정보 저장 실패:", attachmentInsertError);

        if (storageRemoveError) {
          console.error("AI 영수증 Storage 롤백 실패:", storageRemoveError);
        }

        const { error: rollbackTransactionError } = await deleteTransaction(
          supabase,
          insertedTransaction.id,
          user.id,
        );

        if (rollbackTransactionError) {
          console.error("AI 거래 저장 롤백 실패:", rollbackTransactionError);
        }

        showToast(
          "영수증 정보를 저장하지 못해 거래 저장을 취소했어요.",
          "error",
        );
        return;
      }

      console.log("AI 영수증 저장 성공:", storagePath);
    }

    // 8. 저장 성공 → 화면 즉시 반영
    console.log("AI 소비 기록 저장 성공:", insertedTransaction);

    const newTransaction = formatTransaction(insertedTransaction);

    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

    highlightTransaction(insertedTransaction.id);

    // 9. AI 입력 상태 초기화
    showToast("AI 소비 기록을 저장했어요.");

    setAiTransactionForm(initialAiTransactionForm);
    setAiTransactionErrors({});
    setAiPreview("");
    setAiErrorMessage("");
    setAiStatus("idle");

    setAiTypeValues({
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
      },
    });
  };

  return {
    onTransactionSubmit,
    handleConfirmMultipleSubmit,
    onAiTransactionSubmit,
    handleUpdateTransaction,
    handleOpenDetail,
    handleDeleteTransaction,
  };
};
