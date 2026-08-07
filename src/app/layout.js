
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Header from "@/components/layout/Header";
import "./globals.scss";

export const metadata = {
    title: "MO:UM",
    description: "MO:UM 프로젝트",
};
 export default function RootLayout({ children }) {
   return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&"
        />
      </head>
    <body>
       {/* 인증 연동 후 실제 로그인 상태로 교체 */}
        <HeaderWrapper />
      </body>
    </html>
   );
 }
