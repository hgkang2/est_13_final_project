"use client";

import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
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

  const handleRegister = async e => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirm = formData.get("passwordConfirm");

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreements.terms || !agreements.privacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
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
      alert(error.message);
      console.error(error);
      return;
    }
    alert(
      "회원가입이 완료되었습니다.입력하신 이메일로 인증 메일을 발송했습니다.이메일 인증 후 로그인해주세요.",
    );
    router.push("/login");
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

          <form className="form" onSubmit={handleRegister}>
            <div className="input">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div className="input">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div className="input">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div className="input">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <div className="terms">
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
                  required
                />
                <span>[필수] 이용약관에 동의합니다</span>
              </label>
              <label className="termItem">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={agreements.privacy}
                  onChange={handleAgreementChange}
                  required
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
    </main>
  );
}
