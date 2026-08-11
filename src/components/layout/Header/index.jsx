"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/common/Logo";
import { createClient } from "@/utils/supabase/client";

import styles from "./Header.module.scss";

const menus = [
  {
    id: "service",
    label: "서비스 소개",
    href: "/introduce#service",
  },
  {
    id: "qna",
    label: "Q&A",
    href: "/introduce#qna",
  },
  {
    id: "support",
    label: "고객센터",
    href: "/introduce#support",
  },
  {
    id: "ai",
    label: "모아 AI",
    href: "/introduce#ai",
  },
  {
    id: "news",
    label: "모음 소식",
    href: "/introduce#news",
  },
];

export default function Header() {
  const pathname = usePathname();

  const [activeSection, setActiveSection] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const isIntroducePage = pathname.startsWith("/introduce");

  useEffect(() => {
    if (!isIntroducePage) {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const sections = menus.map((menu) => document.getElementById(menu.id)).filter(Boolean);

      const headerOffset = 150;

      let currentSection = "service";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;

        if (window.scrollY >= sectionTop - headerOffset) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isIntroducePage]);

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
        setUserName("");

        return;
      }

      setUserName(profile?.nickname ?? "");
      setIsLoggedIn(true);
    };

    fetchUser();
  }, []);

  return (
    <header className={`${styles.header} ${isIntroducePage ? styles.sticky : ""}`}>
      <div className={styles.inner}>
        <div className={styles.logoArea}>
          <Logo className={styles.logo} />
        </div>

        <nav className={styles.navigation} aria-label="주요 메뉴">
          <ul className={styles.menuList}>
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link
                  href={menu.href}
                  className={`${styles.menuLink} ${isIntroducePage && activeSection === menu.id ? styles.active : ""}`}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className={styles.userButton} href={isLoggedIn ? "/my-page" : "/login"}>
          <span className={`material-icons ${styles.userIcon}`} aria-hidden="true">
            account_circle
          </span>

          <span>{isLoggedIn ? `${userName || "모아"}님` : "시작하기"}</span>
        </Link>
      </div>
    </header>
  );
}
