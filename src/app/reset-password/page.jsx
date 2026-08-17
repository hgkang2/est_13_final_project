"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Toast from "../../components/common/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState({
  isOpen: false,
  type: "success",
  message: "",
});

const [fieldErrors, setFieldErrors] = useState({
  password: "",
  confirmPassword: "",
});

const showToast = (message, type = "success") => {
  setToast({
    isOpen: true,
    type,
    message,
  });
};

  const handleUpdatePassword = async (e) => {
  e.preventDefault();

  if (!password) {
    setFieldErrors({
      password: "새 비밀번호를 입력해 주세요.",
      confirmPassword: "",
    });
    return;
  }

  if (password.length < 6) {
    setFieldErrors({
      password: "비밀번호는 6자 이상 입력해 주세요.",
      confirmPassword: "",
    });
    return;
  }

  if (!confirmPassword) {
    setFieldErrors({
      password: "",
      confirmPassword: "새 비밀번호를 다시 입력해 주세요.",
    });
    return;
  }

  if (password !== confirmPassword) {
    setFieldErrors({
      password: "",
      confirmPassword: "비밀번호가 일치하지 않습니다.",
    });
    return;
  }

  setFieldErrors({
    password: "",
    confirmPassword: "",
  });

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error(error);

    const errorMessage = error.message?.toLowerCase() || "";

    if (errorMessage.includes("different")) {
      setFieldErrors({
        password: "기존 비밀번호와 다른 비밀번호를 입력해 주세요.",
        confirmPassword: "",
      });
      return;
    }

    if (
      errorMessage.includes("session") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("jwt")
    ) {
      showToast(
        "비밀번호 재설정 링크가 만료되었습니다. 다시 요청해 주세요.",
        "error"
      );
      return;
    }

    showToast(
      "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      "error"
    );
    return;
  }

  showToast(
    "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.",
    "success"
  );

  setTimeout(() => {
    router.push("/login");
  }, 2000);
};

  return (
    <div className="reset-overlay">
    <div className="reset-modal">
      <form onSubmit={handleUpdatePassword} noValidate>
        <h2>새 비밀번호 설정</h2>

        <div className="input-with-error">
  <input
    type="password"
    placeholder="새 비밀번호"
    value={password}
    aria-invalid={Boolean(fieldErrors.password)}
    aria-describedby={
      fieldErrors.password ? "reset-password-error" : undefined
    }
    onChange={(e) => {
      setPassword(e.target.value);

      setFieldErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }}
  />

  {fieldErrors.password && (
    <div
      id="reset-password-error"
      className="error-bubble"
      role="alert"
    >
      <span className="material-icons" aria-hidden="true">
        error
      </span>
      {fieldErrors.password}
    </div>
  )}
</div>

        <div className="input-with-error">
  <input
    type="password"
    placeholder="새 비밀번호 확인"
    value={confirmPassword}
    aria-invalid={Boolean(fieldErrors.confirmPassword)}
    aria-describedby={
      fieldErrors.confirmPassword
        ? "reset-confirm-password-error"
        : undefined
    }
    onChange={(e) => {
      setConfirmPassword(e.target.value);

      setFieldErrors((previous) => ({
        ...previous,
        confirmPassword: "",
      }));
    }}
  />

  {fieldErrors.confirmPassword && (
    <div
      id="reset-confirm-password-error"
      className="error-bubble"
      role="alert"
    >
      <span className="material-icons" aria-hidden="true">
        error
      </span>
      {fieldErrors.confirmPassword}
    </div>
  )}
</div>

        <button type="submit">
          비밀번호 변경
        </button>
      </form>
    </div>
    <Toast
      isOpen={toast.isOpen}
      type={toast.type}
      message={toast.message}
      onClose={() =>
        setToast((previous) => ({
          ...previous,
          isOpen: false,
        }))
      }
    />
  </div>
  );
}