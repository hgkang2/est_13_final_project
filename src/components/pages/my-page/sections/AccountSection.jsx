import styles from "../MyPage.module.scss";

export default function AccountSection({ profile, onEdit }) {
  const accountItems = [
    { icon: "person", label: "닉네임", value: profile.nickname },
    { icon: "alternate_email", label: "이메일", value: profile.email },
    { icon: "calendar_today", label: "가입 날짜", value: profile.createdAt },
    {
      icon: "alarm",
      label: "알림 설정",
      value: profile.notification ? "켬" : "꺼짐",
    },
  ];

  return (
    <section className={styles.account}>
      <h2 className="card-head">계정 관리</h2>

      <div className={styles.accountList}>
        {accountItems.map((item) => (
          <div className={styles.accountRow} key={item.label}>
            <div className={styles.accountLabel}>
              <span className="material-icons icon-m">{item.icon}</span>

              <span className={`body-m ${styles.accountLabelText}`}>
                {item.label}
              </span>
            </div>

            <span className={`body-m ${styles.accountValue}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`body-m ${styles.editButton}`}
        onClick={onEdit}
      >
        정보 수정
      </button>
    </section>
  );
}
