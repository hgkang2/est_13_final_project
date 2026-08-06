
import "./globals.css";

export const metadata = {
    title: "MO:UM",
    description: "MO:UM 프로젝트",
};
 export default function RootLayout({ children }) {
   return (
    <html lang="ko">
    <body>{children}</body>
    </html>
   );
 }
