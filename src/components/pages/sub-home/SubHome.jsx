import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./SubHome.module.scss";

export default function SubHome() {
  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <main className={styles.main}>
          <div className="container">
            <div className={styles.content}>서브홈 콘텐츠</div>
          </div>
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
