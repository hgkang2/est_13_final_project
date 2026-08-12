import ServiceSection from "@/components/introduce/ServiceSection";
import QnASection from "@/components/introduce/QnASection";
import SupportSection from "@/components/introduce/SupportSection";
import AiSection from "@/components/introduce/AiSection";
import NewsSection from "@/components/introduce/NewsSection";

export default function IntroducePage() {
  return (
    <>
      <main>
        <ServiceSection />
        <QnASection />
        <SupportSection />
        <AiSection />
        <NewsSection />
      </main>
    </>
  );
}
