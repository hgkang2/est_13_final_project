"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { createClient } from "@/utils/supabase/client";
import styles from "./Header.module.scss";

// GNB 동작 및 경로 확정 후 Link 연결
const menus = ["서비스 소개", "Q&A", "고객센터", "모아 AI", "모음 소식"];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsLoggedIn(false);
        setUserName("");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("프로필 조회 실패:", profileError);
        setIsLoggedIn(true);
        return;
      }

      setUserName(profile?.nickname ?? "");
      setIsLoggedIn(true);
    };

    fetchUser();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logoArea}>
          <Logo className={styles.logo} />
        </div>

        <nav className={styles.navigation} aria-label="주요 메뉴">
          <ul className={styles.menuList}>
            {menus.map(menu => (
              <li key={menu} className={styles.menuLink}>
                {menu}
              </li>
            ))}
          </ul>
        </nav>

        <Link
          className={styles.userButton}
          href={isLoggedIn ? "/my-page" : "/login"}
        >
          <span
            className={`material-icons ${styles.userIcon}`}
            aria-hidden="true"
          >
            account_circle
          </span>

          <span>{isLoggedIn ? `${userName || "모아"}님` : "시작하기"}</span>
        </Link>
      </div>
    </header>
  );
}
