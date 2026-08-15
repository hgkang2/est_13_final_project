"use client";

import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "../../components/common/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [toast, setToast] = useState({
  isOpen: false,
  type: "success",
  message: "",
});

const [fieldErrors, setFieldErrors] = useState({
  email: "",
  email: "",
  password: "",
  passwordConfirm: "",
  agreements: "",
});

const showToast = (message, type = "success") => {
  setToast({
    isOpen: true,
    type,
    message,
  });
};
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const allChecked = Object.values(agreements).every(Boolean);
  const handleAllChange = e => {
    const checked = e.target.checked;
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };
  const handleAgreementChange = e => {
    const { name, checked } = e.target;
    setAgreements(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

 const handleRegister = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const passwordConfirm = formData
    .get("passwordConfirm")
    ?.toString();

  const errors = {
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreements: "",
  };

  if (!name) {
    errors.name = "이름을 입력해 주세요.";
  }

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
  } else if (password.length < 6) {
    errors.password = "비밀번호는 6자 이상 입력해 주세요.";
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = "비밀번호를 다시 입력해 주세요.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  if (!agreements.terms || !agreements.privacy) {
    errors.agreements = "필수 약관에 동의해 주세요.";
  }

  const errorOrder = [
  "name",
  "email",
  "password",
  "passwordConfirm",
  "agreements",
];

const firstErrorKey = errorOrder.find((key) => errors[key]);

if (firstErrorKey) {
  setFieldErrors({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreements: "",
    [firstErrorKey]: errors[firstErrorKey],
  });

  return;
}

  setFieldErrors({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreements: "",
  });

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        marketing_agreed: agreements.marketing,
      },
    },
  });

  if (error) {
    console.error(error);

    const errorMessage = error.message?.toLowerCase() || "";

    if (errorMessage.includes("already registered")) {
      setFieldErrors((previous) => ({
        ...previous,
        email: "이미 가입된 이메일입니다.",
      }));
      return;
    }

    if (errorMessage.includes("password")) {
      setFieldErrors((previous) => ({
        ...previous,
        password: "사용할 수 없는 비밀번호입니다.",
      }));
      return;
    }

    showToast(
      "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      "error"
    );
    return;
  }

  showToast(
    "회원가입이 완료되었습니다. 이메일을 확인해 주세요.",
    "success"
  );

  setTimeout(() => {
    router.push("/login");
  }, 2000);
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
            <Link className="tab" href="/login">
              로그인
            </Link>
            <Link className="tab active" href="/register">
              회원가입
            </Link>
            <Link className="tab" href="/passwordConfirm">
              비밀번호 찾기
            </Link>
          </nav>

          <form className="form" onSubmit={handleRegister} noValidate>
            <div className="input input-with-error">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
                onChange={() =>
                setFieldErrors((previous) => ({
                ...previous,
                name: "",
      }))
    }
              />
              {fieldErrors.name && (
              <div id="register-name-error" className="error-bubble" role="alert">
               <span className="material-icons" aria-hidden="true">
                 error
              </span>
               {fieldErrors.name}
             </div>
            )}
            </div>
            <div className="input input-with-error">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                onChange={() =>
                setFieldErrors((previous) => ({
                ...previous,
                email: "",
            }))
            }
              />
               {fieldErrors.email && (
              <div id="register-name-error" className="error-bubble" role="alert">
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
                aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
                onChange={() =>
                setFieldErrors((previous) => ({
                ...previous,
                 password: "",
              }))
             }
           />

             {fieldErrors.password && (
            <div id="register-password-error" className="error-bubble" role="alert">
            <span className="material-icons" aria-hidden="true">
              error
           </span>
              {fieldErrors.password}
           </div>
          )}
              
            </div>
            <div className="input input-with-error">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                aria-invalid={Boolean(fieldErrors.passwordConfirm)}
                aria-describedby={fieldErrors.passwordConfirm ? "register-passwordConfirm-error" : undefined}
                onChange={() =>
                setFieldErrors((previous) => ({
                ...previous,
                passwordConfirm: "",
              }))
             }
           />

                {fieldErrors.passwordConfirm && (
             <div id="register-passwordConfirm-error" className="error-bubble" role="alert">
               <span className="material-icons" aria-hidden="true">
                  error
               </span>
             {fieldErrors.passwordConfirm}
            </div>
            )}
              
            </div>

            <div className="terms input-with-error">
              <label className="termItem">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllChange}
                />
                <span>전체 약관에 동의합니다</span>
              </label>
              <label className="termItem">
                <input
                  type="checkbox"
                  name="terms"
                  checked={agreements.terms}
                  onChange={handleAgreementChange}
                  
                />
                <span>[필수] 이용약관에 동의합니다</span>
              </label>
              <label className="termItem">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={agreements.privacy}
                  onChange={handleAgreementChange}
                  
                />
                <span>[필수] 개인정보 처리방침에 동의합니다</span>
              </label>
              <label className="termItem">
                <input
                  type="checkbox"
                  name="marketing"
                  checked={agreements.marketing}
                  onChange={handleAgreementChange}
                />
                <span>[선택] 마케팅 정보 수신에 동의합니다</span>
              </label>
              {fieldErrors.agreements && (
             <div
                 id="register-agreements-error"
                 className="error-bubble"
                 role="alert"
                 >
               <span className="material-icons" aria-hidden="true">
                   error
              </span>
                {fieldErrors.agreements}
              </div>
             )}
            </div>

            <button className="button" type="submit">
              회원가입
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
