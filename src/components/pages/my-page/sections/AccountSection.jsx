import styles from "../MyPage.module.scss";

const accountItems = [
  {
    icon: "person",
    label: "닉네임",
    value: "모아",
  },
  {
    icon: "alternate_email",
    label: "이메일",
    value: "ESTFE13MOAUM@google.com",
  },
  {
    icon: "calendar_today",
    label: "가입 날짜",
    value: "2026.04.07",
  },
  {
    icon: "notifications",
    label: "알림 설정",
    value: "켜짐",
  },
];

export default function AccountSection() {
  return (
    <section className={styles.MyPage_Account}>
      <h2>계정 관리</h2>

      <dl className={styles.Account_List}>
        {accountItems.map((item) => (
          <div key={item.label} className={styles.Account_Item}>
            <dt>
              <span className={styles.Account_Icon}>{item.icon}</span>

              <span className={styles.Account_Label}>{item.label}</span>
            </dt>

            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <button type="button" className={styles.Edit_Button}>
        정보 수정
      </button>
    </section>
  );
}
