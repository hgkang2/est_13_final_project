"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomTab.module.scss";

const menus = [
  { label: "홈", icon: "home", href: "/sub-home" },
  { label: "가계부", icon: "description", href: "/transaction" },
  { label: "분석", icon: "donut_large", href: "/sub-analysis" },
  { label: "목표", icon: "add_task", href: "/sub-goalsetting" },
  { label: "챌린지", icon: "military_tech", href: "/sub-challenge" },
  { label: "프로필", icon: "person", href: "/my-page" },
];

export default function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomTab} aria-label="서브 페이지 메뉴">
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
                  className={`${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  <span
                    className={`material-icons-outlined ${styles.menuIcon}`}
                    aria-hidden="true"
                  >
                    {menu.icon}
                  </span>

                  <span className={styles.menuLabel}>{menu.label}</span>
                </Link>
              ) : (
                <button type="button" className={styles.menuItem} disabled>
                  <span
                    className={`material-icons-outlined ${styles.menuIcon}`}
                    aria-hidden="true"
                  >
                    {menu.icon}
                  </span>

                  <span className={styles.menuLabel}>{menu.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
