"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  const hideHeader =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/passwordConfirm";

  if (hideHeader) return null;

  return <Header isLoggedIn={false} />;
}