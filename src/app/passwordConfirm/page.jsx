"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Toast from "../../components/common/Toast";

export default function PasswordConfirmPage() {
  const router = useRouter();
  const supabase = createClient();
  const [emailError, setEmailError] = useState("");

  const [toast, setToast] = useState({
  isOpen: false,
  type: "success",
  message: "",
});

const showToast = (message, type = "success") => {
  setToast({
    isOpen: true,
    type,
    message,
  });
};

  const handlePasswordReset = async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();

      if (!email) {
    setEmailError("이메일을 입력해 주세요.");
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    setEmailError("올바른 이메일 형식을 입력해 주세요.", "error");
    return;
  }
    setEmailError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error(error);

    if (
      error.status === 429 ||
      error.message?.toLowerCase().includes("rate limit")
    ) {
      showToast(
        "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        "warning"
      );
      return;
    }

    showToast(
      "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      "error"
    );
    return;
  }

  showToast(
    "가입된 이메일이라면 비밀번호 재설정 메일이 발송됩니다.",
    "success"
  );
};

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/sub-home`,
      },
    });
    if (error) {
  console.error(error.message);
  showToast("구글 로그인에 실패했습니다. 다시 시도해 주세요.", "error");
}
  };
  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/sub-home`,
      },
    });
     if (error) {
  console.error(error.message);
  showToast("카카오 로그인에 실패했습니다. 다시 시도해 주세요.", "error");
}
  };

  return (
    <main className="page">
      <section className="auth-container">
        <div className="form-section">
          <div className="intro">
            <h1>
              오늘을 모아
              <br />
              원하는 내일로!
            </h1>
            <p>
              작은 실천이 모여 만드는 큰 변화,
              <br />
              MO:UM이 함께할게요.
            </p>
          </div>
          <nav className="tabs">
            <Link className="tab" href="/login">
              로그인
            </Link>
            <Link className="tab" href="/register">
              회원가입
            </Link>
            <Link className="tab active" href="/passwordConfirm">
              비밀번호 찾기
            </Link>
          </nav>

          <form className="form" onSubmit={handlePasswordReset} noValidate>
            <div className="input input-with-error">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="가입한 이메일 주소를 입력하세요"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                onChange={() => {
                  if (emailError) setEmailError("");
            }}
              />
              {emailError && (
         <div id="email-error" className="error-bubble" role="alert">
           <span className="material-icons" aria-hidden="true">
             error
            </span>
             {emailError}
         </div>
         )}
            </div>

            <button className="button" type="submit">
              비밀번호 찾기
            </button>
          </form>
          <div className="sns">
            <div className="sns-title">
              <span />
              <p>SNS로 계속하기</p>
              <span />
            </div>
            <div className="sns-buttons">
              <button
                type="button"
                className="sns-button"
                onClick={handleGoogleLogin}
              >
                <img src="/images/auth/Google.png" alt="구글 로고" />
                <span>구글로 로그인</span>
              </button>
              <button
                type="button"
                className="sns-button"
                onClick={handleKakaoLogin}
              >
                <img src="/images/auth/Kakao.png" alt="카카오 로고" />
                <span>카카오로 로그인</span>
              </button>
            </div>
          </div>
        </div>
        <div className="image-section">
          <img src="/images/auth/image.png" alt="MO:UM 목표 저축 캐릭터" />
        </div>
      </section>
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
    </main>
  );
}
