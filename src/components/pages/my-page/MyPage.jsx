"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
  const [supabase] = useState(() => createClient());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState({
    nickname: "",
    email: "",
    phone: "",
    createdAt: "",
    notification: false,
    image: "",
  });
  const [activeGoalCount, setActiveGoalCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return setError("사용자 정보를 불러오지 못했습니다.");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();

      if (profileError) return setError("프로필을 불러오지 못했습니다.");

      const { count } = await supabase
        .from("saving_goals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "in_progress");

      setActiveGoalCount(count ?? 0);

      setProfile({
        nickname: data.nickname ?? "",
        email: user.email ?? "",
        phone: user.user_metadata?.phone ?? "",
        createdAt: new Date(user.created_at).toLocaleDateString("ko-KR"),
        notification: user.user_metadata?.notification ?? false,
        image: user.user_metadata?.avatar_url ?? "",
      });
    };

    loadProfile();
  }, [supabase]);

  const handleSave = async (updatedProfile) => {
    setError("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("로그인 정보를 확인할 수 없습니다.");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ nickname: updatedProfile.nickname })
      .eq("id", user.id);
    if (profileError) throw profileError;

    const authChanges = {
      data: {
        ...user.user_metadata,
        phone: updatedProfile.phone,
        notification: updatedProfile.notification,
      },
    };
    if (updatedProfile.email !== user.email) authChanges.email = updatedProfile.email;
    if (updatedProfile.password) authChanges.password = updatedProfile.password;

    const { error: authError } = await supabase.auth.updateUser(authChanges);
    if (authError) throw authError;

    setProfile((previous) => ({ ...previous, ...updatedProfile, password: undefined }));

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
            <h1 className={styles.srOnly}>마이페이지</h1>

            <ProfileSection
              profile={profile}
              activeGoalCount={activeGoalCount}
            />

            <AccountSection
              profile={profile}
              onEdit={() => setIsEditOpen(true)}
            />

            <GrowthSection />
            <StatsSection />
            <MessageSection />
            {error && <p role="alert">{error}</p>}
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
