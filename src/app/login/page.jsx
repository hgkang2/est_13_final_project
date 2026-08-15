"use client";
import { useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "../../components/common/Toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [toast, setToast] = useState({
  isOpen: false,
  type: "success",
  message: "",
});

const [fieldErrors, setFieldErrors] = useState({
  email: "",
  password: "",
});

const showToast = (message, type = "success") => {
  setToast({
    isOpen: true,
    type,
    message,
  });
};

  const handleLogin = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  const errors = {
    email: "",
    password: "",
  };

  if (!email) {
    errors.email = "이메일을 입력해 주세요.";
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      errors.email = "올바른 이메일 형식을 입력해 주세요.";
    }
  }

  if (!password) {
    errors.password = "비밀번호를 입력해 주세요.";
  }

  const firstErrorKey = errors.email ? "email" : errors.password ? "password" : null;

if (firstErrorKey) {
  setFieldErrors({
    email: "",
    password: "",
    [firstErrorKey]: errors[firstErrorKey],
  });

  return;
}

  setFieldErrors({
    email: "",
    password: "",
  });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);

    setFieldErrors({
      email: "",
      password: "이메일 또는 비밀번호가 올바르지 않습니다.",
  });
    return;
  }

  router.push("/sub-home");
};

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/sub-home`,
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
        redirectTo: `${window.location.origin}/auth/callback?next=/sub-home`,
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
            <Link className="tab active" href="/login">
              로그인
            </Link>
            <Link className="tab" href="/register">
              회원가입
            </Link>
            <Link className="tab" href="/passwordConfirm">
              비밀번호 찾기
            </Link>
          </nav>

          <form className="form" onSubmit={handleLogin} noValidate>
            <div className="input input-with-error">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                onChange={() =>
                setFieldErrors((previous) => ({
            ...previous,
               email: "",
           }))
          }
              />
              {fieldErrors.email && (
    <div id="login-email-error" className="error-bubble" role="alert">
      <span className="material-icons" aria-hidden="true">
        error
      </span>
      {fieldErrors.email}
    </div>
  )}
            </div>
            <div className="input input-with-error">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                aria-invalid={Boolean(fieldErrors.password)}
    aria-describedby={
      fieldErrors.password ? "login-password-error" : undefined
    }
    onChange={() =>
      setFieldErrors((previous) => ({
        ...previous,
        password: "",
      }))
    }
              />
              {fieldErrors.password && (
    <div id="login-password-error" className="error-bubble" role="alert">
      <span className="material-icons" aria-hidden="true">
        error
      </span>
      {fieldErrors.password}
    </div>
  )}
            </div>
            <button className="button" type="submit">
              로그인
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
