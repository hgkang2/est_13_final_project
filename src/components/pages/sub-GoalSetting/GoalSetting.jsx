import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./MyPage.module.scss";

export default function MyPage() {
  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <main className={styles.container}></main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
