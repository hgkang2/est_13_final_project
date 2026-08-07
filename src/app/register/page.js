"use client";

import "../auth.css";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useState } from "react";

export default function RegisterPage() {
   
    const handleRegister = async (e) => {
        e.preventDefault();

        const supabase = createClient();
        const formData = new FormData(e.currentTarget);

        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");
        const passwordConfirm = formData.get("passwordConfirm");

        if (password !== passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });
        if (error) {
            alert(error.message);
            return;
        }
        console.log(data);
        alert("회원가입이 완료되었습니다.");
    };

    return (
        <main className="page">
        <section className="container">
        <div className="form-section">
        <div className="intro">
        <h1>오늘을 모아
        <br />
        원하는 내일로!
        </h1>
        <p>작은 실천이 모여 만드는 큰 변화,
        <br />
        MO:UM이 함께할게요.
        </p>
        </div>
        <nav className="tabs">
        <Link 
        className="tab"
        href="/login">로그인</Link>
        <Link className="tab active"
        href="/register">회원가입</Link>
        <Link className="tab"
        href="/passwordConfirm">비밀번호 찾기</Link>
        </nav>

        <form className="form" onSubmit={handleRegister}>
        <div className="input">
        <label htmlFor="name">이름</label>
        <input
        id="name"
        name="name"
        type="text"
        placeholder="이름을 입력하세요" />
        </div>
        <div className="input">
        <label htmlFor="email">이메일</label>
        <input
        id="email"
        name="email"
        type="email"
        placeholder="이메일을 입력하세요" />
        </div>

        <div className="input">
            <label htmlFor="password">비밀번호</label>
            <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요" />
        </div>
        <div className="input">
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        placeholder="비밀번호를 다시 입력하세요" />
        </div>

        <div className="terms">
            <label className="termItem">
                <input type="checkbox" name="terms" required />
                <span>[필수] 전체 약관에 동의합니다</span>
            </label>
            <label className="termItem">
                <input type="checkbox" name="terms" required />
                <span>[필수] 이용약관에 동의합니다</span>
            </label>
            <label className="termItem">
                <input type="checkbox" name="privacy" required />
                <span>[필수] 개인정보 처리방침에 동의합니다</span>
            </label>
            <label className="termItem">
                <input type="checkbox" name="marketing" />
                <span>[선택] 마케팅 정보 수신에 동의합니다</span>
            </label>
        </div> 

        <button className="button" type="submit">회원가입</button>
        </form>
        <div className="sns">
            <div className="sns-title">
                <span />
                <p>SNS로 계속하기</p>
                <span />
            </div>
            <div className="sns-buttons">
            <a className="sns-button"
                href="https://accounts.google.com/signup"
                target="_blank"
                rel="noopener noreferrer">
                
                    <img src="/Google.png"
                    alt="구글 로고" />
                    <span>
                     구글로 로그인
                     </span>
                   </a>
                <a className="sns-button"
                 href="https://accounts.kakao.com/weblogin/create_account"
                 target="_blank"
                 rel="noopener noreferrer">
                    <img src="/Kakao.png"
                    alt="카카오 로고" />
                    <span>
                     카카오로 로그인
                     </span>
                  </a>
                </div>
           </div>
        </div>
        <div className="image-section">
            <img src="/image.png"
            alt="MO:UM 목표 저축 캐릭터" />
        </div>
        </section>
        </main>

    );
}