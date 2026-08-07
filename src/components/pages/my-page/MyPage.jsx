import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";

import ProfileSection from "./sections/ProfileSection";
import AccountSection from "./sections/AccountSection";
import GrowthSection from "./sections/GrowthSection";
import StatsSection from "./sections/StatsSection";
import MessageSection from "./sections/MessageSection";

import styles from "./MyPage.module.scss";

export default function MyPage() {
  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <main className={styles.container}>
          <ProfileSection />
          <AccountSection />
          <GrowthSection />
          <StatsSection />
          <MessageSection />
        </main>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
