import styles from "../MyPage.module.scss";

export default function MessageSection() {
  return (
    <section className={styles.MyPage_Message}>
      <p>
        &ldquo;천천히 가도 괜찮아요.
        <br />
        <strong>멈추지 않는다면</strong> 목표에 가까워지고 있으니까요.&rdquo;
      </p>

      <img
        src="/images/mypage/moa-character-banner.png"
        alt="응원하는 모아 캐릭터"
        className={styles.Character_Image}
      />
    </section>
  );
}
