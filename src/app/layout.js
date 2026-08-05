import Header from "@/components/layout/Header";
import "./globals.scss";

export const metadata = {
  title: "모음",
  description: "오늘을 모아, 원하는 내일로",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* 인증 연동 후 실제 로그인 상태로 교체 */}
        <Header isLoggedIn={false} />
        {children}
      </body>
    </html>
  );
}
