import {
  validateReceiptFile,
  validateTransactionForm,
} from "../utils/transactionValidator";
import { formatTransaction } from "../utils/transactionFormatter";
import { createTransactionDate, getToday } from "../utils/transactionDate";
import {
  createMultipleTransactions,
  createTransaction,
  createFocusGoalDeposit,
  createAiFocusGoalDeposit,
  fetchTransactionRollbackSnapshot,
  fetchTransactionGoalLink,
  deleteTransaction,
  deleteFocusGoalTransaction,
  updateTransaction,
  updateFocusGoalTransaction,
  rollbackFocusGoalTransaction,
  refreshSpendingAnalysisIfNeeded,
} from "../services/transactionService";
import {
  createReceiptSignedUrl,
  fetchReceiptAttachment,
  removeReceiptAttachment,
  removeReceiptFile,
  replaceReceiptAttachment,
  saveReceiptAttachment,
} from "../services/receiptService";
import {
  initialAiTransactionForm,
  initialAiTypeValues,
  initialTransactionForm,
} from "./useTransactionForm";

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
  resetMultipleRows,
  removeMultipleRows,
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
  setIsSelectedDeleteSuccessOpen,
  setTransactions,
  refreshTransactions,
  refreshRecentTransactions,
  refreshMonthlySummary,
  refreshFocusGoals,
  setRecentlyAddedId,
  showToast,
  onTransactionSaved,
}) => {
  // 로그인 사용자 확인
  const getCurrentUser = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 확인 실패:", userError);
      showToast("로그인 정보를 확인할 수 없어요.", "error");
      return null;
    }

    return user;
  };

  // 저장 또는 수정한 거래를 잠시 강조
  const highlightTransaction = transactionId => {
    setRecentlyAddedId(transactionId);

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1800);
  };

  // 거래 수정 후 후속 작업 실패 시 기존 거래값으로 원복
  const rollbackTransactionUpdate = async (
    transactionId,
    userId,
    rollbackData,
  ) => {
    // 수정 전/후 어느 한쪽이라도 집중목표 거래면 goal-aware 롤백 필요
    const { data: currentGoalLink, error: goalLinkError } =
      await fetchTransactionGoalLink(supabase, transactionId, userId);

    if (goalLinkError || !currentGoalLink) {
      console.error("거래 롤백 전 집중목표 연결 확인 실패:", goalLinkError);

      return (
        goalLinkError ??
        new Error("롤백할 거래의 집중목표 연결 정보를 확인할 수 없습니다.")
      );
    }

    const isFocusGoalRollback = Boolean(
      rollbackData.saving_goal_id || currentGoalLink.saving_goal_id,
    );

    let rollbackError = null;

    if (isFocusGoalRollback) {
      const { error: focusRollbackError } = await rollbackFocusGoalTransaction(
        supabase,
        transactionId,
        rollbackData,
      );

      rollbackError = focusRollbackError;
    } else {
      const { error: regularRollbackError } = await updateTransaction(
        supabase,
        transactionId,
        userId,
        rollbackData,
      );

      rollbackError = regularRollbackError;
    }

    if (rollbackError) {
      console.error("거래 수정 롤백 실패:", rollbackError);
    }

    return rollbackError;
  };

  // 영수증 저장 실패 시 함께 생성된 거래도 롤백
  const saveReceiptWithRollback = async (userId, transactionId, attachment) => {
    const receiptResult = await saveReceiptAttachment(
      supabase,
      userId,
      transactionId,
      attachment,
    );

    if (!receiptResult.uploadError && !receiptResult.attachmentInsertError) {
      return {
        ...receiptResult,
        rollbackTransactionError: null,
      };
    }

    // 실패한 거래가 집중목표와 연결되어 있는지 확인
    const { data: transactionGoalLink, error: goalLinkError } =
      await fetchTransactionGoalLink(supabase, transactionId, userId);

    if (goalLinkError || !transactionGoalLink) {
      console.error(
        "거래 저장 롤백 전 집중목표 연결 확인 실패:",
        goalLinkError,
      );

      return {
        ...receiptResult,
        rollbackTransactionError:
          goalLinkError ??
          new Error("롤백할 거래의 집중목표 연결 정보를 확인할 수 없습니다."),
      };
    }

    let rollbackTransactionError = null;

    if (transactionGoalLink.saving_goal_id) {
      const { error: focusRollbackError } = await deleteFocusGoalTransaction(
        supabase,
        transactionId,
      );

      rollbackTransactionError = focusRollbackError;
    } else {
      const { error: regularRollbackError } = await deleteTransaction(
        supabase,
        transactionId,
        userId,
      );

      rollbackTransactionError = regularRollbackError;
    }

    return {
      ...receiptResult,
      rollbackTransactionError,
    };
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
    const user = await getCurrentUser();

    if (!user) return;

    const attachment = transactionForm.attachment;

    if (attachment) {
      const receiptFileError = validateReceiptFile(attachment);

      if (receiptFileError) {
        showToast(receiptFileError, "error");
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
    let insertedTransaction;
    let insertError;

    if (transactionForm.type === "transfer" && transactionForm.savingGoal) {
      const focusGoalResult = await createFocusGoalDeposit(supabase, {
        userId: user.id,
        requestId: crypto.randomUUID(),
        goalId: transactionForm.savingGoal,
        amount: Number(transactionForm.amount),
        withdrawAccountId: transactionForm.withdrawAccount,
        transactionAt: transactionDate.toISOString(),
        content: transactionForm.content.trim() || null,
        memo: transactionForm.memo.trim() || null,
      });

      insertedTransaction = focusGoalResult.data;
      insertError = focusGoalResult.error;
    } else {
      const transactionResult = await createTransaction(
        supabase,
        transactionData,
      );

      insertedTransaction = transactionResult.data;
      insertError = transactionResult.error;
    }

    // 저장 실패
    if (insertError) {
      console.error("소비 기록 저장 실패:", insertError);
      showToast("소비 기록을 저장하지 못했어요.", "error");
      return;
    }

    if (!insertedTransaction) {
      console.error("저장 결과가 반환되지 않았습니다.");
      showToast("소비 기록 저장 결과를 확인하지 못했어요.", "error");
      return;
    }

    // 영수증 첨부파일 저장
    if (attachment) {
      const {
        uploadError,
        attachmentInsertError,
        storageRemoveError,
        rollbackTransactionError,
      } = await saveReceiptWithRollback(
        user.id,
        insertedTransaction.id,
        attachment,
      );

      if (uploadError) {
        console.error("영수증 Storage 업로드 실패:", uploadError);

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        showToast("영수증 업로드에 실패해 거래 저장을 취소했어요.", "error");
        return;
      }

      if (attachmentInsertError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentInsertError);

        if (storageRemoveError) {
          console.error("영수증 Storage 롤백 실패:", storageRemoveError);
        }

        if (rollbackTransactionError) {
          console.error("거래 저장 롤백 실패:", rollbackTransactionError);
        }

        showToast(
          "영수증 정보를 저장하지 못해 거래 저장을 취소했어요.",
          "error",
        );
        return;
      }

    }
    // 저장 성공
    const newTransaction = formatTransaction(insertedTransaction);

    const isTodayTransaction = newTransaction.dateValue === getToday();

    // 오늘 거래는 실제 정렬 위치가 최신이므로 즉시 표시
    if (isTodayTransaction) {
      setTransactions(prevTransactions => [
        newTransaction,
        ...prevTransactions,
      ]);

      highlightTransaction(insertedTransaction.id);
    }

    showToast("소비 기록을 저장했어요.");
    setTransactionForm(initialTransactionForm);

    const refreshedTransactions = await refreshTransactions();
    await refreshRecentTransactions();
    await refreshMonthlySummary();

    onTransactionSaved?.(
      newTransaction,
      refreshedTransactions,
      "소비 기록을 저장했어요.",
    );
    if (insertedTransaction.transaction_type === "expense") {
      await refreshSpendingAnalysisIfNeeded(supabase, user.id);
    }
  };

  const handleUpdateTransaction = async updatedForm => {
    if (!selectedTransaction) {
      showToast("수정할 거래 정보를 확인할 수 없어요.", "error");
      return;
    }

    // 1. 로그인 사용자 확인
    const user = await getCurrentUser();

    if (!user) return;

    const { data: rollbackData, error: rollbackDataError } =
      await fetchTransactionRollbackSnapshot(
        supabase,
        selectedTransaction.id,
        user.id,
      );

    if (rollbackDataError || !rollbackData) {
      console.error("수정 전 거래 정보 조회 실패:", rollbackDataError);
      showToast("기존 거래 정보를 확인하지 못했어요.", "error");
      return;
    }

    const { data: existingAttachment, error: existingAttachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (existingAttachmentError) {
      console.error("기존 영수증 정보 조회 실패:", existingAttachmentError);
      showToast("기존 영수증 정보를 확인하지 못했어요.", "error");
      return;
    }

    const newAttachment = updatedForm.attachment;

    if (newAttachment) {
      const receiptFileError = validateReceiptFile(newAttachment);

      if (receiptFileError) {
        showToast(receiptFileError, "error");
        return;
      }
    }

    let nextReceiptImage = selectedTransaction.receiptImage ?? null;

    // 2. 수정 날짜/시간 생성
    const transactionDate = createTransactionDate(
      updatedForm.date,
      updatedForm.time,
    );

    if (Number.isNaN(transactionDate.getTime())) {
      showToast("거래 날짜를 확인해주세요.", "error");
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
    // 기존 거래 또는 수정 결과가 집중목표와 연결되면 RPC로 원자 처리
    const isFocusGoalRelatedUpdate =
      Boolean(selectedTransaction.savingGoalId) ||
      Boolean(updatedForm.savingGoal);

    let updatedTransaction = null;
    let updateError = null;

    if (isFocusGoalRelatedUpdate) {
      const focusUpdateResult = await updateFocusGoalTransaction(supabase, {
        transactionId: selectedTransaction.id,
        transactionType: updatedForm.type,
        amount: Number(updatedForm.amount),

        categoryId: updatedForm.category,

        paymentMethodId:
          updatedForm.type === "transfer" ? null : updatedForm.paymentMethod,

        withdrawAccountId:
          updatedForm.type === "transfer" ? updatedForm.withdrawAccount : null,

        depositAccountId:
          updatedForm.type === "transfer" && !updatedForm.savingGoal
            ? updatedForm.depositAccount
            : null,

        savingGoalId:
          updatedForm.type === "transfer"
            ? updatedForm.savingGoal || null
            : null,

        transactionAt: transactionDate.toISOString(),

        content: updatedForm.content.trim() || null,
        memo: updatedForm.memo.trim() || null,

        isRecurring:
          updatedForm.type === "transfer" && !updatedForm.savingGoal
            ? Boolean(updatedForm.isRecurring)
            : false,

        recurringDay:
          updatedForm.type === "transfer" &&
          !updatedForm.savingGoal &&
          updatedForm.isRecurring
            ? Number(updatedForm.recurringDay)
            : null,
      });

      updatedTransaction = focusUpdateResult.data;
      updateError = focusUpdateResult.error;
    } else {
      const regularUpdateResult = await updateTransaction(
        supabase,
        selectedTransaction.id,
        user.id,
        updateData,
      );

      updatedTransaction = regularUpdateResult.data;
      updateError = regularUpdateResult.error;
    }
    // 5. 수정 실패
    if (updateError) {
      console.error("소비 기록 수정 실패:", updateError);
      showToast("소비 기록을 수정하지 못했어요.", "error");
      return;
    }

    if (!updatedTransaction) {
      console.error("수정 결과가 반환되지 않았습니다.");
      showToast("수정된 소비 기록을 확인하지 못했어요.", "error");
      return;
    }

    // 영수증 첨부 수정 처리
    // 새 영수증 선택 → 신규 첨부 또는 기존 첨부 교체
    if (newAttachment) {
      const {
        newStoragePath,
        uploadError,
        attachmentSaveError,
        rollbackStorageError,
        oldStorageRemoveError,
      } = await replaceReceiptAttachment(
        supabase,
        user.id,
        selectedTransaction.id,
        newAttachment,
        existingAttachment,
      );

      if (uploadError) {
        console.error("새 영수증 업로드 실패:", uploadError);

        const rollbackError = await rollbackTransactionUpdate(
          selectedTransaction.id,
          user.id,
          rollbackData,
        );

        if (rollbackError) {
          showToast(
            "영수증 수정에 실패했고 거래 변경도 되돌리지 못했어요. 다시 확인해주세요.",
            "error",
          );
          return;
        }

        showToast(
          "새 영수증을 업로드하지 못해 거래 수정을 취소했어요.",
          "error",
        );
        return;
      }

      if (attachmentSaveError) {
        console.error("영수증 첨부정보 저장 실패:", attachmentSaveError);

        if (rollbackStorageError) {
          console.error("새 영수증 Storage 롤백 실패:", rollbackStorageError);
        }

        const rollbackError = await rollbackTransactionUpdate(
          selectedTransaction.id,
          user.id,
          rollbackData,
        );

        if (rollbackError) {
          showToast(
            "영수증 수정에 실패했고 거래 변경도 되돌리지 못했어요. 다시 확인해주세요.",
            "error",
          );
          return;
        }

        showToast(
          "영수증 정보를 수정하지 못해 거래 수정을 취소했어요.",
          "error",
        );
        return;
      }

      if (oldStorageRemoveError) {
        console.error("기존 영수증 Storage 정리 실패:", oldStorageRemoveError);
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
        const { attachmentDeleteError, storageRemoveError } =
          await removeReceiptAttachment(supabase, existingAttachment);

        if (attachmentDeleteError) {
          console.error("영수증 첨부정보 삭제 실패:", attachmentDeleteError);

          const rollbackError = await rollbackTransactionUpdate(
            selectedTransaction.id,
            user.id,
            rollbackData,
          );

          if (rollbackError) {
            showToast(
              "영수증 삭제에 실패했고 거래 변경도 되돌리지 못했어요. 다시 확인해주세요.",
              "error",
            );
            return;
          }

          showToast(
            "영수증 정보를 삭제하지 못해 거래 수정을 취소했어요.",
            "error",
          );
          return;
        }

        if (storageRemoveError) {
          // DB 연결은 이미 제거
          // Storage에 파일만 남는 cleanup 문제 -> 사용자 수정은 유지.
          console.error("영수증 Storage 삭제 실패:", storageRemoveError);
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
    showToast("소비 기록을 수정했어요.");

    await refreshTransactions();
    await refreshRecentTransactions();
    await refreshMonthlySummary();
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
      showToast("삭제할 거래 정보를 확인할 수 없어요.", "error");
      return;
    }

    // 1. 로그인 사용자 확인
    const user = await getCurrentUser();

    if (!user) return;

    // 2. 거래 삭제 후 Storage 정리를 위해 기존 영수증 경로 확인
    const { data: existingAttachment, error: attachmentError } =
      await fetchReceiptAttachment(supabase, selectedTransaction.id);

    if (attachmentError) {
      console.error("첨부파일 정보 조회 실패:", attachmentError);
      showToast("첨부파일 정보를 확인하지 못했어요.", "error");
      return;
    }

    // 3. 거래 삭제
    // 집중목표 거래는 history + goal 금액까지 RPC에서 함께 원자 처리
    let deleteError = null;

    if (selectedTransaction.savingGoalId) {
      const { error: focusDeleteError } = await deleteFocusGoalTransaction(
        supabase,
        selectedTransaction.id,
      );

      deleteError = focusDeleteError;
    } else {
      const { error: regularDeleteError } = await deleteTransaction(
        supabase,
        selectedTransaction.id,
        user.id,
      );

      deleteError = regularDeleteError;
    }

    if (deleteError) {
      console.error("소비 기록 삭제 실패:", deleteError);
      showToast("소비 기록을 삭제하지 못했어요.", "error");
      return;
    }

    // 4. DB 삭제 성공 후 Storage 파일 정리
    if (existingAttachment?.storage_path) {
      const { error: storageDeleteError } = await removeReceiptFile(
        supabase,
        existingAttachment.storage_path,
      );

      if (storageDeleteError) {
        // 거래와 첨부 DB는 정상 삭제됨.
        // Storage에 사용하지 않는 파일만 남는 cleanup 문제.
        console.error(
          "삭제된 거래의 영수증 Storage 정리 실패:",
          storageDeleteError,
        );
      }
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
    setPanelView("entry");

    setIsDeleteConfirmOpen(false);
    setIsDeleteSuccessOpen(true);

    await refreshTransactions();
    await refreshRecentTransactions();
    await refreshMonthlySummary();
  };

  // 선택 거래 삭제
  const handleDeleteSelectedTransactions = async transactionIds => {
    if (!transactionIds?.length) {
      showToast("삭제할 거래를 선택해주세요.", "error");
      return;
    }

    // 1. 로그인 사용자 확인
    const user = await getCurrentUser();

    if (!user) return;

    const deletedIds = [];
    const failedIds = [];

    // 2. 선택 거래별 영수증 경로 확인 후 거래 삭제
    for (const transactionId of transactionIds) {
      const { data: existingAttachment, error: attachmentError } =
        await fetchReceiptAttachment(supabase, transactionId);

      if (attachmentError) {
        console.error(
          "선택 거래 첨부파일 정보 조회 실패:",
          transactionId,
          attachmentError,
        );

        failedIds.push(transactionId);
        continue;
      }

      // 3. 집중목표 연결 여부 확인
      const { data: transactionGoalLink, error: goalLinkError } =
        await fetchTransactionGoalLink(supabase, transactionId, user.id);

      if (goalLinkError || !transactionGoalLink) {
        console.error(
          "선택 거래 집중목표 연결 정보 조회 실패:",
          transactionId,
          goalLinkError,
        );

        failedIds.push(transactionId);
        continue;
      }

      // 4. 거래 삭제
      // 집중목표 거래는 history + goal 금액까지 RPC에서 함께 원자 처리
      let deleteError = null;

      if (transactionGoalLink.saving_goal_id) {
        const { error: focusDeleteError } = await deleteFocusGoalTransaction(
          supabase,
          transactionId,
        );

        deleteError = focusDeleteError;
      } else {
        const { error: regularDeleteError } = await deleteTransaction(
          supabase,
          transactionId,
          user.id,
        );

        deleteError = regularDeleteError;
      }

      if (deleteError) {
        console.error("선택 거래 삭제 실패:", transactionId, deleteError);
        failedIds.push(transactionId);
        continue;
      }

      // 5. DB 삭제 성공 후 Storage 파일 정리
      if (existingAttachment?.storage_path) {
        const { error: storageDeleteError } = await removeReceiptFile(
          supabase,
          existingAttachment.storage_path,
        );

        if (storageDeleteError) {
          // 거래와 첨부 DB는 정상 삭제됨.
          // Storage에 사용하지 않는 파일만 남는 cleanup 문제.
          console.error(
            "선택 삭제 거래의 영수증 Storage 정리 실패:",
            transactionId,
            storageDeleteError,
          );
        }
      }

      // DB 삭제에 성공한 거래만 성공 목록에 추가
      deletedIds.push(transactionId);
    }

    // 6. 삭제 성공 거래 화면에서 제거
    if (deletedIds.length > 0) {
      setTransactions(prevTransactions =>
        prevTransactions.filter(
          transaction => !deletedIds.includes(transaction.id),
        ),
      );

      setSelectedIds(prevSelectedIds =>
        prevSelectedIds.filter(id => !deletedIds.includes(id)),
      );

      await refreshTransactions();
      await refreshRecentTransactions();
      await refreshMonthlySummary();
    }

    // 7. 일부 또는 전체 삭제 실패 안내
    if (failedIds.length > 0) {
      if (deletedIds.length > 0) {
        showToast(
          `${deletedIds.length}건을 삭제했고, ${failedIds.length}건은 삭제하지 못했어요.`,
          "error",
        );
        return;
      }

      showToast(
        `${failedIds.length}건의 소비 기록을 삭제하지 못했어요.`,
        "error",
      );
      return;
    }

    // 8. 전체 삭제 성공
    setIsSelectedDeleteSuccessOpen(true);
  };

  // 다건 저장 함수
  const handleConfirmMultipleSubmit = async () => {
    const validRows = multipleRows.filter(isValidMultipleRow);

    if (validRows.length === 0) {
      setIsMultipleConfirmOpen(false);
      showToast("저장할 수 있는 거래가 없어요.", "error");
      return;
    }

    // 1. 로그인 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      setIsMultipleConfirmOpen(false);
      return;
    }

    // 2. 일반 거래 / 집중목표 적립 거래 분리
    const focusGoalRows = validRows.filter(
      row => row.type === "transfer" && row.savingGoal,
    );

    const regularRows = validRows.filter(
      row => !(row.type === "transfer" && row.savingGoal),
    );

    const savedTransactions = [];
    const savedRowIds = [];

    // 3. 집중목표 적립 거래 저장
    // 같은 목표에 여러 행이 있을 수 있으므로 순서대로 처리
    for (const row of focusGoalRows) {
      const transactionDate = createTransactionDate(row.date, row.time);

      const { data: insertedTransaction, error: insertError } =
        await createFocusGoalDeposit(supabase, {
          userId: user.id,
          requestId: crypto.randomUUID(),
          goalId: row.savingGoal,
          amount: Number(row.amount),
          withdrawAccountId: row.withdrawAccount,
          transactionAt: transactionDate.toISOString(),
          content: row.content.trim() || null,
          memo: row.memo.trim() || null,
        });

      if (insertError || !insertedTransaction) {
        console.error("다건 집중목표 적립 저장 실패:", row.id, insertError);

        setIsMultipleConfirmOpen(false);

        // 앞에서 이미 저장된 행은 입력창에서 제거해 중복 저장 방지
        if (savedRowIds.length > 0) {
          const newTransactions = savedTransactions.map(formatTransaction);

          setTransactions(prevTransactions => [
            ...newTransactions,
            ...prevTransactions,
          ]);

          removeMultipleRows(savedRowIds);

          await refreshTransactions();
          await refreshRecentTransactions();
          await refreshMonthlySummary();

          showToast(
            `${newTransactions.length}건은 저장됐고, 나머지 거래는 저장하지 못했어요.`,
            "error",
          );

          return;
        }

        showToast("집중목표 적립 거래를 저장하지 못했어요.", "error");
        return;
      }

      savedTransactions.push(insertedTransaction);
      savedRowIds.push(row.id);
    }

    // 4. 나머지 일반 거래는 기존 다건 INSERT
    let insertedRegularTransactions = [];

    if (regularRows.length > 0) {
      const transactionData = regularRows.map(row => {
        const transactionDate = createTransactionDate(row.date, row.time);

        return {
          ...createTransactionBaseData(row, user.id, transactionDate),
          input_method: "manual",
          is_recurring: false,
          recurring_day: null,
        };
      });

      const { data, error: insertError } = await createMultipleTransactions(
        supabase,
        transactionData,
      );

      if (insertError) {
        console.error("다건 소비 기록 저장 실패:", insertError);

        setIsMultipleConfirmOpen(false);

        // 집중목표 행이 먼저 저장됐다면 해당 행만 제거
        if (savedRowIds.length > 0) {
          const newTransactions = savedTransactions.map(formatTransaction);

          setTransactions(prevTransactions => [
            ...newTransactions,
            ...prevTransactions,
          ]);

          removeMultipleRows(savedRowIds);

          await refreshTransactions();
          await refreshRecentTransactions();
          await refreshMonthlySummary();

          showToast(
            `${newTransactions.length}건은 저장됐고, 나머지 거래는 저장하지 못했어요.`,
            "error",
          );

          return;
        }

        showToast("소비 기록을 저장하지 못했어요.", "error");
        return;
      }

      insertedRegularTransactions = data ?? [];

      savedTransactions.push(...insertedRegularTransactions);
      savedRowIds.push(...regularRows.map(row => row.id));
    }

    // 5. DB 데이터 → 기존 UI 형식
    const newTransactions = savedTransactions.map(formatTransaction);

    // 6. 화면 즉시 반영
    setTransactions(prevTransactions => [
      ...newTransactions,
      ...prevTransactions,
    ]);

    // 7. 전체 저장 성공 → 다건 입력 초기화
    resetMultipleRows();

    setIsMultipleConfirmOpen(false);
    showToast(`${newTransactions.length}건의 소비 기록을 저장했어요.`);

    await refreshTransactions();
    await refreshRecentTransactions();
    await refreshMonthlySummary();

    // 지출이 포함된 경우만 소비 분석 갱신
    if (
      insertedRegularTransactions.some(
        transaction => transaction.transaction_type === "expense",
      )
    ) {
      await refreshSpendingAnalysisIfNeeded(supabase, user.id);
    }
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
    const user = await getCurrentUser();

    if (!user) return;

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

      is_recurring:
        aiTransactionForm.type === "transfer" && !aiTransactionForm.savingGoal
          ? Boolean(aiTransactionForm.isRecurring)
          : false,

      recurring_day:
        aiTransactionForm.type === "transfer" &&
        !aiTransactionForm.savingGoal &&
        aiTransactionForm.isRecurring
          ? Number(aiTransactionForm.recurringDay)
          : null,
    };

    // 5. 거래 저장
    let insertedTransaction;
    let insertError;

    if (aiTransactionForm.type === "transfer" && aiTransactionForm.savingGoal) {
      const focusGoalResult = await createAiFocusGoalDeposit(supabase, {
        userId: user.id,
        requestId: crypto.randomUUID(),
        goalId: aiTransactionForm.savingGoal,
        amount: Number(aiTransactionForm.amount),
        withdrawAccountId: aiTransactionForm.withdrawAccount,
        transactionAt: transactionDate.toISOString(),
        content: aiTransactionForm.content.trim() || null,
        memo: aiTransactionForm.memo.trim() || null,
      });

      insertedTransaction = focusGoalResult.data;
      insertError = focusGoalResult.error;
    } else {
      const transactionResult = await createTransaction(
        supabase,
        transactionData,
      );

      insertedTransaction = transactionResult.data;
      insertError = transactionResult.error;
    }

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
        rollbackTransactionError,
      } = await saveReceiptWithRollback(
        user.id,
        insertedTransaction.id,
        attachment,
      );

      if (uploadError) {
        console.error("AI 영수증 Storage 업로드 실패:", uploadError);

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

        if (rollbackTransactionError) {
          console.error("AI 거래 저장 롤백 실패:", rollbackTransactionError);
        }

        showToast(
          "영수증 정보를 저장하지 못해 거래 저장을 취소했어요.",
          "error",
        );
        return;
      }
    }

    // 8. 저장 성공 → 화면 즉시 반영
    if (aiTransactionForm.savingGoal) {
      await refreshFocusGoals?.(user.id);
    }
    const newTransaction = formatTransaction(insertedTransaction);

    const isTodayTransaction = newTransaction.dateValue === getToday();

    if (isTodayTransaction) {
      setTransactions(prevTransactions => [
        newTransaction,
        ...prevTransactions,
      ]);

      highlightTransaction(insertedTransaction.id);
    }

    // 9. AI 입력 상태 초기화
    showToast("AI 소비 기록을 저장했어요.");

    setAiTransactionForm(initialAiTransactionForm);
    setAiTransactionErrors({});
    setAiPreview("");
    setAiErrorMessage("");
    setAiStatus("idle");
    setAiTypeValues(initialAiTypeValues);

    const refreshedTransactions = await refreshTransactions();
    await refreshRecentTransactions();
    await refreshMonthlySummary();

    onTransactionSaved?.(
      newTransaction,
      refreshedTransactions,
      "AI 소비 기록을 저장했어요.",
    );

    if (insertedTransaction.transaction_type === "expense") {
      await refreshSpendingAnalysisIfNeeded(supabase, user.id);
    }
  };

  return {
    onTransactionSubmit,
    handleConfirmMultipleSubmit,
    onAiTransactionSubmit,
    handleUpdateTransaction,
    handleOpenDetail,
    handleDeleteTransaction,
    handleDeleteSelectedTransactions,
  };
};
