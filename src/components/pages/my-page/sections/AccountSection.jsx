import styles from "../MyPage.module.scss";

const accountItems = [
  { icon: "person", label: "닉네임", value: "닉네임" },
  { icon: "alternate_email", label: "이메일", value: "" },
  { icon: "calendar_today", label: "가입 날짜", value: "" },
  { icon: "alarm", label: "알림 설정", value: "꺼짐" },
];

export default function AccountSection({ onEdit }) {
  return (
    <section className={styles.account}>
      <h2 className="card-head">계정 관리</h2>

      <div className={styles.accountList}>
        {accountItems.map((item) => (
          <div className={styles.accountRow} key={item.label}>
            <div className={styles.accountLabel}>
              <span className="material-icons icon-m">{item.icon}</span>
              <span className="body-m">{item.label}</span>
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
