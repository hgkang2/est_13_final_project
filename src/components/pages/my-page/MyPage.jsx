"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import BottomTab from "@/components/layout/BottomTab";
import SubFooter from "@/components/layout/SubFooter";

import ProfileSection from "./sections/ProfileSection";
import AccountSection from "./sections/AccountSection";
import GrowthSection from "./sections/GrowthSection";
import StatsSection from "./sections/StatsSection";
import MessageSection from "./sections/MessageSection";
import ProfileEditForm from "./sections/ProfileEditForm";

import styles from "./MyPage.module.scss";

export default function MyPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [profile, setProfile] = useState({
    nickname: "닉네임",
    email: "",
    phone: "",
    createdAt: "2026.04.07",
    notification: false,
    image: "",
  });

  const handleSave = (updatedProfile) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      ...updatedProfile,
    }));

    setIsEditOpen(false);
  };

  return (
    <>
      <div className={styles.pageLayout}>
        <Sidebar />

        <div
          className={`${styles.pageContent} ${
            isEditOpen ? styles.isEditing : ""
          }`}
        >
          <main className={`container ${styles.main}`}>
            <ProfileSection />

            <AccountSection
              profile={profile}
              onEdit={() => setIsEditOpen(true)}
            />

            <GrowthSection />
            <StatsSection />
            <MessageSection />
          </main>

          {isEditOpen && (
            <ProfileEditForm
              initialProfile={profile}
              onClose={() => setIsEditOpen(false)}
              onSave={handleSave}
            />
          )}
        </div>
      </div>

      <SubFooter />
      <BottomTab />
    </>
  );
}
