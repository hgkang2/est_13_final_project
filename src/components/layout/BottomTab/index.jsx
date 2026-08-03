"use client";

import { useState } from "react";
import styles from "./BottomTab.module.scss";

// 페이지 구현 후 공통 navigation 데이터로 분리 예정
const menus = [
  { label: "홈", icon: "home" },
  { label: "가계부", icon: "description" },
  { label: "분석", icon: "donut_large" },
  { label: "목표", icon: "add_task" },
  { label: "챌린지", icon: "military_tech" },
  { label: "프로필", icon: "person" },
];

// 페이지 구현 후 Link 연결 및 공통 navigation 데이터 사용 예정
// const menus = [
//   { label: "홈", icon: "home", href: "/home" },
//   { label: "가계부", icon: "description", href: "/transactions" },
//   { label: "분석", icon: "donut_large", href: "/analysis" },
//   { label: "목표", icon: "add_task", href: "/goals" },
//   { label: "챌린지", icon: "military_tech", href: "/challenge" },
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
