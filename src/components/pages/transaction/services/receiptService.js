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

  const { error: uploadError } = await supabase.storage
    .from("transaction-attachments")
    .upload(storagePath, attachment, {
      contentType: attachment.type,
      upsert: false,
    });

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
    const { error: storageRemoveError } = await supabase.storage
      .from("transaction-attachments")
      .remove([storagePath]);

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
