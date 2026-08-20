"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./CTA.module.scss";

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.inner}>
        <div className={styles.scrollArrow} aria-hidden="true">
          <span />
          <span />
        </div>

        <div className={styles.CTAcard}>
          <div className={styles.textArea}>
            <h2 className={`heading-m-plus`}>
              지금 바로
              <br />
              <strong>똑똑한 소비 습관</strong>을 시작하세요!
            </h2>
          </div>
          <Link href="/login" className={styles.ctaButton}>
            <Image src="/images/home/cta_btn.png" width={403} height={103} alt="무료로 시작하기" />
          </Link>
        </div>
      </div>
    </section>
  );
}
