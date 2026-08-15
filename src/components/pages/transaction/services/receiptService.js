// 새 영수증 파일과 첨부정보 저장
export const saveReceiptAttachment = async (
  supabase,
  userId,
  transactionId,
  attachment,
) => {
  const extension = attachment.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeFileName = `receipt-${Date.now()}.${extension}`;
  const storagePath = `${userId}/${transactionId}/${safeFileName}`;

  const { error: uploadError } = await uploadReceiptFile(
    supabase,
    storagePath,
    attachment,
  );

  if (uploadError) {
    return {
      storagePath,
      uploadError,
      attachmentInsertError: null,
      storageRemoveError: null,
    };
  }

  const { error: attachmentInsertError } = await createReceiptAttachment(
    supabase,
    transactionId,
    storagePath,
    attachment,
  );

  if (attachmentInsertError) {
    const { error: storageRemoveError } = await removeReceiptFile(
      supabase,
      storagePath,
    );
    return {
      storagePath,
      uploadError: null,
      attachmentInsertError,
      storageRemoveError,
    };
  }

  return {
    storagePath,
    uploadError: null,
    attachmentInsertError: null,
    storageRemoveError: null,
  };
};

// 수정 화면에서 새 영수증을 저장하거나 기존 영수증 교체
export const replaceReceiptAttachment = async (
  supabase,
  userId,
  transactionId,
  attachment,
  existingAttachment,
) => {
  const extension = attachment.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeFileName = `receipt-${Date.now()}.${extension}`;
  const newStoragePath = `${userId}/${transactionId}/${safeFileName}`;

  const { error: uploadError } = await uploadReceiptFile(
    supabase,
    newStoragePath,
    attachment,
  );

  if (uploadError) {
    return {
      newStoragePath,
      uploadError,
      attachmentSaveError: null,
      rollbackStorageError: null,
      oldStorageRemoveError: null,
    };
  }

  let attachmentSaveError = null;

  if (existingAttachment) {
    const { error } = await updateReceiptAttachment(
      supabase,
      existingAttachment.id,
      newStoragePath,
      attachment,
    );

    attachmentSaveError = error;
  } else {
    const { error } = await createReceiptAttachment(
      supabase,
      transactionId,
      newStoragePath,
      attachment,
    );

    attachmentSaveError = error;
  }

  // 첨부정보 저장 실패 시 새 Storage 파일 롤백
  if (attachmentSaveError) {
    const { error: rollbackStorageError } = await removeReceiptFile(
      supabase,
      newStoragePath,
    );

    return {
      newStoragePath,
      uploadError: null,
      attachmentSaveError,
      rollbackStorageError,
      oldStorageRemoveError: null,
    };
  }

  let oldStorageRemoveError = null;

  // 교체가 끝난 뒤 기존 Storage 파일 정리
  if (
    existingAttachment?.storage_path &&
    existingAttachment.storage_path !== newStoragePath
  ) {
    const { error } = await removeReceiptFile(
      supabase,
      existingAttachment.storage_path,
    );

    oldStorageRemoveError = error;
  }

  return {
    newStoragePath,
    uploadError: null,
    attachmentSaveError: null,
    rollbackStorageError: null,
    oldStorageRemoveError,
  };
};

// 영수증 이미지 signed URL 생성
export const createReceiptSignedUrl = async (supabase, storagePath) => {
  return await supabase.storage
    .from("transaction-attachments")
    .createSignedUrl(storagePath, 60 * 10);
};

// 거래의 영수증 첨부정보 조회
export const fetchReceiptAttachment = async (supabase, transactionId) => {
  return await supabase
    .from("transaction_attachments")
    .select("id, storage_path, file_name, mime_type")
    .eq("transaction_id", transactionId)
    .maybeSingle();
};

// 영수증 Storage 파일 삭제
export const removeReceiptFile = async (supabase, storagePath) => {
  return await supabase.storage
    .from("transaction-attachments")
    .remove([storagePath]);
};

// 영수증 Storage 파일 업로드
export const uploadReceiptFile = async (supabase, storagePath, attachment) => {
  return await supabase.storage
    .from("transaction-attachments")
    .upload(storagePath, attachment, {
      contentType: attachment.type,
      upsert: false,
    });
};

// 영수증 첨부정보 저장
export const createReceiptAttachment = async (
  supabase,
  transactionId,
  storagePath,
  attachment,
) => {
  return await supabase.from("transaction_attachments").insert({
    transaction_id: transactionId,
    storage_path: storagePath,
    file_name: attachment.name,
    mime_type: attachment.type,
  });
};

// 영수증 첨부정보 수정
export const updateReceiptAttachment = async (
  supabase,
  attachmentId,
  storagePath,
  attachment,
) => {
  return await supabase
    .from("transaction_attachments")
    .update({
      storage_path: storagePath,
      file_name: attachment.name,
      mime_type: attachment.type,
    })
    .eq("id", attachmentId);
};

// 영수증 첨부정보 삭제
export const deleteReceiptAttachment = async (supabase, attachmentId) => {
  return await supabase
    .from("transaction_attachments")
    .delete()
    .eq("id", attachmentId);
};

// 수정 화면에서 기존 영수증 첨부정보와 Storage 파일 삭제
export const removeReceiptAttachment = async (supabase, existingAttachment) => {
  const { error: attachmentDeleteError } = await deleteReceiptAttachment(
    supabase,
    existingAttachment.id,
  );

  if (attachmentDeleteError) {
    return {
      attachmentDeleteError,
      storageRemoveError: null,
    };
  }

  let storageRemoveError = null;

  if (existingAttachment.storage_path) {
    const { error } = await removeReceiptFile(
      supabase,
      existingAttachment.storage_path,
    );

    storageRemoveError = error;
  }

  return {
    attachmentDeleteError: null,
    storageRemoveError,
  };
};

// 거래 삭제 전 연결된 영수증 Storage 파일 정리
export const removeTransactionReceiptFile = async (
  supabase,
  transactionId,
) => {
  const { data: attachmentData, error: attachmentError } =
    await fetchReceiptAttachment(supabase, transactionId);

  if (attachmentError) {
    return {
      attachmentError,
      storageDeleteError: null,
    };
  }

  if (!attachmentData?.storage_path) {
    return {
      attachmentError: null,
      storageDeleteError: null,
    };
  }

  const { error: storageDeleteError } = await removeReceiptFile(
    supabase,
    attachmentData.storage_path,
  );

  return {
    attachmentError: null,
    storageDeleteError,
  };
};

// AI 영수증 분석 요청
export const analyzeReceipt = async (supabase, analysisData) => {
  return await supabase.functions.invoke("analyze-receipt", {
    body: analysisData,
  });
};
