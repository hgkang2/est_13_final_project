import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";
import styles from "./Analysis.module.scss";

export default function Analysis() {
  return (
    <>
      <div className={styles.pageLayout}>
        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 영역 */}
        <main className={styles.container}>
          {/* 페이지 내부 콘텐츠가 들어갈 자리 */}
        </main>
      </div>

      {/* 서브 푸터 */}
      <SubFooter />

      {/* 모바일 하단 탭 */}
      <BottomTab />
    </>
  );
}
