import Image from "next/image";
import styles from "../SubHome.module.scss";

export default function GreetingSection({ userName }) {
  return (
    <section className={styles.greeting} aria-labelledby="greeting-title">
      <div className={styles.greetingTitle}>
        <h1 id="greeting-title">안녕하세요, {userName}님!</h1>

        <Image
          src="/images/challenge/sprout.png"
          alt=""
          width={40}
          height={40}
          aria-hidden="true"
        />
      </div>

      <p>오늘도 작은 실천으로 더 나은 내일을 만들어봐요</p>
    </section>
  );
}
