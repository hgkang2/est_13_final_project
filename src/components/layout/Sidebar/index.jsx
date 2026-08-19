"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./Sidebar.module.scss";

const menus = [
  { label: "홈", icon: "home", href: "/sub-home" },
  { label: "가계부", icon: "description", href: "/transaction" },
  { label: "분석", icon: "donut_large", href: "/sub-analysis" },
  { label: "목표", icon: "add_task", href: "/sub-goalsetting" },
  { label: "챌린지", icon: "military_tech", href: "/sub-challenge" },
  { label: "프로필", icon: "person", href: "/my-page" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [focusGoal, setFocusGoal] = useState(null);

  useEffect(() => {
    const loadFocusGoal = async () => {
      const goalSupabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await goalSupabase.auth.getUser();

      if (userError || !user) {
        setFocusGoal(null);
        return;
      }

      const { data, error } = await goalSupabase
        .from("saving_goals")
        .select("id, title, current_amount, target_amount")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .eq("focus_order", 1)
        .maybeSingle();

      if (error) {
        console.error("사이드바 집중목표 조회 실패:", error);
        setFocusGoal(null);
        return;
      }

      setFocusGoal(data ?? null);
    };

    loadFocusGoal();
  }, [pathname]);

  const goalPercent = focusGoal
    ? Math.min(
        100,
        Math.round(
          (Number(focusGoal.current_amount) / Number(focusGoal.target_amount)) *
            100,
        ),
      )
    : 0;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 실패:", error);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation} aria-label="서브 페이지 메뉴">
        <ul className={styles.menuList}>
          {menus.map(menu => {
            const isActive =
              menu.href &&
              (pathname === menu.href || pathname.startsWith(`${menu.href}/`));

            return (
              <li key={menu.label}>
                {menu.href ? (
                  <Link
                    href={menu.href}
                    prefetch={false}
                    className={`${styles.menuItem} ${
                      isActive ? styles.active : ""
                    }`}
                  >
                    <span
                      className={`material-icons ${styles.menuIcon}`}
                      aria-hidden="true"
                    >
                      {menu.icon}
                    </span>

                    <span>{menu.label}</span>
                  </Link>
                ) : (
                  <button type="button" className={styles.menuItem} disabled>
                    <span
                      className={`material-icons ${styles.menuIcon}`}
                      aria-hidden="true"
                    >
                      {menu.icon}
                    </span>

                    <span>{menu.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {focusGoal && (
        <div className={styles.goalArea}>
          <div className={styles.goalCard}>
            <div>
              <p className={styles.goalTitle}>{focusGoal.title}</p>
              <p className={styles.goalPercent}>{goalPercent}% 달성</p>
            </div>

            <div
              className={styles.progress}
              role="progressbar"
              aria-label={`${focusGoal.title} 달성률`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={goalPercent}
            >
              <div
                className={styles.progressBar}
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <ul className={styles.optionList}>
        <li>
          <button type="button" className={styles.optionItem}>
            <span
              className={`material-icons-outlined ${styles.optionIcon}`}
              aria-hidden="true"
            >
              settings
            </span>
            <span>설정</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            className={styles.optionItem}
            onClick={handleLogout}
          >
            <span
              className={`material-icons-outlined ${styles.optionIcon}`}
              aria-hidden="true"
            >
              logout
            </span>
            <span>로그아웃</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}
