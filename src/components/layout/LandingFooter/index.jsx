import Logo from "@/components/common/Logo";
import styles from "./LandingFooter.module.scss";

const footerMenus = [
  {
    title: "서비스",
    links: ["서비스 소개", "기능", "가격 안내"],
  },
  {
    title: "고객지원",
    links: ["자주 묻는 질문", "문의 하기", "이용 가이드"],
  },
  {
    title: "프로젝트",
    links: ["프로젝트 소개", "이용 약관", "개인정보처리방침"],
  },
];

const socialLinks = [
  { label: "공유하기", icon: "share" },
  { label: "공식 사이트", icon: "public" },
  { label: "이메일", icon: "mail" },
  { label: "GitHub", icon: "code" },
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
              <li key={link.label} className={styles.socialLink}>
                <span className="material-icons" aria-hidden="true">
                  {link.icon}
                </span>
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
                  <li key={link} className={styles.menuLink}>
                    {link}
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
