import styles from "./SubFooter.module.scss";

export default function SubFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <p className={styles.copyright}>© 2026 MO:UM. All rights reserved.</p>

          <nav aria-label="푸터 메뉴">
            <ul className={styles.menuList}>
              <li>
                <span className={styles.menuLink}>이용 약관</span>
              </li>

              <li>
                <span className={styles.menuLink}>개인정보처리방침</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
