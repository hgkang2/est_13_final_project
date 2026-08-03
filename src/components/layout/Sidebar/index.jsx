"use client";

import { useState } from "react";
import styles from "./Sidebar.module.scss";

const menus = [
  { label: "홈", icon: "home" },
  { label: "가계부", icon: "description" },
  { label: "분석", icon: "donut_large" },
  { label: "목표", icon: "add_task" },
  { label: "챌린지", icon: "military_tech" },
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

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState("홈");

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation} aria-label="서브 페이지 메뉴">
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
                  className={`material-icons ${styles.menuIcon}`}
                  aria-hidden="true"
                >
                  {menu.icon}
                </span>

                <span>{menu.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.goalArea}>
        <div className={styles.goalCard}>
          <div>
            <p className={styles.goalTitle}>아이패드 구매 중</p>
            <p className={styles.goalPercent}>68% 달성</p>
          </div>

          <div className={styles.goalImage}></div>

          <div className={styles.progress}>
            <div className={styles.progressBar}></div>
          </div>
        </div>
      </div>

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
          <button type="button" className={styles.optionItem}>
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
