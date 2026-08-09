import Link from "next/link";
import Logo from "@/components/common/Logo";
import styles from "./Header.module.scss";

// GNB 동작 및 경로 확정 후 Link 연결
const menus = ["서비스 소개", "Q&A", "고객센터", "모아 AI", "모음 소식"];

// const menus = [
//   { label: "서비스 소개", href: "/service" },
//   { label: "Q&A", href: "/qna" },
//   { label: "고객센터", href: "/support" },
//   { label: "모아 AI", href: "/ai" },
//   { label: "모음 소식", href: "/news" },
// ];

export default function Header({ isLoggedIn = false, userName = "모아" }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.logoArea}>
          <Link href="/" aria-label="모음 홈으로 이동">
            <Logo className={styles.logo} />
          </Link>
        </h1>

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

          <span>{isLoggedIn ? `${userName}님` : "시작하기"}</span>
        </Link>
      </div>
    </header>
  );
}
