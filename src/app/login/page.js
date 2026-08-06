import { createClient } from "@/lib/supabase/client";
import "../auth.css";
import Link from "next/link";

export default function LoginPage() {
     /*const supabase = createClient();
     const handleGoogleLogin = async() => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/mypage`,
            },
        });
        if (error) {
            console.error(error.message);
        }
            
     };*/


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
        className="tab active"
        href="/login">로그인</Link>
        <Link className="tab"
        href="/register">회원가입</Link>
        <Link className="tab"
        href="/passwordConfirm">비밀번호 찾기</Link>
        </nav>

        <form className="form">
        <div className="input">
        <label htmlFor="userId">아이디</label>
        <input
        id="userId"
        name="userId"
        type="text"
        placeholder="아이디를 입력하세요" />
        </div>
        <div className="input">
            <label htmlFor="password">비밀번호</label>
            <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요" />
        </div>
        <button className="button" type="submit">로그인</button>
        </form>
        <div className="sns">
            <div className="sns-title">
                <span />
                <p>SNS로 계속하기</p>
                <span />
            </div>
            <div className="sns-buttons">
                <a className="sns-button"
                href="https://accounts.google.com/"
                target="_blank"
                rel="noopener noreferrer">
                    <img src="/Google.png"
                    alt="구글 로고" />
                    <span>
                     구글로 로그인
                     </span>
                     </a>
                <a className="sns-button"
                href="https://accounts.kakao.com/login/"
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