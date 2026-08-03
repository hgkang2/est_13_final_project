"use client";

import { useState } from "react";
import styles from "./BottomTab.module.scss";

const menus = [
  { label: "홈", icon: "home" },
  { label: "가계부", icon: "description" },
  { label: "분석", icon: "pie_chart" },
  { label: "목표", icon: "task_alt" },
  { label: "챌린지", icon: "emoji_events" },
  { label: "프로필", icon: "person" },
];

// 페이지 구현 후 Link 연결
// const menus = [
//   { label: "홈", icon: "home", href: "/home" },
//   { label: "가계부", icon: "description", href: "/transactions" },
//   { label: "분석", icon: "pie_chart", href: "/analysis" },
//   { label: "목표", icon: "task_alt", href: "/goals" },
//   { label: "챌린지", icon: "emoji_events", href: "/challenge" },
//   { label: "프로필", icon: "person", href: "/profile" },
// ];

export default function BottomTab() {
  const [activeMenu, setActiveMenu] = useState("홈");

  return (
    <nav className={styles.bottomTab} aria-label="서브 페이지 메뉴">
      <ul className={styles.menuList}>
        {menus.map(menu => (
          <li key={menu.label}>
            <button
              type="button"
              className={`${styles.menuItem} ${
                activeMenu === menu.label ? styles.active : ""
              }`}
              onClick={() => setActiveMenu(menu.label)}
            >
              <span
                className={`material-icons-outlined ${styles.menuIcon}`}
                aria-hidden="true"
              >
                {menu.icon}
              </span>

              <span className={styles.menuLabel}>{menu.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
