"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.scss";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.notFound}>
      <Image
        src="/images/character/404_moa.png"
        alt=""
        width={360}
        height={270}
        priority
      />

      <h1>404</h1>
      <h2>앗, 페이지를 찾을 수 없어요</h2>
      <p>잘못된 주소이거나 존재하지 않는 페이지예요.</p>

      <div className={styles.actions}>
        <Link href="/" className={styles.homeButton}>
          홈으로 가기
        </Link>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
        >
          이전 페이지
        </button>
      </div>
    </main>
  );
}
