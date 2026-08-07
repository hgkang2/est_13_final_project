import Image from "next/image";
import styles from "./Logo.module.scss";

export default function Logo({ className = "" }) {
  return (
    <Image
      className={`${styles.logo} ${className}`}
      src="/images/common/logo.svg"
      width={293}
      height={103}
      alt="오늘을 모아, 원하는 내일로"
      loading="lazy"
    />
  );
}
