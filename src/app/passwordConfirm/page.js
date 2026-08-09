"use client";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PasswordConfirmPage() {
    const router = useRouter();
    const supabase = createClient();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if(error) {
            alert(error.message);
            console.error(error);
            return;
        }
        alert("비밀번호 재설정 메일을 발송했습니다.이메일을 확인해주세요.");
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
        <Link className="tab"
        href="/register">회원가입</Link>
        <Link className="tab active"
        href="/passwordConfirm">비밀번호 찾기</Link>
        </nav>

        <form className="form" 
        onSubmit={handlePasswordReset}>
        
        <div className="input">
        <label htmlFor="email">이메일</label>
        <input
        id="email"
        name="email"
        type="email"
        placeholder="가입한 이메일 주소를 입력하세요" />
        </div>
        
        <button className="button" type="submit">비밀번호 찾기</button>
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