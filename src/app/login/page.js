"use client";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {

    const router = useRouter();
    const supabase = createClient();

     const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            //alert("이메일 또는 비밀번호가 올바르지 않습니다.");
            alert(error.message);
            console.error(error);
            return;
        }
        router.push("/");
     };

     const handleGoogleLogin = async() => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        if (error) {
            console.error(error.message);
        }
    };
     const handleKakaoLogin = async() => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "kakao",
            options: {
                redirectTo: `${window.location.origin}/`,
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

        <form className="form" 
        onSubmit={handleLogin}>

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
        <button className="button" type="submit">로그인</button>
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
                  onClick={handleGoogleLogin}>
                    <img src="/images/auth/Google.png"
                    alt="구글 로고" />
                    <span>
                     구글로 로그인
                     </span>
                     </button>
                     
                <button 
                  type="button"
                  className="sns-button"
                  onClick={handleKakaoLogin}>
                    <img src="/images/auth/Kakao.png"
                    alt="카카오 로고" />
                    <span>
                     카카오로 로그인
                     </span>
                </button>
            </div>
        </div>
        </div>
        <div className="image-section">
            <img src="/images/auth/image.png"
            alt="MO:UM 목표 저축 캐릭터" />
        </div>
        </section>
        </main>

    );
}