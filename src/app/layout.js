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
        <Header isLoggedIn={false} />
        <main>{children}</main>
      </body>
    </html>
  );
}
