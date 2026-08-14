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

  const { error: attachmentInsertError } = await supabase
    .from("transaction_attachments")
    .insert({
      transaction_id: transactionId,
      storage_path: storagePath,
      file_name: attachment.name,
      mime_type: attachment.type,
    });

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
