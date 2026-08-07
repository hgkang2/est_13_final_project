
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
    <body>
       {/* 인증 연동 후 실제 로그인 상태로 교체 */}
        
        <HeaderWrapper />
        {children}
      </body>
    </html>
   );
 }
