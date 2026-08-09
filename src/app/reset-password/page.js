"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
     if (password.length < 6) {
        alert("비밀번호는 6자 이상 입력해주세요.");
        return;
     }
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("비밀번호가 변경되었습니다.새 비밀번호로 로그인해주세요.");
    router.push("/login");
  };

  return (
    <div className="reset-overlay">
    <div className="reset-modal">
      <form onSubmit={handleUpdatePassword}>
        <h2>새 비밀번호 설정</h2>

        <input
          type="password"
          placeholder="새 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">
          비밀번호 변경
        </button>
      </form>
    </div>
    </div>
  );
}