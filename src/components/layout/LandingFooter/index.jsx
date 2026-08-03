import Link from "next/link";
import Logo from "@/components/common/Logo";
import styles from "./LandingFooter.module.scss";

const footerMenus = [
  {
    title: "서비스",
    links: [
      { label: "서비스 소개", href: "/service" },
      { label: "기능", href: "/features" },
      { label: "가격 안내", href: "/pricing" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "자주 묻는 질문", href: "/faq" },
      { label: "문의 하기", href: "/contact" },
      { label: "이용 가이드", href: "/guide" },
    ],
  },
  {
    title: "프로젝트",
    links: [
      { label: "프로젝트 소개", href: "/project" },
      { label: "이용 약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
    ],
  },
];

const socialLinks = [
  { label: "공유하기", icon: "share", href: "#" },
  { label: "공식 사이트", icon: "public", href: "#" },
  { label: "이메일", icon: "mail", href: "#" },
  { label: "GitHub", icon: "code", href: "#" },
];

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandArea}>
          <div className={styles.brandContent}>
            <Logo className={styles.logo} />

            <div className={styles.description}>
              <p>작은 습관이 내일의 큰 변화를 만듭니다.</p>
              <p>MO:UM과 함께 더 나은 미래를 만들어 가세요.</p>
            </div>
          </div>

          <ul className={styles.socialList}>
            {socialLinks.map(link => (
              <li key={link.label}>
                <a
                  className={styles.socialLink}
                  href={link.href}
                  aria-label={link.label}
                >
                  <span className="material-icons" aria-hidden="true">
                    {link.icon}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className={styles.menuArea} aria-label="푸터 메뉴">
          {footerMenus.map(menu => (
            <div key={menu.title} className={styles.menuGroup}>
              <h2 className={styles.menuTitle}>{menu.title}</h2>

              <ul className={styles.menuList}>
                {menu.links.map(link => (
                  <li key={link.label}>
                    <Link className={styles.menuLink} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>© 2026 MO:UM. All rights reserved.</p>
      </div>
    </footer>
  );
}
