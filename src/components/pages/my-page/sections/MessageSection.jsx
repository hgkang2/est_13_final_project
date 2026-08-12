import styles from "../MyPage.module.scss";

const messages = [
  {
    first: "천천히 가도 괜찮아요.",
    point: "멈추지 않는다면",
    last: " 목표에 가까워지고 있으니까요.",
    image: "/images/mypage/moa-character-banner.png",
  },
];

export default function MessageSection() {
  const message = messages[0];

  return (
    <section className={styles.message}>
      <p className="heading-s">
        “{message.first}
        <br />
        <span>{message.point}</span>
        {message.last}”
      </p>

      <img src={message.image} alt="" width={544} height={182} />
    </section>
  );
}
